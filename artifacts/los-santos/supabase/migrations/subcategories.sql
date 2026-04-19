-- 1. Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id          uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        text        NOT NULL,
  category_id uuid        REFERENCES categories(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 2. Add subcategory_id to products (nullable — existing products keep working)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL;

-- 3. Row Level Security
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subcategories_select_public" ON subcategories;
DROP POLICY IF EXISTS "subcategories_insert_admin"  ON subcategories;
DROP POLICY IF EXISTS "subcategories_update_admin"  ON subcategories;
DROP POLICY IF EXISTS "subcategories_delete_admin"  ON subcategories;

CREATE POLICY "subcategories_select_public"
  ON subcategories FOR SELECT USING (true);

CREATE POLICY "subcategories_insert_admin"
  ON subcategories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "subcategories_update_admin"
  ON subcategories FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "subcategories_delete_admin"
  ON subcategories FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Seed: Roupas subcategories
INSERT INTO subcategories (name, category_id)
SELECT sub.name, c.id
FROM (
  VALUES ('Camisetas'), ('Shorts'), ('Calças')
) AS sub(name)
CROSS JOIN categories c
WHERE lower(c.name) = 'roupas'
ON CONFLICT DO NOTHING;

-- 5. Seed: Acessórios subcategories
INSERT INTO subcategories (name, category_id)
SELECT sub.name, c.id
FROM (
  VALUES ('Óculos'), ('Bonés'), ('Correntes')
) AS sub(name)
CROSS JOIN categories c
WHERE lower(c.name) = lower('Acessórios')
ON CONFLICT DO NOTHING;
