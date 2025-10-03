-- Phase 1: Enable RLS on all tables

-- Enable RLS on all tables
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Make user_id NOT NULL (handle existing data by deleting orphaned records)
DELETE FROM public.expenses WHERE user_id IS NULL;
DELETE FROM public.goals WHERE user_id IS NULL;
DELETE FROM public.expense_templates WHERE user_id IS NULL;
DELETE FROM public.expense_categories WHERE user_id IS NULL;

ALTER TABLE public.expenses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.expense_templates ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.expense_categories ALTER COLUMN user_id SET NOT NULL;