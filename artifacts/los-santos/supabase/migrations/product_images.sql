-- Run this in the Supabase SQL Editor (Database > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow read access via anon key (storefront)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product_images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Anon can insert product_images"
  ON product_images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can delete product_images"
  ON product_images FOR DELETE
  USING (true);
