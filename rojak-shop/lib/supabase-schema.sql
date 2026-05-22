-- ═══════════════════════════════════════════════════════════
-- ROJAK FAMILY MARKET — Schéma Supabase
-- Coller dans : Supabase Dashboard > SQL Editor > Run
-- ═══════════════════════════════════════════════════════════

-- 1. Table produits (catalogue complet)
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,  -- = ref
  ref             TEXT NOT NULL,
  name            TEXT NOT NULL,
  name_fr         TEXT DEFAULT '',
  name_en         TEXT DEFAULT '',
  brand           TEXT DEFAULT '',
  conditionnement TEXT DEFAULT '',
  origine         TEXT DEFAULT '',
  category        TEXT DEFAULT '',
  subcategory     TEXT DEFAULT '',
  img             TEXT DEFAULT '',
  url             TEXT DEFAULT '',
  price_ht        DECIMAL(10,2),
  in_stock        BOOLEAN DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('french', name));

-- 2. Table paniers (devis)
CREATE TABLE IF NOT EXISTS carts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  TEXT NOT NULL,
  name        TEXT DEFAULT '',          -- nom donné au devis
  status      TEXT DEFAULT 'draft',     -- draft | sent | archived
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id);

-- 3. Table lignes de panier
CREATE TABLE IF NOT EXISTS cart_items (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id         UUID REFERENCES carts(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  product_ref     TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  brand           TEXT DEFAULT '',
  conditionnement TEXT DEFAULT '',
  category        TEXT DEFAULT '',
  subcategory     TEXT DEFAULT '',
  img             TEXT DEFAULT '',
  quantity        INTEGER NOT NULL DEFAULT 1,
  price_ht        DECIMAL(10,2),
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- 4. RLS (Row Level Security) — chaque session voit seulement ses données
ALTER TABLE carts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy : accès libre pour la clé anon (auth via cookie côté app)
CREATE POLICY "allow_all_carts"      ON carts      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_cart_items" ON cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_read_products"  ON products   FOR SELECT USING (true);
CREATE POLICY "allow_insert_products" ON products  FOR INSERT WITH CHECK (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Fonction updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
