import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Loader2, ExternalLink, Copy, Check, Image as ImageIcon, Music2, Download, LogIn, Upload, FileText } from 'lucide-react';
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
import jsPDF from 'jspdf';

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
  phone_number: '',
  facebook_url: '',
  instagram_url: '',
  slug: '',
};

const DRAFT_KEY = 'roaduno_epk_draft';

const EPKBuilderPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingStagePlot, setUploadingStagePlot] = useState(false);
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
              phone_number: data.phone_number || '',
              facebook_url: data.facebook_url || '',
              instagram_url: data.instagram_url || '',
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

  const handleStagePlotFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!user) {
      toast({ title: 'Login required', description: 'Create a free account to upload a stage plot.', variant: 'destructive' });
      return;
    }
    setUploadingStagePlot(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('epk-stageplots').upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('epk-stageplots').getPublicUrl(path);
      updateField('stage_plot_url', data.publicUrl);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setUploadingStagePlot(false);
    }
  };

  const removeStagePlot = () => {
    updateField('stage_plot_url', '');
  };

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
        phone_number: form.phone_number,
        facebook_url: form.facebook_url,
        instagram_url: form.instagram_url,
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

  // Crops (like CSS object-fit: cover) instead of stretching, so gallery thumbnails
  // in the PDF never look squished into the wrong aspect ratio.
  const loadImageCover = (url, targetW, targetH, radius = 0) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const scale = 2; // render at 2x for a sharper embedded image
          const canvas = document.createElement('canvas');
          canvas.width = targetW * scale;
          canvas.height = targetH * scale;
          const ctx = canvas.getContext('2d');

          // Fill first so rounded corner cutouts blend with the page background
          // instead of showing as blank/transparent (JPEG has no alpha channel).
          ctx.fillStyle = '#181B20';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (radius > 0) {
            const r = radius * scale;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
            ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
            ctx.arcTo(0, canvas.height, 0, 0, r);
            ctx.arcTo(0, 0, canvas.width, 0, r);
            ctx.closePath();
            ctx.clip();
          }

          const srcRatio = img.naturalWidth / img.naturalHeight;
          const targetRatio = targetW / targetH;
          let sx, sy, sw, sh;
          if (srcRatio > targetRatio) {
            sh = img.naturalHeight;
            sw = sh * targetRatio;
            sy = 0;
            sx = (img.naturalWidth - sw) / 2;
          } else {
            sw = img.naturalWidth;
            sh = sw / targetRatio;
            sx = 0;
            sy = (img.naturalHeight - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    if (!form.artist_name.trim()) {
      toast({ title: 'Add an artist name first', variant: 'destructive' });
      return;
    }
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      let y;

      // Subtle dark gradient background, drawn fresh on every page
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 100;
      bgCanvas.height = 130;
      const bgCtx = bgCanvas.getContext('2d');
      const grad = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
      grad.addColorStop(0, '#20242B');
      grad.addColorStop(1, '#14171B');
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
      const bgDataUrl = bgCanvas.toDataURL('image/jpeg', 0.9);

      const drawBackground = () => {
        doc.addImage(bgDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      };

      const checkPageBreak = (needed) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          drawBackground();
          y = margin;
        }
      };

      const sectionHeader = (title, accent = [232, 163, 61]) => {
        checkPageBreak(30);
        doc.setFillColor(...accent);
        doc.rect(margin, y - 10, 3, 14, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...accent);
        doc.text(title.toUpperCase(), margin + 10, y);
        y += 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(225, 225, 225);
      };

      const bodyText = (text) => {
        const lines = doc.splitTextToSize(text, contentWidth);
        lines.forEach((line) => {
          checkPageBreak(14);
          doc.text(line, margin, y);
          y += 14;
        });
        y += 14;
      };

      const linkLine = (label, url, color = [232, 163, 61]) => {
        checkPageBreak(16);
        doc.setTextColor(...color);
        doc.setFont('helvetica', 'bold');
        doc.textWithLink(label, margin, y, { url });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(225, 225, 225);
        y += 16;
      };

      drawBackground();

      // Header band, two-tone: amber body with a thin teal edge.
      // Taller now to fit a contact/social block on the right.
      const headerHeight = 130;
      doc.setFillColor(232, 163, 61);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      doc.setFillColor(59, 140, 110);
      doc.rect(0, headerHeight, pageWidth, 4, 'F');
      doc.setTextColor(22, 21, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(form.artist_name, margin, 56);
      if (form.genre) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(58, 43, 12);
        doc.text(form.genre.toUpperCase(), margin, 78);
      }

      // Contact + social block, right-aligned in the header
      const rightX = pageWidth - margin;
      let contactY = 40;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(22, 21, 26);
      if (form.contact_email) {
        doc.textWithLink(form.contact_email, rightX, contactY, { url: `mailto:${form.contact_email}`, align: 'right' });
        contactY += 15;
      }
      if (form.phone_number) {
        doc.text(form.phone_number, rightX, contactY, { align: 'right' });
        contactY += 15;
      }
      if (form.facebook_url || form.instagram_url) {
        let socialX = rightX;
        if (form.instagram_url) {
          doc.setFont('helvetica', 'bold');
          doc.textWithLink('Instagram', socialX, contactY, { url: form.instagram_url, align: 'right' });
          socialX -= doc.getTextWidth('Instagram') + 14;
        }
        if (form.facebook_url) {
          doc.setFont('helvetica', 'bold');
          doc.textWithLink('Facebook', socialX, contactY, { url: form.facebook_url, align: 'right' });
        }
        doc.setFont('helvetica', 'normal');
      }

      y = headerHeight + 28;
      doc.setTextColor(225, 225, 225);

      if (form.photo_urls[0]) {
        const bannerHeight = 190;
        const dataUrl = await loadImageCover(form.photo_urls[0], contentWidth, bannerHeight, 10);
        if (dataUrl) {
          doc.addImage(dataUrl, 'JPEG', margin, y, contentWidth, bannerHeight, undefined, 'FAST');
          doc.setDrawColor(232, 163, 61);
          doc.setLineWidth(1.2);
          doc.roundedRect(margin, y, contentWidth, bannerHeight, 10, 10, 'S');
          y += bannerHeight + 14;
        }
      }

      const galleryPhotos = form.photo_urls.slice(1, 4);
      if (galleryPhotos.length > 0) {
        const gap = 8;
        const cellWidth = (contentWidth - gap * (galleryPhotos.length - 1)) / galleryPhotos.length;
        const cellHeight = 90;
        const loaded = await Promise.all(galleryPhotos.map((url) => loadImageCover(url, cellWidth, cellHeight, 6)));
        loaded.forEach((dataUrl, i) => {
          if (dataUrl) {
            const x = margin + i * (cellWidth + gap);
            doc.addImage(dataUrl, 'JPEG', x, y, cellWidth, cellHeight, undefined, 'FAST');
            doc.setDrawColor(59, 140, 110);
            doc.setLineWidth(0.8);
            doc.roundedRect(x, y, cellWidth, cellHeight, 6, 6, 'S');
          }
        });
        y += cellHeight + 20;
      } else {
        y += 8;
      }

      if (form.bio) {
        sectionHeader('Bio');
        bodyText(form.bio);
      }

      const validLinks = form.music_links.filter((l) => l.url.trim());
      if (form.spotify_url || validLinks.length > 0) {
        sectionHeader('Music', [232, 163, 61]);
        if (form.spotify_url) linkLine('Spotify', form.spotify_url, [59, 140, 110]);
        validLinks.forEach((l) => linkLine(l.label || 'Listen', l.url, [59, 140, 110]));
        y += 6;
      }

      if (form.live_video_url) {
        sectionHeader('YouTube', [232, 163, 61]);
        linkLine('Live Video', form.live_video_url, [59, 140, 110]);
        y += 6;
      }

      if (form.notable_wins) {
        sectionHeader('Notable Wins');
        bodyText(form.notable_wins);
      }

      if (form.upcoming_dates) {
        sectionHeader('Upcoming Dates');
        bodyText(form.upcoming_dates);
      }

      if (form.stage_plot_url) {
        sectionHeader('Stage Plot', [59, 140, 110]);
        linkLine('View Stage Plot', form.stage_plot_url, [59, 140, 110]);
        y += 6;
      }

      // Page numbers + subtle branding on every page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text('Built with RoadUno', margin, pageHeight - 20);
        doc.text(`${i} / ${pageCount}`, pageWidth - margin - 24, pageHeight - 20);
      }

      doc.save(`${slugify(form.artist_name) || 'epk'}.pdf`);
    } catch (err) {
      toast({ variant: 'destructive', title: 'PDF generation failed', description: err.message });
    } finally {
      setGeneratingPdf(false);
    }
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="booking@youract.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" value={form.phone_number} onChange={(e) => updateField('phone_number', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="(615) 555-0134" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={form.facebook_url} onChange={(e) => updateField('facebook_url', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="https://facebook.com/youract" />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={form.instagram_url} onChange={(e) => updateField('instagram_url', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="https://instagram.com/youract" />
              </div>
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
              <Label className="block">Stage Plot</Label>
              {form.stage_plot_url ? (
                <div className="flex items-center justify-between gap-2 bg-asphalt/50 border border-steel rounded-md px-3 py-2">
                  <a href={form.stage_plot_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-paper hover:text-marquee truncate">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{decodeURIComponent(form.stage_plot_url.split('/').pop())}</span>
                  </a>
                  <button onClick={removeStagePlot} className="shrink-0"><X className="h-4 w-4 text-taillight" /></button>
                </div>
              ) : (
                <label className="inline-flex">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleStagePlotFileChange} disabled={uploadingStagePlot} />
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt ${uploadingStagePlot ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingStagePlot ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {uploadingStagePlot ? 'Uploading...' : 'Upload Stage Plot'}
                  </span>
                </label>
              )}
              <p className="text-xs text-paper-muted">PDF or image, whatever your sound tech would want to see.</p>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-marquee hover:bg-marquee-hover text-asphalt font-semibold py-6 text-lg">
                {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : 'Save & Get Link'}
              </Button>
              <Button onClick={handleDownloadPDF} disabled={generatingPdf} variant="outline" className="flex-1 bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt font-semibold py-6 text-lg">
                {generatingPdf ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Building PDF...</> : <><Download className="mr-2 h-5 w-5" /> Download PDF</>}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleDownloadPDF} disabled={generatingPdf} className="flex-1 bg-marquee hover:bg-marquee-hover text-asphalt font-semibold py-6 text-lg">
                  {generatingPdf ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Building PDF...</> : <><Download className="mr-2 h-5 w-5" /> Download as PDF</>}
                </Button>
                <AuthModal
                  defaultTab="signup"
                  trigger={
                    <Button
                      onClick={() => setWantsAutoSaveAfterAuth(true)}
                      variant="outline"
                      className="flex-1 bg-routeline hover:bg-routeline-hover text-asphalt font-semibold py-6 text-lg"
                    >
                      <LogIn className="mr-2 h-5 w-5" /> Create Account for a Shareable Link
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
    </div>
  );
};

export default EPKBuilderPage;