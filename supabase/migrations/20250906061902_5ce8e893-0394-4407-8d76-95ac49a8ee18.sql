-- Create expense templates table
CREATE TABLE public.expense_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  category_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expense_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own expense templates" 
ON public.expense_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expense templates" 
ON public.expense_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense templates" 
ON public.expense_templates 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense templates" 
ON public.expense_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expense_templates_updated_at
BEFORE UPDATE ON public.expense_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();