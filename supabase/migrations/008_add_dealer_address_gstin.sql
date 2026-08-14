-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - MIGRATION 008
-- Description: Add address and gstin columns to profiles
--              Update handle_new_user auth trigger
-- ===================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS gstin TEXT;

-- Update handle_new_user trigger function to populate address & gstin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_status TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'dealer');
  
  -- If role is admin (or email contains admin), assign admin role & approve immediately
  IF v_role = 'admin' OR LOWER(NEW.email) LIKE '%admin%' THEN
    v_role := 'admin';
    v_status := 'approved';
  ELSE
    v_status := COALESCE(NEW.raw_user_meta_data->>'status', 'pending');
  END IF;

  INSERT INTO public.profiles (id, role, shop_name, phone, address, gstin, status)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'shop_name', 'System Admin'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'gstin',
    v_status
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    shop_name = COALESCE(EXCLUDED.shop_name, public.profiles.shop_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    gstin = COALESCE(EXCLUDED.gstin, public.profiles.gstin);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
