-- Create models table
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  specs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- Create indexes for faster lookups
CREATE INDEX idx_models_brand_id ON public.models(brand_id);
CREATE INDEX idx_models_name ON public.models(name);

-- Enable RLS
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Models are viewable by everyone" ON public.models
  FOR SELECT USING (true);
