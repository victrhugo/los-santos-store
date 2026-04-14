-- Run no Supabase: SQL Editor → New query.
-- Garante tabela `orders` com customer_name, customer_phone e demais campos usados pelo app.

-- Tabela completa (banco novo)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  delivery_type TEXT NOT NULL DEFAULT 'pickup',
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_delivery_type_check CHECK (delivery_type IN ('pickup', 'uber'))
);

-- Banco já existente sem essas colunas: idempotente
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_public" ON orders;
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_update_public" ON orders;

CREATE POLICY "orders_select_public" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_public" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_public" ON orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "order_items_select_public" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;

CREATE POLICY "order_items_select_public" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_public" ON order_items FOR INSERT WITH CHECK (true);
