-- Store settings table (single-row CMS)
CREATE TABLE IF NOT EXISTS store_settings (
  id              uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
  hero_title      text,
  hero_subtitle   text,
  hero_image_url  text,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_settings_select_public"
  ON store_settings FOR SELECT USING (true);

CREATE POLICY "store_settings_insert_admin"
  ON store_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "store_settings_update_admin"
  ON store_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed one row with defaults so the frontend always has a fallback
INSERT INTO store_settings (hero_title, hero_subtitle)
VALUES ('Los Santos Store', 'Roupas, acessórios e perfumes com estilo.')
ON CONFLICT DO NOTHING;
