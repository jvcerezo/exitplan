-- ============================================
-- Streak sync fields on profiles table
-- Run this in the Supabase SQL Editor
-- ============================================

-- Add streak fields to profiles for cross-device sync
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_best integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pahinha_tokens integer NOT NULL DEFAULT 0;
