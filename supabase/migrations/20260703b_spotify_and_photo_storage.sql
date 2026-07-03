-- Spotify gets its own dedicated field (separate from the generic music_links repeater)
ALTER TABLE epks ADD COLUMN IF NOT EXISTS spotify_url text;

-- Storage bucket for uploaded EPK photos (public read, so they display on public EPK pages)
INSERT INTO storage.buckets (id, name, public)
VALUES ('epk-photos', 'epk-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view photos (bucket is public, this policy makes it explicit)
CREATE POLICY "Public can view epk photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'epk-photos');

-- Logged-in users can upload, but only into a folder named after their own user id
-- (path looks like: {user_id}/1699999999.jpg)
CREATE POLICY "Users can upload their own epk photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'epk-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own epk photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'epk-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own epk photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'epk-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
