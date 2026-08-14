-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP
-- Migration: 009_brands_table_migration.sql
-- Description: Create brands table, migrate text brand data to brand_id FK,
--              add RLS policies, indexes, and updated smart_add_product RPC.
-- ===================================================

-- 1. Enable pg_trgm extension for fuzzy trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. CREATE BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_dealer_brand_name UNIQUE (dealer_id, name)
);

-- 3. ADD brand_id COLUMN TO PRODUCTS TABLE WITH ON DELETE RESTRICT
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE RESTRICT;

-- 4. DATA MIGRATION: Convert existing distinct product brand text strings into brands table entries
INSERT INTO public.brands (dealer_id, name)
SELECT DISTINCT dealer_id, TRIM(brand)
FROM public.products
WHERE brand IS NOT NULL AND TRIM(brand) != ''
ON CONFLICT (dealer_id, name) DO NOTHING;

-- 5. BACKFILL products.brand_id
UPDATE public.products p
SET brand_id = b.id
FROM public.brands b
WHERE p.dealer_id = b.dealer_id
  AND LOWER(TRIM(p.brand)) = LOWER(b.name)
  AND p.brand_id IS NULL;

-- 6. ENABLE ROW LEVEL SECURITY ON BRANDS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Dealer Policies on BRANDS
DROP POLICY IF EXISTS "Dealers can view their own brands" ON public.brands;
CREATE POLICY "Dealers can view their own brands"
  ON public.brands FOR SELECT
  USING (dealer_id = auth.uid() AND public.is_approved_dealer());

DROP POLICY IF EXISTS "Dealers can insert their own brands" ON public.brands;
CREATE POLICY "Dealers can insert their own brands"
  ON public.brands FOR INSERT
  WITH CHECK (dealer_id = auth.uid() AND public.is_approved_dealer());

DROP POLICY IF EXISTS "Dealers can update their own brands" ON public.brands;
CREATE POLICY "Dealers can update their own brands"
  ON public.brands FOR UPDATE
  USING (dealer_id = auth.uid() AND public.is_approved_dealer())
  WITH CHECK (dealer_id = auth.uid() AND public.is_approved_dealer());

DROP POLICY IF EXISTS "Dealers can delete their own brands" ON public.brands;
CREATE POLICY "Dealers can delete their own brands"
  ON public.brands FOR DELETE
  USING (dealer_id = auth.uid() AND public.is_approved_dealer());

-- Admin Policy on BRANDS
DROP POLICY IF EXISTS "Admins can view all brands" ON public.brands;
CREATE POLICY "Admins can view all brands"
  ON public.brands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
    )
  );

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_brands_dealer_id ON public.brands(dealer_id);
CREATE INDEX IF NOT EXISTS idx_brands_dealer_name ON public.brands(dealer_id, name);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_dealer_brand ON public.products(dealer_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

-- 8. UPDATED smart_add_product RPC FUNCTION
CREATE OR REPLACE FUNCTION public.smart_add_product(
  p_brand TEXT,
  p_name TEXT,
  p_quantity NUMERIC,
  p_unit TEXT,
  p_price NUMERIC
)
RETURNS public.products AS $$
DECLARE
  v_dealer_id UUID := auth.uid();
  v_brand_id UUID;
  v_existing_id UUID;
  v_result public.products;
  v_clean_brand TEXT := TRIM(p_brand);
  v_clean_name TEXT := TRIM(p_name);
BEGIN
  IF NOT public.is_approved_dealer() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- Get or create brand_id
  SELECT id INTO v_brand_id
  FROM public.brands
  WHERE dealer_id = v_dealer_id
    AND LOWER(name) = LOWER(v_clean_brand)
  LIMIT 1;

  IF v_brand_id IS NULL THEN
    INSERT INTO public.brands (dealer_id, name)
    VALUES (v_dealer_id, v_clean_brand)
    ON CONFLICT (dealer_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_brand_id;
  END IF;

  -- Search for existing product with matching dealer_id, brand_id (or brand name), name (case-insensitive)
  SELECT id INTO v_existing_id
  FROM public.products
  WHERE dealer_id = v_dealer_id
    AND (brand_id = v_brand_id OR LOWER(TRIM(brand)) = LOWER(v_clean_brand))
    AND LOWER(TRIM(name)) = LOWER(v_clean_name)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Merge stock: Add quantity and update price/unit/brand_id
    UPDATE public.products
    SET 
      brand_id = v_brand_id,
      brand = v_clean_brand,
      quantity = quantity + p_quantity,
      price = CASE WHEN p_price > 0 THEN p_price ELSE price END,
      unit = p_unit,
      updated_at = NOW()
    WHERE id = v_existing_id
    RETURNING * INTO v_result;
  ELSE
    -- Insert new product record
    INSERT INTO public.products (
      dealer_id,
      brand_id,
      brand,
      name,
      quantity,
      unit,
      price
    ) VALUES (
      v_dealer_id,
      v_brand_id,
      v_clean_brand,
      v_clean_name,
      p_quantity,
      p_unit,
      p_price
    )
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
