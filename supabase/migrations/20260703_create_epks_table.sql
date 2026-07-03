-- Create epks table
CREATE TABLE IF NOT EXISTS epks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  artist_name text NOT NULL,
  genre text,
  bio text,
  photo_urls text[] DEFAULT '{}',
  music_links jsonb DEFAULT '[]',
  live_video_url text,
  notable_wins text,
  upcoming_dates text,
  stage_plot_url text,
  contact_email text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- One EPK per artist for now (keeps the editor simple: no picking "which one")
CREATE UNIQUE INDEX IF NOT EXISTS epks_artist_id_idx ON epks(artist_id);

-- Row Level Security
ALTER TABLE epks ENABLE ROW LEVEL SECURITY;

-- Anyone can view a PUBLISHED epk (this is what makes /epk/:slug work for bookers with no login)
CREATE POLICY "Public can view published EPKs"
  ON epks FOR SELECT
  USING (is_published = true);

-- Owners can always view their own, published or not (so they can preview drafts)
CREATE POLICY "Owners can view their own EPK"
  ON epks FOR SELECT
  USING (auth.uid() = artist_id);

-- Owners can insert their own EPK
CREATE POLICY "Owners can create their own EPK"
  ON epks FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

-- Owners can update their own EPK
CREATE POLICY "Owners can update their own EPK"
  ON epks FOR UPDATE
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

-- Owners can delete their own EPK
CREATE POLICY "Owners can delete their own EPK"
  ON epks FOR DELETE
  USING (auth.uid() = artist_id);

-- Keep updated_at current on every edit
CREATE OR REPLACE FUNCTION update_epks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER epks_set_updated_at
  BEFORE UPDATE ON epks
  FOR EACH ROW
  EXECUTE FUNCTION update_epks_updated_at();
