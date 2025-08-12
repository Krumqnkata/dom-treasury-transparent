-- Remove unnecessary tables that are no longer used
-- Drop apartments table and related dependencies
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.apartments CASCADE;