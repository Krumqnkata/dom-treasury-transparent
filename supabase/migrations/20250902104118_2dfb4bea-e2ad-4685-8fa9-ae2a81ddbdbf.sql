-- Fix security vulnerability: Restrict goals table access to authenticated users only
-- Update the SELECT policy to require authentication instead of allowing public access

DROP POLICY IF EXISTS "goals_select_authenticated" ON public.goals;

CREATE POLICY "goals_select_authenticated" 
ON public.goals 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- Also update other policies to ensure they properly check for authentication
DROP POLICY IF EXISTS "goals_insert_authenticated" ON public.goals;
CREATE POLICY "goals_insert_authenticated" 
ON public.goals 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

DROP POLICY IF EXISTS "goals_update_authenticated" ON public.goals;
CREATE POLICY "goals_update_authenticated" 
ON public.goals 
FOR UPDATE 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);

DROP POLICY IF EXISTS "goals_delete_authenticated" ON public.goals;
CREATE POLICY "goals_delete_authenticated" 
ON public.goals 
FOR DELETE 
USING (auth.role() = 'authenticated'::text);