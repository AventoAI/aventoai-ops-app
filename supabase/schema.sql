-- ========================================================
-- AVENTOAI OPS HUB - DATABASE SCHEMA FOR SUPABASE
-- ========================================================

-- 1. Table: Partners (Socios Fundadores)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Partners
INSERT INTO public.partners (slug, name, role, email) VALUES
  ('guillermo', 'José Guillermo Paúl Díaz', 'CEO & CTO Principal', 'guillermo@aventoai.com'),
  ('anderson', 'Anderson Estiven Méndez Lascarro', 'CTO Auxiliar', 'anderson@aventoai.com'),
  ('felipe', 'Yave Felipe Barrera', 'Líder Frontend', 'felipe@aventoai.com'),
  ('brayan', 'Brayan David Vera Mesa', 'Diseñador UI/UX & Frontend', 'brayan@aventoai.com'),
  ('mateo', 'David Mateo Carreño Díaz', 'Automatizaciones n8n & Frontend', 'mateo@aventoai.com'),
  ('juan', 'Juan Sebastián Cárdenas', 'Líder Backend', 'juan@aventoai.com'),
  ('sebastian', 'Juan Sebastián Martínez Tapias', 'Fullstack & Animación 3D', 'sebastian@aventoai.com')
ON CONFLICT (slug) DO NOTHING;


-- 2. Table: Schedules (Disponibilidad y Bloques de Trabajo)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
  time_slot TEXT NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('dev', 'meet', 'makeup', 'off')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (partner_id, day_of_week, time_slot)
);


-- 3. Table: Absences & Makeups (Novedades y Reposición Fin de Semana)
CREATE TABLE IF NOT EXISTS public.absences_makeups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  absence_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'emergency')),
  reason TEXT NOT NULL,
  makeup_slot TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences_makeups ENABLE ROW LEVEL SECURITY;

-- Allow Read & Write for Authenticated / Anon Users
CREATE POLICY "Public read for partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Public read for schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public write for schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read for absences" ON public.absences_makeups FOR SELECT USING (true);
CREATE POLICY "Public write for absences" ON public.absences_makeups FOR INSERT WITH CHECK (true);
