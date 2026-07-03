import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Loader2, ExternalLink, Copy, Check, Image as ImageIcon, Music2, Download, LogIn, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const emptyForm = {
  artist_name: '',
  genre: '',
  bio: '',
  photo_urls: [],
  spotify_url: '',
  music_links: [],
  live_video_url: '',
  notable_wins: '',
  upcoming_dates: '',
  stage_plot_url: '',
  contact_email: '',
  slug: '',
};

const DRAFT_KEY = 'roaduno_epk_draft';

const EPKBuilderPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wantsAutoSaveAfterAuth, setWantsAutoSaveAfterAuth] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load: prefer an in-progress local draft over the saved DB version,
  // since the draft represents newer, not-yet-saved edits.
  useEffect(() => {
    const loadEpk = async () => {
      let dbForm = null;
      if (user) {
        try {
          const { data, error } = await supabase
            .from('epks')
            .select('*')
            .eq('artist_id', user.id)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            setExistingId(data.id);
            setIsPublished(data.is_published || false);
            dbForm = {
              artist_name: data.artist_name || '',
              genre: data.genre || '',
              bio: data.bio || '',
              photo_urls: data.photo_urls || [],
              spotify_url: data.spotify_url || '',
              music_links: data.music_links || [],
              live_video_url: data.live_video_url || '',
              notable_wins: data.notable_wins || '',
              upcoming_dates: data.upcoming_dates || '',
              stage_plot_url: data.stage_plot_url || '',
              contact_email: data.contact_email || '',
              slug: data.slug || '',
            };
          }
        } catch (err) {
          console.error('Error loading EPK:', err);
        }
      }

      let draft = null;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) draft = JSON.parse(raw);
      } catch {
        // ignore malformed draft
      }

      const initial = draft || dbForm;
      if (initial) {
        setForm({ ...emptyForm, ...initial });
        if (initial.slug) setSlugManuallyEdited(true);
      }
      setLoading(false);
      setHasLoadedOnce(true);
    };
    loadEpk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-save every change to localStorage so navigating away and back doesn't lose work.
  useEffect(() => {
    if (!hasLoadedOnce) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // storage unavailable, non-fatal
    }
  }, [form, hasLoadedOnce]);

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'artist_name' && !slugManuallyEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const updateSlug = (value) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!user) {
      toast({ title: 'Login required', description: 'Create a free account to upload photos.', variant: 'destructive' });
      return;
    }
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('epk-photos').upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('epk-photos').getPublicUrl(path);
      setForm((prev) => ({ ...prev, photo_urls: [...prev.photo_urls, data.publicUrl] }));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhotoUrl = (i) =>
    setForm((prev) => ({ ...prev, photo_urls: prev.photo_urls.filter((_, idx) => idx !== i) }));

  const addMusicLink = () => setForm((prev) => ({ ...prev, music_links: [...prev.music_links, { label: '', url: '' }] }));
  const updateMusicLink = (i, field, value) =>
    setForm((prev) => ({
      ...prev,
      music_links: prev.music_links.map((link, idx) => (idx === i ? { ...link, [field]: value } : link)),
    }));
  const removeMusicLink = (i) =>
    setForm((prev) => ({ ...prev, music_links: prev.music_links.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Log in or create a free account to save and publish your EPK.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.artist_name.trim()) {
      toast({ title: 'Artist name required', variant: 'destructive' });
      return;
    }
    if (!form.slug.trim()) {
      toast({ title: 'A URL slug is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        artist_id: user.id,
        artist_name: form.artist_name,
        genre: form.genre,
        bio: form.bio,
        photo_urls: form.photo_urls.filter((u) => u.trim()),
        spotify_url: form.spotify_url,
        music_links: form.music_links.filter((l) => l.url.trim()),
        live_video_url: form.live_video_url,
        notable_wins: form.notable_wins,
        upcoming_dates: form.upcoming_dates,
        stage_plot_url: form.stage_plot_url,
        contact_email: form.contact_email,
        slug: form.slug,
        is_published: true,
      };

      const { data, error } = await supabase
        .from('epks')
        .upsert(payload, { onConflict: 'artist_id' })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'That URL is taken',
            description: 'Someone else already has that slug. Try a different one.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      setExistingId(data.id);
      setIsPublished(true);
      localStorage.removeItem(DRAFT_KEY);
      toast({ title: 'Live!', description: 'Your EPK is saved and published.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // If someone filled out the form while logged out, clicked "Create Account",
  // and just finished signing up, save what they already wrote instead of losing it.
  useEffect(() => {
    if (user && wantsAutoSaveAfterAuth) {
      setWantsAutoSaveAfterAuth(false);
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDownloadPDF = () => {
    if (!form.artist_name.trim()) {
      toast({ title: 'Add an artist name first', variant: 'destructive' });
      return;
    }
    window.print();
  };

  const publicUrl = form.slug ? `${window.location.origin}/epk/${form.slug}` : '';

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validMusicLinks = form.music_links.filter((l) => l.url.trim());

  if (loading) {
    return (
      <div className="min-h-screen text-paper">
        <Navigation />
        <div className="pt-40 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-marquee" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-paper">
      <Helmet><title>EPK Builder | RoadUno</title></Helmet>
      <div className="print:hidden">
        <Navigation />
      </div>

      <main className="pt-32 pb-20 px-4 max-w-3xl mx-auto print:hidden">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Build Your EPK</h1>
          <p className="text-paper-muted">
            One shareable page for venues and press: bio, music, photos, and stage plot. {!user && (
              <span className="text-marquee">Create a free account to save and publish it.</span>
            )}
          </p>
        </div>

        {existingId && form.slug && isPublished && (
          <div className="ru-card p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded text-xs font-medium bg-routeline/20 text-routeline">Live</span>
              <span className="text-paper-muted truncate max-w-[240px]">{publicUrl}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt font-semibold" onClick={handleCopyLink}>
                {copied ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</>}
              </Button>
              <Button size="sm" variant="outline" className="bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt font-semibold" onClick={() => navigate(`/epk/${form.slug}`)}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
              </Button>
            </div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="ru-card p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-marquee">Basics</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Artist / Act Name</Label>
                <Input value={form.artist_name} onChange={(e) => updateField('artist_name', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="Lowlight Radio" />
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Input value={form.genre} onChange={(e) => updateField('genre', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="dream-pop trio" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => updateField('bio', e.target.value)} className="bg-asphalt/50 border-steel min-h-[120px]" placeholder="75-120 words, third person, lead with your sound and one credible win." />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="booking@youract.com" />
            </div>
            <div className="space-y-2">
              <Label>Your EPK URL</Label>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-paper-muted whitespace-nowrap">roaduno.com/epk/</span>
                <Input value={form.slug} onChange={(e) => updateSlug(e.target.value)} className="bg-asphalt/50 border-steel" placeholder="your-act-name" />
              </div>
            </div>
          </div>

          <div className="ru-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-marquee flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Photos</h2>
              <label className="inline-flex">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoFileChange} disabled={uploadingPhoto} />
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt ${uploadingPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                  {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </span>
              </label>
            </div>
            <p className="text-xs text-paper-muted">2-4 recommended: one portrait, one live shot, one wide banner.</p>
            {form.photo_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {form.photo_urls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-full h-24 object-cover rounded-md border border-steel" />
                    <button
                      onClick={() => removePhotoUrl(i)}
                      className="absolute -top-2 -right-2 bg-taillight rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ru-card p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-marquee flex items-center gap-2"><Music2 className="h-5 w-5" /> Music</h2>

            <div className="space-y-2">
              <Label>Spotify</Label>
              <Input value={form.spotify_url} onChange={(e) => updateField('spotify_url', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="https://open.spotify.com/artist/..." />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-sm text-paper-muted">Other platforms (SoundCloud, Bandcamp, Apple Music, etc.)</Label>
              <Button size="sm" variant="outline" className="bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt font-semibold" onClick={addMusicLink}><Plus className="h-3.5 w-3.5 mr-1" /> Add Link</Button>
            </div>
            {form.music_links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input value={link.label} onChange={(e) => updateMusicLink(i, 'label', e.target.value)} className="bg-asphalt/50 border-steel w-32 shrink-0" placeholder="SoundCloud" />
                <Input value={link.url} onChange={(e) => updateMusicLink(i, 'url', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="https://..." />
                <Button size="sm" variant="ghost" onClick={() => removeMusicLink(i)}><X className="h-4 w-4 text-taillight" /></Button>
              </div>
            ))}

            <div className="space-y-2 pt-2">
              <Label>Live Video URL (one performance clip)</Label>
              <Input value={form.live_video_url} onChange={(e) => updateField('live_video_url', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div className="ru-card p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-marquee">Credibility & Logistics</h2>
            <div className="space-y-2">
              <Label>Notable Wins</Label>
              <Textarea value={form.notable_wins} onChange={(e) => updateField('notable_wins', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="Support slots, festivals, radio adds, press quotes..." />
            </div>
            <div className="space-y-2">
              <Label>Upcoming Dates</Label>
              <Textarea value={form.upcoming_dates} onChange={(e) => updateField('upcoming_dates', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="A few confirmed shows to prove momentum." />
            </div>
            <div className="space-y-2">
              <Label>Stage Plot URL</Label>
              <Input value={form.stage_plot_url} onChange={(e) => updateField('stage_plot_url', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="Link to a PDF or image" />
            </div>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-marquee hover:bg-marquee-hover text-asphalt font-semibold py-6 text-lg">
                {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : 'Save & Get Link'}
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt font-semibold py-6 text-lg">
                <Download className="mr-2 h-5 w-5" /> Download PDF
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleDownloadPDF} className="flex-1 bg-marquee hover:bg-marquee-hover text-asphalt font-semibold py-6 text-lg">
                  <Download className="mr-2 h-5 w-5" /> Download as PDF
                </Button>
                <AuthModal
                  defaultTab="signup"
                  trigger={
                    <Button
                      onClick={() => setWantsAutoSaveAfterAuth(true)}
                      variant="outline"
                      className="flex-1 bg-routeline hover:bg-routeline-hover text-asphalt font-semibold py-6 text-lg"
                    >
                      <LogIn className="mr-2 h-5 w-5" /> Create Account for a Link
                    </Button>
                  }
                />
              </div>
              <p className="text-xs text-paper-muted text-center">
                PDF works right now, no account needed. Creating a free account also gets you a shareable link at roaduno.com/epk/{form.slug || 'your-act-name'}, and saves what you've already written here.
              </p>
            </div>
          )}
        </motion.div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>

      {/* Hidden on screen entirely; only rendered into layout when printing */}
      <div className="hidden print:block epk-print-area" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div
          style={{
            background: '#E8A33D',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            padding: '32px 40px',
            marginBottom: '28px',
          }}
        >
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '40px', fontWeight: 700, color: '#16151A', margin: 0, lineHeight: 1.1 }}>
            {form.artist_name || 'Untitled Artist'}
          </h1>
          {form.genre && (
            <p style={{ fontSize: '14px', color: '#3A2B0C', marginTop: '6px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {form.genre}
            </p>
          )}
        </div>

        <div style={{ padding: '0 40px 40px' }}>
          {form.photo_urls?.[0] && (
            <div style={{ marginBottom: '26px' }}>
              <img
                src={form.photo_urls[0]}
                alt={form.artist_name}
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {form.photo_urls?.length > 1 && (
            <div style={{ marginBottom: '26px', display: 'flex', gap: '8px' }}>
              {form.photo_urls.slice(1, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${form.artist_name} ${i + 2}`}
                  style={{ flex: 1, height: '100px', objectFit: 'cover', display: 'block' }}
                />
              ))}
            </div>
          )}

          {form.bio && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: '#16151A', borderLeft: '4px solid #E8A33D', paddingLeft: '10px', marginBottom: '10px',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
              }}>Bio</h2>
              <p style={{ fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#222' }}>{form.bio}</p>
            </div>
          )}

          {(form.spotify_url || validMusicLinks.length > 0) && (
            <div style={{ marginBottom: '26px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: '#16151A', borderLeft: '4px solid #3B8C6E', paddingLeft: '10px', marginBottom: '10px',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
              }}>Music</h2>
              {form.spotify_url && (
                <p style={{ fontSize: '12px', marginBottom: '5px', color: '#222' }}>
                  <span style={{ fontWeight: 600 }}>Spotify:</span> {form.spotify_url}
                </p>
              )}
              {validMusicLinks.map((link, i) => (
                <p key={i} style={{ fontSize: '12px', marginBottom: '5px', color: '#222' }}>
                  <span style={{ fontWeight: 600 }}>{link.label || 'Link'}:</span> {link.url}
                </p>
              ))}
            </div>
          )}

          {form.live_video_url && (
            <div style={{ marginBottom: '26px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: '#16151A', borderLeft: '4px solid #3B8C6E', paddingLeft: '10px', marginBottom: '10px',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
              }}>Live Video</h2>
              <p style={{ fontSize: '12px', color: '#222' }}>{form.live_video_url}</p>
            </div>
          )}

          {(form.notable_wins || form.upcoming_dates) && (
            <div style={{ display: 'flex', gap: '32px', marginBottom: '26px' }}>
              {form.notable_wins && (
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.5px', color: '#16151A', borderLeft: '4px solid #E8A33D', paddingLeft: '10px', marginBottom: '10px',
                    WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
                  }}>Notable Wins</h2>
                  <p style={{ fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#222' }}>{form.notable_wins}</p>
                </div>
              )}
              {form.upcoming_dates && (
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.5px', color: '#16151A', borderLeft: '4px solid #E8A33D', paddingLeft: '10px', marginBottom: '10px',
                    WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
                  }}>Upcoming Dates</h2>
                  <p style={{ fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#222' }}>{form.upcoming_dates}</p>
                </div>
              )}
            </div>
          )}

          {form.stage_plot_url && (
            <div style={{ marginBottom: '26px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: '#16151A', borderLeft: '4px solid #3B8C6E', paddingLeft: '10px', marginBottom: '10px',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
              }}>Stage Plot</h2>
              <p style={{ fontSize: '12px', color: '#222' }}>{form.stage_plot_url}</p>
            </div>
          )}
        </div>

        <div
          style={{
            background: '#16151A',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            padding: '20px 40px',
            marginTop: '10px',
          }}
        >
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9BA1AA', margin: 0, marginBottom: '4px' }}>Contact</p>
          <p style={{ fontSize: '13px', color: '#EDE8DD', margin: 0 }}>{form.contact_email || 'No contact email on file'}</p>
        </div>
      </div>
    </div>
  );
};

export default EPKBuilderPage;