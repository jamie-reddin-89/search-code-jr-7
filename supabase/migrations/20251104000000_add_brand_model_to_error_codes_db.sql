-- Add brand_id and model_id columns to error_codes_db and index for model_id
ALTER TABLE public.error_codes_db
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS model_id uuid REFERENCES public.models(id) ON DELETE SET NULL;

-- Optional but recommended index on model_id for faster filtering by device model
CREATE INDEX IF NOT EXISTS idx_error_codes_db_model_id ON public.error_codes_db(model_id);
