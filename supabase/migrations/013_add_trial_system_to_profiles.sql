-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP
-- Migration: 013_add_trial_system_to_profiles.sql
-- Description: Add is_trial and trial_ends_at columns to profiles table,
--              automatic 7-day trial trigger on approval,
--              and update is_approved_dealer() security function.
-- ===================================================

-- 1. ADD TRIAL COLUMNS TO PROFILES TABLE
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Backfill existing approved dealers to paid (permanent) so existing active dealers aren't locked out
UPDATE public.profiles
SET is_trial = FALSE
WHERE role = 'dealer' AND status = 'approved' AND is_trial IS NULL;

-- 2. TRIGGER TO AUTOMATICALLY SET 7-DAY TRIAL ON APPROVAL
CREATE OR REPLACE FUNCTION public.handle_dealer_approval_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- When a dealer's status transitions to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    IF NEW.trial_ends_at IS NULL THEN
      NEW.trial_ends_at := NOW() + INTERVAL '7 days';
      NEW.is_trial := TRUE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_dealer_approval_trial ON public.profiles;
CREATE TRIGGER trg_dealer_approval_trial
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_dealer_approval_trial();

-- 3. UPDATE SECURITY FUNCTION is_approved_dealer()
-- Strictly validates that the dealer is approved AND their trial has not expired.
CREATE OR REPLACE FUNCTION public.is_approved_dealer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND role = 'dealer' 
      AND status = 'approved'
      AND (
        is_trial IS NOT TRUE 
        OR trial_ends_at IS NULL 
        OR trial_ends_at > NOW()
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
