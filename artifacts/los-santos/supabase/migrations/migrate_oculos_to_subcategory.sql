-- Migration: "Óculos" category → subcategory of "Acessórios"
-- Safe to re-run (idempotent)

-- Step 1: Ensure "Óculos" subcategory exists under "Acessórios"
-- (may already exist from subcategories.sql seed — ON CONFLICT DO NOTHING handles it)
INSERT INTO subcategories (name, category_id)
SELECT 'Óculos', c.id
FROM categories c
WHERE lower(c.name) = lower('Acessórios')
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 2: Move products from "Óculos" category → "Acessórios" + set subcategory
UPDATE products
SET
  category_id = (
    SELECT id FROM categories WHERE lower(name) = lower('Acessórios') LIMIT 1
  ),
  subcategory_id = (
    SELECT s.id
    FROM subcategories s
    JOIN categories c ON s.category_id = c.id
    WHERE lower(c.name) = lower('Acessórios')
      AND lower(s.name) = lower('Óculos')
    LIMIT 1
  )
WHERE category_id = (
  SELECT id FROM categories WHERE lower(name) = lower('Óculos') LIMIT 1
);

-- Step 3: Delete "Óculos" category
-- Products already migrated above, so no FK violation
DELETE FROM categories WHERE lower(name) = lower('Óculos');
