-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 003_auth_trigger.sql
-- Description: Automatic profile creation trigger on user signup.
--              Automatically approves Admin role accounts.
-- ===================================================

-- Function: Trigger function to handle raw user metadata & admin auto-approval
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

  INSERT INTO public.profiles (id, role, shop_name, phone, status)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'shop_name', 'System Admin'),
    NEW.raw_user_meta_data->>'phone',
    v_status
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    shop_name = COALESCE(EXCLUDED.shop_name, public.profiles.shop_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: Execute AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
