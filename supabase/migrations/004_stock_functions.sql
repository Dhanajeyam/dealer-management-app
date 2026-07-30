-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 004_stock_functions.sql
-- Description: Atomic PostgreSQL RPC functions for product quantity adjustments 
--              and Smart Add stock merging.
-- ===================================================

-- 1. ATOMIC QUANTITY ADJUSTMENT RPC FUNCTION
-- Atomically increments/decrements quantity in SQL without race conditions
CREATE OR REPLACE FUNCTION public.adjust_product_quantity(
  p_product_id UUID,
  p_delta NUMERIC
)
RETURNS public.products AS $$
DECLARE
  v_updated_product public.products;
BEGIN
  -- Verify user is approved dealer and owns the product
  IF NOT public.is_approved_dealer() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  UPDATE public.products
  SET 
    quantity = GREATEST(0, quantity + p_delta),
    updated_at = NOW()
  WHERE id = p_product_id AND dealer_id = auth.uid()
  RETURNING * INTO v_updated_product;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or access denied.';
  END IF;

  RETURN v_updated_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. ATOMIC SMART ADD PRODUCT RPC FUNCTION
-- Merges quantities if brand + name matches (case-insensitive) for auth.uid()
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
  v_existing_id UUID;
  v_result public.products;
  v_clean_brand TEXT := TRIM(p_brand);
  v_clean_name TEXT := TRIM(p_name);
BEGIN
  IF NOT public.is_approved_dealer() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- Search for existing product with matching dealer_id, brand (case-insensitive), name (case-insensitive)
  SELECT id INTO v_existing_id
  FROM public.products
  WHERE dealer_id = v_dealer_id
    AND LOWER(TRIM(brand)) = LOWER(v_clean_brand)
    AND LOWER(TRIM(name)) = LOWER(v_clean_name)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Merge stock: Add quantity and update price/unit to latest values
    UPDATE public.products
    SET 
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
      brand,
      name,
      quantity,
      unit,
      price
    ) VALUES (
      v_dealer_id,
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
