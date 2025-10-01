-- Enable RLS on all tables
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Add UPDATE policy for expenses
CREATE POLICY "Expenses – update own rows"
ON public.expenses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for goals table
CREATE POLICY "Users can view their own goals"
ON public.goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.goals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.goals
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for expense_categories
CREATE POLICY "expense_categories_delete_user_own"
ON public.expense_categories
FOR DELETE
USING (auth.uid() = user_id);