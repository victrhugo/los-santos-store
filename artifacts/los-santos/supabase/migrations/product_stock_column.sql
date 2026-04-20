-- Add stock column to products table for items without real variants (Padrão)
-- Default 99 so existing products remain sellable after migration
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 99 NOT NULL;

-- RLS: allow authenticated users to update stock (admin operations)
-- SELECT is already public via existing policy
