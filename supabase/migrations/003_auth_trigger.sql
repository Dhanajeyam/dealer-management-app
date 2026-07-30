-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - PHASE 1 SCHEMA
-- Migration: 003_auth_trigger.sql
-- Description: Automatic profile creation trigger on user signup
-- ===================================================

-- Function: Trigger function to handle raw user metadata on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, shop_name, phone, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'dealer'),
    NEW.raw_user_meta_data->>'shop_name',
    NEW.raw_user_meta_data->>'phone',
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: Execute AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
