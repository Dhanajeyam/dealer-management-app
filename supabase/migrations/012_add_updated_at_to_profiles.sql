-- ===================================================
-- AGRI-CHEMICAL DEALER MANAGEMENT APP - MIGRATION 012
-- Description: Add updated_at column to profiles table
-- ===================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
