-- Update RLS policies to allow public SELECT access for homepage data
-- while keeping other operations authenticated-only

-- Drop existing policies for daily_cash
DROP POLICY IF EXISTS "daily_cash_select_authenticated" ON public.daily_cash;
DROP POLICY IF EXISTS "daily_cash_insert_authenticated" ON public.daily_cash;
DROP POLICY IF EXISTS "daily_cash_update_authenticated" ON public.daily_cash;
DROP POLICY IF EXISTS "daily_cash_delete_authenticated" ON public.daily_cash;

-- Create new policies for daily_cash
CREATE POLICY "daily_cash_select_public" ON public.daily_cash
FOR SELECT USING (true);

CREATE POLICY "daily_cash_insert_authenticated" ON public.daily_cash
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "daily_cash_update_authenticated" ON public.daily_cash
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "daily_cash_delete_authenticated" ON public.daily_cash
FOR DELETE USING (auth.role() = 'authenticated');

-- Drop existing policies for expenses
DROP POLICY IF EXISTS "expenses_select_authenticated" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_authenticated" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_authenticated" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_authenticated" ON public.expenses;

-- Create new policies for expenses
CREATE POLICY "expenses_select_public" ON public.expenses
FOR SELECT USING (true);

CREATE POLICY "expenses_insert_authenticated" ON public.expenses
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "expenses_update_authenticated" ON public.expenses
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "expenses_delete_authenticated" ON public.expenses
FOR DELETE USING (auth.role() = 'authenticated');