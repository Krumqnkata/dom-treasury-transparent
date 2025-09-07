-- Add recipient field to expenses table
ALTER TABLE public.expenses 
ADD COLUMN recipient TEXT;