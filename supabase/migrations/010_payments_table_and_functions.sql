-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP
-- Migration: 010_payments_table_and_functions.sql
-- Description: Create payments table, RLS policies, payment RPCs,
--              updated confirm_sale with initial payment,
--              and analytics functions for Cash Collected vs Billed Revenue.
-- ===================================================

-- 1. CREATE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast foreign key lookups and sorting
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON public.payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_dealer_id ON public.payments(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);

-- 2. ENABLE ROW LEVEL SECURITY ON PAYMENTS TABLE
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy"
ON public.payments FOR SELECT
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
CREATE POLICY "payments_insert_policy"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "payments_update_policy" ON public.payments;
CREATE POLICY "payments_update_policy"
ON public.payments FOR UPDATE
TO authenticated
USING (
  dealer_id = auth.uid() AND public.is_approved_dealer()
)
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "payments_delete_policy" ON public.payments;
CREATE POLICY "payments_delete_policy"
ON public.payments FOR DELETE
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);


-- 3. UPDATED confirm_sale RPC WITH OPTIONAL INITIAL PAYMENT
CREATE OR REPLACE FUNCTION public.confirm_sale(
  p_farmer_id UUID,
  p_items JSONB,
  p_initial_payment NUMERIC DEFAULT 0,
  p_payment_method TEXT DEFAULT 'cash',
  p_notes TEXT DEFAULT NULL
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
  v_initial_pay NUMERIC(10, 2) := COALESCE(p_initial_payment, 0);
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

  -- Validate initial payment does not exceed total amount
  IF v_initial_pay < 0 THEN
    RAISE EXCEPTION 'Initial payment cannot be negative.';
  END IF;

  IF v_initial_pay > v_total_amount THEN
    RAISE EXCEPTION 'Initial payment amount (₹%) cannot exceed total bill amount (₹%).', v_initial_pay, v_total_amount;
  END IF;

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

  -- 7. Insert initial payment record if amount > 0
  IF v_initial_pay > 0 THEN
    INSERT INTO public.payments (
      sale_id,
      dealer_id,
      amount,
      paid_at,
      payment_method,
      notes
    ) VALUES (
      v_sale_id,
      v_dealer_id,
      v_initial_pay,
      NOW(),
      COALESCE(p_payment_method, 'cash'),
      p_notes
    );
  END IF;

  -- 8. Build and return result JSON
  SELECT jsonb_build_object(
    'sale_id', v_sale_id,
    'total_amount', v_total_amount,
    'initial_paid', v_initial_pay,
    'balance_due', (v_total_amount - v_initial_pay),
    'created_at', v_created_sale.created_at
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 4. record_payment RPC FUNCTION (With strict overpayment validation)
CREATE OR REPLACE FUNCTION public.record_payment(
  p_sale_id UUID,
  p_amount NUMERIC,
  p_payment_method TEXT DEFAULT 'cash',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_dealer_id UUID := auth.uid();
  v_sale public.sales;
  v_total_paid NUMERIC(10, 2) := 0;
  v_balance_due NUMERIC(10, 2) := 0;
  v_created_payment public.payments;
  v_result JSONB;
BEGIN
  -- 1. Verify approved dealer
  IF NOT public.is_approved_dealer() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- 2. Verify payment amount > 0
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero.';
  END IF;

  -- 3. Lock and fetch sale record
  SELECT * INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id AND dealer_id = v_dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale transaction not found or access denied.';
  END IF;

  -- 4. Calculate existing payments for this sale
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.payments
  WHERE sale_id = p_sale_id AND dealer_id = v_dealer_id;

  v_balance_due := v_sale.total_amount - v_total_paid;

  -- 5. Strict overpayment validation
  IF p_amount > v_balance_due THEN
    RAISE EXCEPTION 'Payment amount (₹%) cannot exceed remaining balance due (₹%).', p_amount, v_balance_due;
  END IF;

  -- 6. Insert new payment entry
  INSERT INTO public.payments (
    sale_id,
    dealer_id,
    amount,
    paid_at,
    payment_method,
    notes
  ) VALUES (
    p_sale_id,
    v_dealer_id,
    p_amount,
    NOW(),
    COALESCE(p_payment_method, 'cash'),
    p_notes
  )
  RETURNING * INTO v_created_payment;

  -- Recalculate totals
  v_total_paid := v_total_paid + p_amount;
  v_balance_due := v_sale.total_amount - v_total_paid;

  SELECT jsonb_build_object(
    'payment_id', v_created_payment.id,
    'sale_id', p_sale_id,
    'total_amount', v_sale.total_amount,
    'total_paid', v_total_paid,
    'balance_due', v_balance_due,
    'payment_status', CASE 
      WHEN v_balance_due <= 0 THEN 'PAID'
      WHEN v_total_paid > 0 THEN 'PARTIAL'
      ELSE 'UNPAID'
    END
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 5. delete_payment RPC FUNCTION
CREATE OR REPLACE FUNCTION public.delete_payment(p_payment_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_dealer_id UUID := auth.uid();
  v_payment public.payments;
  v_sale public.sales;
  v_new_total_paid NUMERIC(10, 2) := 0;
  v_new_balance NUMERIC(10, 2) := 0;
  v_result JSONB;
BEGIN
  IF NOT public.is_approved_dealer() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- Select and verify ownership
  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id AND (dealer_id = v_dealer_id OR public.is_admin());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found or access denied.';
  END IF;

  -- Delete payment row
  DELETE FROM public.payments WHERE id = p_payment_id;

  -- Recalculate sale stats
  SELECT * INTO v_sale FROM public.sales WHERE id = v_payment.sale_id;
  
  IF FOUND THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_new_total_paid
    FROM public.payments
    WHERE sale_id = v_payment.sale_id;

    v_new_balance := v_sale.total_amount - v_new_total_paid;
  END IF;

  SELECT jsonb_build_object(
    'deleted_payment_id', p_payment_id,
    'sale_id', v_payment.sale_id,
    'total_amount', COALESCE(v_sale.total_amount, 0),
    'total_paid', v_new_total_paid,
    'balance_due', v_new_balance
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 6. UPDATED REVENUE SUMMARY RPC (Returns both Billed Sales and Cash Collected)
CREATE OR REPLACE FUNCTION public.get_dealer_revenue_summary(p_timezone TEXT DEFAULT 'Asia/Kolkata')
RETURNS JSONB AS $$
DECLARE
  v_dealer_id UUID := auth.uid();
  v_today_billed NUMERIC(10, 2) := 0;
  v_this_week_billed NUMERIC(10, 2) := 0;
  v_this_month_billed NUMERIC(10, 2) := 0;
  
  v_today_collected NUMERIC(10, 2) := 0;
  v_this_week_collected NUMERIC(10, 2) := 0;
  v_this_month_collected NUMERIC(10, 2) := 0;
  
  v_tz TEXT := COALESCE(NULLIF(p_timezone, ''), 'Asia/Kolkata');
BEGIN
  IF NOT public.is_approved_dealer() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Account is not approved.';
  END IF;

  -- Today's billed sales revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_today_billed
  FROM public.sales
  WHERE dealer_id = v_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('day', NOW() AT TIME ZONE v_tz);

  -- This week's billed sales revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_this_week_billed
  FROM public.sales
  WHERE dealer_id = v_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('week', NOW() AT TIME ZONE v_tz);

  -- This month's billed sales revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_this_month_billed
  FROM public.sales
  WHERE dealer_id = v_dealer_id
    AND (date AT TIME ZONE v_tz) >= date_trunc('month', NOW() AT TIME ZONE v_tz);

  -- Cash Collected (Today, Week, Month)
  SELECT COALESCE(SUM(amount), 0) INTO v_today_collected
  FROM public.payments
  WHERE dealer_id = v_dealer_id
    AND (paid_at AT TIME ZONE v_tz) >= date_trunc('day', NOW() AT TIME ZONE v_tz);

  SELECT COALESCE(SUM(amount), 0) INTO v_this_week_collected
  FROM public.payments
  WHERE dealer_id = v_dealer_id
    AND (paid_at AT TIME ZONE v_tz) >= date_trunc('week', NOW() AT TIME ZONE v_tz);

  SELECT COALESCE(SUM(amount), 0) INTO v_this_month_collected
  FROM public.payments
  WHERE dealer_id = v_dealer_id
    AND (paid_at AT TIME ZONE v_tz) >= date_trunc('month', NOW() AT TIME ZONE v_tz);

  RETURN jsonb_build_object(
    'today', v_today_billed,
    'this_week', v_this_week_billed,
    'this_month', v_this_month_billed,
    'today_collected', v_today_collected,
    'this_week_collected', v_this_week_collected,
    'this_month_collected', v_this_month_collected
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
