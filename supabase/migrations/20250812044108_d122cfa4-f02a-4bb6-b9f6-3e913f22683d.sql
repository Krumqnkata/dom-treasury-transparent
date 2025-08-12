-- Create table for daily cash records
CREATE TABLE public.daily_cash (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_cash ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_cash
CREATE POLICY "daily_cash_select_authenticated" 
ON public.daily_cash 
FOR SELECT 
USING (true);

CREATE POLICY "daily_cash_insert_authenticated" 
ON public.daily_cash 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "daily_cash_update_authenticated" 
ON public.daily_cash 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "daily_cash_delete_authenticated" 
ON public.daily_cash 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_cash_updated_at
BEFORE UPDATE ON public.daily_cash
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on date queries
CREATE INDEX idx_daily_cash_date ON public.daily_cash(date DESC);