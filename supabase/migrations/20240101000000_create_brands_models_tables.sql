-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(2048),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create models table
CREATE TABLE IF NOT EXISTS public.models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  specs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON public.models(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow public read access)
CREATE POLICY "Enable read access for all users" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.models
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (for admin)
CREATE POLICY "Enable insert/update/delete for authenticated users" ON public.brands
  FOR INSERT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert/update/delete for authenticated users" ON public.models
  FOR INSERT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.models
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.models
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.brands (name, description) VALUES
  ('Joule', 'Joule heating systems'),
  ('DeDietrich', 'DeDietrich heating solutions'),
  ('LG', 'LG heat pump systems'),
  ('Hitachi', 'Hitachi Yutaki series'),
  ('Panasonic', 'Panasonic Aquarea systems'),
  ('Grant', 'Grant heating systems'),
  ('Itec', 'Itec Thermia systems'),
  ('Smart Control', 'Smart Control systems'),
  ('System Status', 'System Status monitoring')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.models (brand_id, name, description) VALUES
  ((SELECT id FROM public.brands WHERE name = 'Joule'), 'Victorum', 'Joule Victorum model'),
  ((SELECT id FROM public.brands WHERE name = 'Joule'), 'Samsung', 'Joule Samsung model'),
  ((SELECT id FROM public.brands WHERE name = 'Joule'), 'Modular Air', 'Joule Modular Air model'),
  ((SELECT id FROM public.brands WHERE name = 'DeDietrich'), 'Strateo', 'DeDietrich Strateo model'),
  ((SELECT id FROM public.brands WHERE name = 'LG'), 'Thermia', 'LG Thermia model'),
  ((SELECT id FROM public.brands WHERE name = 'Hitachi'), 'Yutaki', 'Hitachi Yutaki model'),
  ((SELECT id FROM public.brands WHERE name = 'Panasonic'), 'Aquarea', 'Panasonic Aquarea model'),
  ((SELECT id FROM public.brands WHERE name = 'Grant'), 'Areona', 'Grant Areona model'),
  ((SELECT id FROM public.brands WHERE name = 'Itec'), 'Thermia', 'Itec Thermia model')
ON CONFLICT (brand_id, name) DO NOTHING;
