-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 005_sales_functions.sql
-- Description: Atomic confirm_sale RPC function for transactions,
--              stock decrement, snapshotting, and stock re-check.
-- ===================================================

CREATE OR REPLACE FUNCTION public.confirm_sale(
  p_farmer_id UUID,
  p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_dealer_id UUID := auth.uid();
  v_sale_id UUID;
  v_total_amount NUMERIC(10, 2) := 0;
  v_item JSONB;
  v_product_id UUID;
  v_requested_qty NUMERIC(10, 2);
  v_price_at_sale NUMERIC(10, 2);
  v_product public.products;
  v_created_sale public.sales;
  v_result JSONB;
BEGIN
  -- 1. Verify user is approved dealer
  IF NOT public.is_approved_dealer() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- 2. Validate input items
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot confirm sale with an empty cart.';
  END IF;

  -- 3. Validate farmer belongs to this dealer (if farmer_id provided)
  IF p_farmer_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.farmers WHERE id = p_farmer_id AND dealer_id = v_dealer_id) THEN
      RAISE EXCEPTION 'Selected farmer does not exist or access denied.';
    END IF;
  END IF;

  -- 4. First Pass: Lock product rows, verify stock availability, calculate total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_requested_qty := (v_item->>'qty')::NUMERIC;
    v_price_at_sale := (v_item->>'price_at_sale')::NUMERIC;

    IF v_requested_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity % for item.', v_requested_qty;
    END IF;

    -- Lock product row FOR UPDATE to prevent concurrent stock race conditions
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_product_id AND dealer_id = v_dealer_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found or access denied.';
    END IF;

    -- Strict stock re-check inside the transaction
    IF v_product.quantity < v_requested_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "% (%)". Available: %, Requested: %',
        v_product.name, v_product.brand, v_product.quantity, v_requested_qty;
    END IF;

    v_total_amount := v_total_amount + (v_requested_qty * v_price_at_sale);
  END LOOP;

  -- 5. Insert Sale Header
  INSERT INTO public.sales (
    dealer_id,
    farmer_id,
    date,
    total_amount
  ) VALUES (
    v_dealer_id,
    p_farmer_id,
    NOW(),
    v_total_amount
  )
  RETURNING * INTO v_created_sale;

  v_sale_id := v_created_sale.id;

  -- 6. Second Pass: Insert sale_items and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_requested_qty := (v_item->>'qty')::NUMERIC;
    v_price_at_sale := (v_item->>'price_at_sale')::NUMERIC;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_product_id AND dealer_id = v_dealer_id;

    -- Insert sale item with snapshotted info
    INSERT INTO public.sale_items (
      sale_id,
      product_id,
      product_name,
      product_brand,
      qty,
      unit,
      price_at_sale
    ) VALUES (
      v_sale_id,
      v_product_id,
      v_product.name,
      v_product.brand,
      v_requested_qty,
      v_product.unit,
      v_price_at_sale
    );

    -- Decrement stock quantity
    UPDATE public.products
    SET quantity = quantity - v_requested_qty,
        updated_at = NOW()
    WHERE id = v_product_id AND dealer_id = v_dealer_id;
  END LOOP;

  -- 7. Build and return result JSON
  SELECT jsonb_build_object(
    'sale_id', v_sale_id,
    'total_amount', v_total_amount,
    'created_at', v_created_sale.created_at
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
