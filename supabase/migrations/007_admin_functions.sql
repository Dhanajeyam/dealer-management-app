-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 007_admin_functions.sql
-- Description: Admin-only RPC functions for cross-dealer analytics & leaderboard.
-- Security: Restricted strictly to is_admin() users.
-- ===================================================

-- 1. Get Revenue Summary for a specific dealer (Admin Only)
CREATE OR REPLACE FUNCTION public.get_admin_dealer_revenue_summary(
  p_dealer_id UUID,
  p_timezone TEXT DEFAULT 'Asia/Kolkata'
)
RETURNS JSONB AS $$
DECLARE
  v_today NUMERIC(10, 2) := 0;
  v_this_week NUMERIC(10, 2) := 0;
  v_this_month NUMERIC(10, 2) := 0;
  v_tz TEXT := COALESCE(NULLIF(p_timezone, ''), 'Asia/Kolkata');
BEGIN
  -- Strict Admin Security Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Today's revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_today
  FROM public.sales
  WHERE dealer_id = p_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('day', NOW() AT TIME ZONE v_tz);

  -- This week's revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_this_week
  FROM public.sales
  WHERE dealer_id = p_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('week', NOW() AT TIME ZONE v_tz);

  -- This month's revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_this_month
  FROM public.sales
  WHERE dealer_id = p_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('month', NOW() AT TIME ZONE v_tz);

  RETURN jsonb_build_object(
    'today', v_today,
    'this_week', v_this_week,
    'this_month', v_this_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Get Top 5 Best-Selling Products for a specific dealer (Admin Only)
CREATE OR REPLACE FUNCTION public.get_admin_dealer_top_products(
  p_dealer_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  product_name TEXT,
  product_brand TEXT,
  total_qty_sold NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  -- Strict Admin Security Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    si.product_name,
    si.product_brand,
    COALESCE(SUM(si.qty), 0) AS total_qty_sold,
    COALESCE(SUM(si.qty * si.price_at_sale), 0) AS total_revenue
  FROM public.sale_items si
  JOIN public.sales s ON s.id = si.sale_id
  WHERE s.dealer_id = p_dealer_id
  GROUP BY si.product_name, si.product_brand
  ORDER BY total_qty_sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Platform Leaderboard for all approved dealers (Admin Only)
CREATE OR REPLACE FUNCTION public.get_admin_leaderboard(
  p_timezone TEXT DEFAULT 'Asia/Kolkata'
)
RETURNS TABLE (
  dealer_id UUID,
  shop_name TEXT,
  phone TEXT,
  status TEXT,
  this_month_revenue NUMERIC,
  all_time_revenue NUMERIC,
  total_sales_count BIGINT
) AS $$
DECLARE
  v_tz TEXT := COALESCE(NULLIF(p_timezone, ''), 'Asia/Kolkata');
BEGIN
  -- Strict Admin Security Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id AS dealer_id,
    COALESCE(p.shop_name, 'Unnamed Shop') AS shop_name,
    COALESCE(p.phone, '') AS phone,
    p.status,
    COALESCE(SUM(CASE WHEN (s.date AT TIME ZONE v_tz) >= date_trunc('month', NOW() AT TIME ZONE v_tz) THEN s.total_amount ELSE 0 END), 0) AS this_month_revenue,
    COALESCE(SUM(s.total_amount), 0) AS all_time_revenue,
    COUNT(s.id) AS total_sales_count
  FROM public.profiles p
  LEFT JOIN public.sales s ON s.dealer_id = p.id
  WHERE p.role = 'dealer' AND p.status = 'approved'
  GROUP BY p.id, p.shop_name, p.phone, p.status
  ORDER BY this_month_revenue DESC, all_time_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
