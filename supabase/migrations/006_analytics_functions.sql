-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 006_analytics_functions.sql
-- Description: Direct SQL aggregation RPC functions for Dealer Analytics
--              with Timezone Support for accurate Local Midnight filtering.
-- ===================================================

-- 1. Get Revenue Summary (Today, This Week, This Month in Local Timezone)
CREATE OR REPLACE FUNCTION public.get_dealer_revenue_summary(p_timezone TEXT DEFAULT 'Asia/Kolkata')
RETURNS JSONB AS $$
DECLARE
  v_dealer_id UUID := auth.uid();
  v_today NUMERIC(10, 2) := 0;
  v_this_week NUMERIC(10, 2) := 0;
  v_this_month NUMERIC(10, 2) := 0;
  v_tz TEXT := COALESCE(NULLIF(p_timezone, ''), 'Asia/Kolkata');
BEGIN
  IF NOT public.is_approved_dealer() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- Today's revenue (since start of current day in dealer's local timezone)
  SELECT COALESCE(SUM(total_amount), 0) INTO v_today
  FROM public.sales
  WHERE dealer_id = v_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('day', NOW() AT TIME ZONE v_tz);

  -- This week's revenue (since start of current week in dealer's local timezone)
  SELECT COALESCE(SUM(total_amount), 0) INTO v_this_week
  FROM public.sales
  WHERE dealer_id = v_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('week', NOW() AT TIME ZONE v_tz);

  -- This month's revenue (since start of current month in dealer's local timezone)
  SELECT COALESCE(SUM(total_amount), 0) INTO v_this_month
  FROM public.sales
  WHERE dealer_id = v_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('month', NOW() AT TIME ZONE v_tz);

  RETURN jsonb_build_object(
    'today', v_today,
    'this_week', v_this_week,
    'this_month', v_this_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Get Top 5 Best-Selling Products by Quantity Sold
CREATE OR REPLACE FUNCTION public.get_dealer_top_products(p_limit INT DEFAULT 5)
RETURNS TABLE (
  product_name TEXT,
  product_brand TEXT,
  total_qty_sold NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  IF NOT public.is_approved_dealer() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  RETURN QUERY
  SELECT 
    si.product_name,
    si.product_brand,
    COALESCE(SUM(si.qty), 0) AS total_qty_sold,
    COALESCE(SUM(si.qty * si.price_at_sale), 0) AS total_revenue
  FROM public.sale_items si
  JOIN public.sales s ON s.id = si.sale_id
  WHERE s.dealer_id = auth.uid()
  GROUP BY si.product_name, si.product_brand
  ORDER BY total_qty_sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Get Low-Stock Products Below Threshold
CREATE OR REPLACE FUNCTION public.get_dealer_low_stock(p_threshold NUMERIC DEFAULT 10)
RETURNS TABLE (
  id UUID,
  brand TEXT,
  name TEXT,
  quantity NUMERIC,
  unit TEXT,
  price NUMERIC
) AS $$
BEGIN
  IF NOT public.is_approved_dealer() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.brand,
    p.name,
    p.quantity,
    p.unit,
    p.price
  FROM public.products p
  WHERE p.dealer_id = auth.uid()
    AND p.quantity < p_threshold
  ORDER BY p.quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
