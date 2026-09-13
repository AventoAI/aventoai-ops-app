-- ========================================================
-- AVENTOAI OPS HUB - DATABASE SCHEMA FOR SUPABASE
-- Execute this script in Supabase SQL Editor
-- ========================================================

-- 1. Table: Partners (Socios Fundadores)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Partners
INSERT INTO public.partners (slug, name, role, email) VALUES
  ('guillermo', 'José Guillermo Paúl Díaz', 'CEO & CTO Principal', 'guillermo@aventoai.com'),
  ('anderson', 'Anderson Estiven Méndez Lascarro', 'CTO Auxiliar', 'anderson@aventoai.com'),
  ('felipe', 'Yave Felipe Barrera', 'Líder Frontend', 'felipe@aventoai.com'),
  ('brayan', 'Brayan David Vera Mesa', 'Diseñador UI/UX & Frontend', 'brayan@aventoai.com'),
  ('mateo', 'David Mateo Carreño Díaz', 'Automatizaciones n8n & Frontend', 'mateo@aventoai.com'),
  ('juan', 'Juan Sebastián Cárdenas', 'Líder Backend', 'juan@aventoai.com'),
  ('sebastian', 'Juan Sebastián Martínez Tapias', 'Fullstack & Animación 3D', 'sebastian@aventoai.com')
ON CONFLICT (slug) DO NOTHING;


-- 2. Table: Schedule Slots (Matriz de Disponibilidad)
CREATE TABLE IF NOT EXISTS public.schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  day TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT schedule_slots_partner_day_slot_key UNIQUE (partner_id, day, time_slot)
);


-- 3. Table: Absence Makeups (Novedades y Reposición)
CREATE TABLE IF NOT EXISTS public.absence_makeups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  absence_date TEXT NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  makeup_slot TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 4. Table: Projects (Listado Dinámico de Proyectos)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('star', 'alliance', 'internal', 'client')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Projects
INSERT INTO public.projects (name, category, description) VALUES
  ('CRM AventoAI', 'star', 'Producto Propio - CRM & Inbox Multi-Tenant'),
  ('MindConnect', 'alliance', 'Alianza Estratégica 50/50'),
  ('Veva / Clientes', 'client', 'Desarrollos y Soporte para Clientes Externos'),
  ('Landing Page AventoAI', 'internal', 'Mejoras Visuales y UX Internas')
ON CONFLICT (name) DO NOTHING;


-- 5. Table: Project Allocations (Asignación de Horas por Socio y Proyecto)
CREATE TABLE IF NOT EXISTS public.project_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('star', 'alliance', 'internal', 'client')),
  hours INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 6. Table: Stalled Tasks (Control de Tareas >48h sin avance)
CREATE TABLE IF NOT EXISTS public.stalled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  assigned_name TEXT NOT NULL,
  assigned_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  hours_stalled INTEGER NOT NULL DEFAULT 48,
  last_update TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Sample Stalled Tasks
INSERT INTO public.stalled_tasks (title, assigned_name, assigned_email, project_name, hours_stalled, last_update) VALUES
  ('Integración Webhook n8n multi-tenant (CRM)', 'David Mateo Carreño', 'mateo@aventoai.com', 'CRM AventoAI', 52, 'Esperando respuesta de schema de base de datos'),
  ('Pruebas de microexpresiones en App Móvil', 'Anderson Estiven Méndez', 'anderson@aventoai.com', 'MindConnect', 49, 'Pendiente prueba de servidor sandbox'),
  ('Maquetación de Inbox conversacional', 'José Guillermo Paúl Díaz', 'guillermo@aventoai.com', 'CRM AventoAI', 48, 'Revisión de componentes UI')
ON CONFLICT DO NOTHING;


-- ========================================================
-- PERMISSIONS & ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

GRANT ALL ON TABLE public.partners TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.schedule_slots TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.absence_makeups TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.projects TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.project_allocations TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.stalled_tasks TO anon, authenticated, postgres, service_role;

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_makeups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalled_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to partners" ON public.partners;
DROP POLICY IF EXISTS "Allow public full access to schedule_slots" ON public.schedule_slots;
DROP POLICY IF EXISTS "Allow public full access to absence_makeups" ON public.absence_makeups;
DROP POLICY IF EXISTS "Allow public full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public full access to project_allocations" ON public.project_allocations;
DROP POLICY IF EXISTS "Allow public full access to stalled_tasks" ON public.stalled_tasks;

CREATE POLICY "Allow public full access to partners" ON public.partners
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access to schedule_slots" ON public.schedule_slots
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access to absence_makeups" ON public.absence_makeups
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access to projects" ON public.projects
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access to project_allocations" ON public.project_allocations
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access to stalled_tasks" ON public.stalled_tasks
  FOR ALL TO public USING (true) WITH CHECK (true);
