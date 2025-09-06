-- Enable RLS on daily_cash table and add policies
ALTER TABLE public.daily_cash ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_cash
CREATE POLICY "Users can view their own daily cash records" 
ON public.daily_cash 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily cash records" 
ON public.daily_cash 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily cash records" 
ON public.daily_cash 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily cash records" 
ON public.daily_cash 
FOR DELETE 
USING (auth.uid() = user_id);