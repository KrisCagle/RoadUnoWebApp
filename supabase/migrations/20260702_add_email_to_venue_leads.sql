ALTER TABLE venue_leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE venue_leads ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
