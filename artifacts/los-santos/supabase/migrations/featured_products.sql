-- Add featured columns to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS featured       boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS featured_order integer;

-- Index for fast featured queries
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (featured, featured_order)
  WHERE featured = true;
