-- Comprehensive security fix: Add user isolation and fix RLS policies for all financial tables

-- First, add user_id columns to tables that don't have them
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.daily_cash ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.expense_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_cash_user_id ON public.daily_cash(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON public.expense_categories(user_id);

-- Update goals table RLS policies for user-specific access
DROP POLICY IF EXISTS "goals_select_authenticated" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_authenticated" ON public.goals;
DROP POLICY IF EXISTS "goals_update_authenticated" ON public.goals;
DROP POLICY IF EXISTS "goals_delete_authenticated" ON public.goals;

CREATE POLICY "goals_select_user_own" ON public.goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "goals_insert_user_own" ON public.goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update_user_own" ON public.goals
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_delete_user_own" ON public.goals
FOR DELETE USING (auth.uid() = user_id);

-- Fix expenses table RLS policies
DROP POLICY IF EXISTS "expenses_select_public" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_authenticated" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_authenticated" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_authenticated" ON public.expenses;

CREATE POLICY "expenses_select_user_own" ON public.expenses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_user_own" ON public.expenses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_user_own" ON public.expenses
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_delete_user_own" ON public.expenses
FOR DELETE USING (auth.uid() = user_id);

-- Fix daily_cash table RLS policies
DROP POLICY IF EXISTS "daily_cash_select_public" ON public.daily_cash;
DROP POLICY IF EXISTS "daily_cash_insert_authenticated" ON public.daily_cash;
DROP POLICY IF EXISTS "daily_cash_update_authenticated" ON public.daily_cash;
DROP POLICY IF EXISTS "daily_cash_delete_authenticated" ON public.daily_cash;

CREATE POLICY "daily_cash_select_user_own" ON public.daily_cash
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "daily_cash_insert_user_own" ON public.daily_cash
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_cash_update_user_own" ON public.daily_cash
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_cash_delete_user_own" ON public.daily_cash
FOR DELETE USING (auth.uid() = user_id);

-- Fix budgets table RLS policies for user-specific access
DROP POLICY IF EXISTS "budgets_select_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_insert_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_update_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_delete_authenticated" ON public.budgets;

CREATE POLICY "budgets_select_user_own" ON public.budgets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budgets_insert_user_own" ON public.budgets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_update_user_own" ON public.budgets
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_delete_user_own" ON public.budgets
FOR DELETE USING (auth.uid() = user_id);

-- Fix expense_categories table RLS policies for user-specific access
DROP POLICY IF EXISTS "expense_categories_select_authenticated" ON public.expense_categories;
DROP POLICY IF EXISTS "expense_categories_insert_authenticated" ON public.expense_categories;
DROP POLICY IF EXISTS "expense_categories_update_authenticated" ON public.expense_categories;
DROP POLICY IF EXISTS "expense_categories_delete_authenticated" ON public.expense_categories;

CREATE POLICY "expense_categories_select_user_own" ON public.expense_categories
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expense_categories_insert_user_own" ON public.expense_categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expense_categories_update_user_own" ON public.expense_categories
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expense_categories_delete_user_own" ON public.expense_categories
FOR DELETE USING (auth.uid() = user_id);

-- Secure storage bucket policies for receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;

CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own receipts" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own receipts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);