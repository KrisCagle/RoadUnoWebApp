import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Copy, Check, FileText, PlayCircle, Music2, Cloud, Youtube, X, ChevronLeft, ChevronRight, ExternalLink, Phone, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

// Platform detection for branded icon chips. No new icon library needed,
// real brand colors + the closest available lucide icon is enough for
// recognizable, professional-looking chips without reproducing exact logos.
const getPlatformStyle = (label = '') => {
  const l = label.toLowerCase();
  if (l.includes('spotify')) return { color: '#1DB954', Icon: Music2, name: 'Spotify' };
  if (l.includes('apple')) return { color: '#FA243C', Icon: Music2, name: 'Apple Music' };
  if (l.includes('soundcloud')) return { color: '#FF5500', Icon: Cloud, name: 'SoundCloud' };
  if (l.includes('youtube')) return { color: '#FF0000', Icon: Youtube, name: 'YouTube' };
  if (l.includes('bandcamp')) return { color: '#629AA9', Icon: Music2, name: 'Bandcamp' };
  return { color: '#E8A33D', Icon: ExternalLink, name: label || 'Listen' };
};

const PlatformLink = ({ label, url }) => {
  const { color, Icon, name } = getPlatformStyle(label);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-steel hover:border-transparent transition-colors group"
      style={{ '--chip-color': color }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
    >
      <Icon className="h-4 w-4" style={{ color }} />
      <span className="text-sm">{name}</span>
    </a>
  );
};

const EPKPage = () => {
  const { slug } = useParams();
  const [epk, setEpk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const loadEpk = async () => {
      try {
        const { data, error } = await supabase
          .from('epks')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setNotFound(true);
        } else {
          setEpk(data);
        }
      } catch (err) {
        console.error('Error loading EPK:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadEpk();
  }, [slug]);

  const handleCopyEmail = async () => {
    if (!epk?.contact_email) return;
    await navigator.clipboard.writeText(epk.contact_email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const photos = epk?.photo_urls || [];

  const showPrev = () => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  const showNext = () => setLightboxIndex((i) => (i + 1) % photos.length);
  const closeLightbox = () => setLightboxIndex(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, photos.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-marquee" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen text-paper flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">EPK not found</h1>
        <p className="text-paper-muted mb-6">This page doesn't exist, or the artist hasn't published it yet.</p>
        <Link to="/" className="text-marquee hover:underline">Back to RoadUno</Link>
      </div>
    );
  }

  const videoId = getYouTubeId(epk.live_video_url);
  const bannerPhoto = photos[0];
  const galleryPhotos = photos.slice(1);

  return (
    <div className="min-h-screen text-paper">
      <Helmet>
        <title>{epk.artist_name} | EPK</title>
        <meta name="description" content={epk.bio?.slice(0, 160) || `${epk.artist_name}'s electronic press kit`} />
      </Helmet>

      {/* Minimal header, this page is for bookers/press, not app navigation */}
      <header className="border-b border-white/5 py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://horizons-cdn.hostinger.com/e8d3bde6-aa39-4953-99f8-9b210820c7eb/5dcace8ae19bc988b699c36707bf550a.png" alt="RoadUno" className="h-6" />
          </Link>
          <span className="text-xs text-paper-muted uppercase tracking-wide">Electronic Press Kit</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {bannerPhoto && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={bannerPhoto}
            alt={epk.artist_name}
            onClick={() => setLightboxIndex(0)}
            className="w-full h-64 md:h-80 object-cover rounded-2xl border border-steel mb-8 cursor-pointer hover:opacity-90 transition-opacity"
          />
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-1">{epk.artist_name}</h1>
          {epk.genre && <p className="text-marquee text-lg mb-4">{epk.genre}</p>}

          {(epk.contact_email || epk.phone_number || epk.facebook_url || epk.instagram_url) && (
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
              {epk.contact_email && (
                <div className="flex items-center gap-1.5">
                  <a href={`mailto:${epk.contact_email}`} className="flex items-center gap-1.5 text-paper-muted hover:text-marquee transition-colors">
                    <Mail className="h-4 w-4" /> {epk.contact_email}
                  </a>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCopyEmail}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
              {epk.phone_number && (
                <a href={`tel:${epk.phone_number}`} className="flex items-center gap-1.5 text-paper-muted hover:text-marquee transition-colors">
                  <Phone className="h-4 w-4" /> {epk.phone_number}
                </a>
              )}
              {epk.facebook_url && (
                <a href={epk.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-paper-muted hover:text-marquee transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {epk.instagram_url && (
                <a href={epk.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-paper-muted hover:text-marquee transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {epk.bio && (
            <section className="mb-10">
              <p className="text-paper text-lg leading-relaxed whitespace-pre-wrap">{epk.bio}</p>
            </section>
          )}

          {videoId && (
            <section className="mb-10">
              <h2 className="font-display text-sm uppercase tracking-wide text-paper-muted mb-3 flex items-center gap-2">
                <PlayCircle className="h-4 w-4" /> Live
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden border border-steel">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Live performance"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {(epk.spotify_url || epk.music_links?.length > 0) && (
            <section className="mb-10">
              <h2 className="font-display text-sm uppercase tracking-wide text-paper-muted mb-3 flex items-center gap-2">
                <Music2 className="h-4 w-4" /> Music
              </h2>
              <div className="flex flex-wrap gap-2">
                {epk.spotify_url && <PlatformLink label="Spotify" url={epk.spotify_url} />}
                {epk.music_links?.map((link, i) => (
                  <PlatformLink key={i} label={link.label} url={link.url} />
                ))}
              </div>
            </section>
          )}

          {galleryPhotos.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-sm uppercase tracking-wide text-paper-muted mb-3">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryPhotos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${epk.artist_name} ${i + 2}`}
                    onClick={() => setLightboxIndex(i + 1)}
                    className="w-full h-40 object-cover rounded-lg border border-steel cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            </section>
          )}

          {epk.notable_wins && (
            <section className="mb-10">
              <h2 className="font-display text-sm uppercase tracking-wide text-paper-muted mb-3">Notable</h2>
              <p className="text-paper whitespace-pre-wrap">{epk.notable_wins}</p>
            </section>
          )}

          {epk.upcoming_dates && (
            <section className="mb-10">
              <h2 className="font-display text-sm uppercase tracking-wide text-paper-muted mb-3">Upcoming Dates</h2>
              <p className="text-paper whitespace-pre-wrap">{epk.upcoming_dates}</p>
            </section>
          )}

          {epk.stage_plot_url && (
            <section className="mb-10">
              <a
                href={epk.stage_plot_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-steel text-sm hover:border-marquee hover:text-marquee transition-colors"
              >
                <FileText className="h-4 w-4" /> Stage Plot
              </a>
            </section>
          )}
        </motion.div>
      </main>

      <footer className="py-8 text-center border-t border-white/5">
        <Link to="/epk-builder" className="text-xs text-paper-muted hover:text-marquee transition-colors">
          Built with RoadUno &middot; Create your own EPK
        </Link>
      </footer>

      {/* Lightbox / carousel */}
      <AnimatePresence>
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 text-paper-muted hover:text-paper p-2"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {photos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper p-2"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              src={photos[lightboxIndex]}
              alt={`${epk.artist_name} full view`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            />

            {photos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper p-2"
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {photos.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-paper-muted">
                {lightboxIndex + 1} / {photos.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EPKPage;