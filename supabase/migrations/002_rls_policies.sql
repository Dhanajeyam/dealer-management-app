-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) policies for complete
--              data isolation between dealers & admin access.
-- ===================================================

-- ---------------------------------------------------
-- 1. HELPER SECURITY DEFINER FUNCTIONS
-- ---------------------------------------------------

-- Function: Checks if the currently authenticated user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Checks if the currently authenticated user is an APPROVED dealer
CREATE OR REPLACE FUNCTION public.is_approved_dealer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'dealer' AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------
-- 2. ENABLE RLS ON ALL TABLES
-- ---------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------
-- 3. POLICIES FOR 'profiles' TABLE
-- ---------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  (id = auth.uid() AND role = 'dealer' AND status = 'pending') OR public.is_admin()
);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (
  public.is_admin() OR (
    id = auth.uid() 
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  )
);

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- ---------------------------------------------------
-- 4. POLICIES FOR 'products' TABLE
-- ---------------------------------------------------
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
CREATE POLICY "products_select_policy"
ON public.products FOR SELECT
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
CREATE POLICY "products_insert_policy"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "products_update_policy" ON public.products;
CREATE POLICY "products_update_policy"
ON public.products FOR UPDATE
TO authenticated
USING (
  dealer_id = auth.uid() AND public.is_approved_dealer()
)
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
CREATE POLICY "products_delete_policy"
ON public.products FOR DELETE
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

-- ---------------------------------------------------
-- 5. POLICIES FOR 'farmers' TABLE
-- ---------------------------------------------------
DROP POLICY IF EXISTS "farmers_select_policy" ON public.farmers;
CREATE POLICY "farmers_select_policy"
ON public.farmers FOR SELECT
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

DROP POLICY IF EXISTS "farmers_insert_policy" ON public.farmers;
CREATE POLICY "farmers_insert_policy"
ON public.farmers FOR INSERT
TO authenticated
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "farmers_update_policy" ON public.farmers;
CREATE POLICY "farmers_update_policy"
ON public.farmers FOR UPDATE
TO authenticated
USING (
  dealer_id = auth.uid() AND public.is_approved_dealer()
)
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "farmers_delete_policy" ON public.farmers;
CREATE POLICY "farmers_delete_policy"
ON public.farmers FOR DELETE
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

-- ---------------------------------------------------
-- 6. POLICIES FOR 'sales' TABLE
-- ---------------------------------------------------
DROP POLICY IF EXISTS "sales_select_policy" ON public.sales;
CREATE POLICY "sales_select_policy"
ON public.sales FOR SELECT
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

DROP POLICY IF EXISTS "sales_insert_policy" ON public.sales;
CREATE POLICY "sales_insert_policy"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "sales_update_policy" ON public.sales;
CREATE POLICY "sales_update_policy"
ON public.sales FOR UPDATE
TO authenticated
USING (
  dealer_id = auth.uid() AND public.is_approved_dealer()
)
WITH CHECK (
  dealer_id = auth.uid() AND public.is_approved_dealer()
);

DROP POLICY IF EXISTS "sales_delete_policy" ON public.sales;
CREATE POLICY "sales_delete_policy"
ON public.sales FOR DELETE
TO authenticated
USING (
  (dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin()
);

-- ---------------------------------------------------
-- 7. POLICIES FOR 'sale_items' TABLE
-- ---------------------------------------------------
DROP POLICY IF EXISTS "sale_items_select_policy" ON public.sale_items;
CREATE POLICY "sale_items_select_policy"
ON public.sale_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
      AND ((s.dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "sale_items_insert_policy" ON public.sale_items;
CREATE POLICY "sale_items_insert_policy"
ON public.sale_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
      AND s.dealer_id = auth.uid() 
      AND public.is_approved_dealer()
  )
);

DROP POLICY IF EXISTS "sale_items_update_policy" ON public.sale_items;
CREATE POLICY "sale_items_update_policy"
ON public.sale_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
      AND s.dealer_id = auth.uid() 
      AND public.is_approved_dealer()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
      AND s.dealer_id = auth.uid() 
      AND public.is_approved_dealer()
  )
);

DROP POLICY IF EXISTS "sale_items_delete_policy" ON public.sale_items;
CREATE POLICY "sale_items_delete_policy"
ON public.sale_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
      AND ((s.dealer_id = auth.uid() AND public.is_approved_dealer()) OR public.is_admin())
  )
);
