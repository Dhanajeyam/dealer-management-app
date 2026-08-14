-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - MIGRATION 011
-- Description: Add upi_id column to profiles table
--              Update handle_new_user auth trigger
-- ===================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- Update handle_new_user trigger function to populate upi_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_status TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'dealer');
  
  IF v_role = 'admin' OR LOWER(NEW.email) LIKE '%admin%' THEN
    v_role := 'admin';
    v_status := 'approved';
  ELSE
    v_status := COALESCE(NEW.raw_user_meta_data->>'status', 'pending');
  END IF;

  INSERT INTO public.profiles (id, role, shop_name, phone, address, gstin, upi_id, status)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'shop_name', 'System Admin'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'gstin',
    NEW.raw_user_meta_data->>'upi_id',
    v_status
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    shop_name = COALESCE(EXCLUDED.shop_name, public.profiles.shop_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    gstin = COALESCE(EXCLUDED.gstin, public.profiles.gstin),
    upi_id = COALESCE(EXCLUDED.upi_id, public.profiles.upi_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
