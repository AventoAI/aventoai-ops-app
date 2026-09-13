import { createClient } from '@supabase/supabase-js'

// Fallback values or environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Partner {
  id: string
  name: string
  role: string
  email: string
  avatarUrl?: string
  avatar: string
  pin: string
}

export const TEAM_PARTNERS: Partner[] = [
  { id: 'guillermo', name: 'José Guillermo Paúl Díaz', role: 'CEO & CTO Principal', email: 'guillermo@aventoai.com', avatar: 'GP', pin: '1234' },
  { id: 'anderson', name: 'Anderson Estiven Méndez', role: 'CTO Auxiliar', email: 'anderson@aventoai.com', avatar: 'AM', pin: '1234' },
  { id: 'felipe', name: 'Felipe Barrera', role: 'Líder de Frontend', email: 'felipe@aventoai.com', avatar: 'FB', pin: '1234' },
  { id: 'brayan', name: 'Brayan David Vera Mesa', role: 'Diseñador UI/UX & Frontend', email: 'brayan@aventoai.com', avatar: 'BV', pin: '1234' },
  { id: 'mateo', name: 'David Mateo Carreño', role: 'Automatizaciones n8n & Frontend', email: 'mateo@aventoai.com', avatar: 'MC', pin: '1234' },
  { id: 'juan', name: 'Juan Sebastián Cárdenas', role: 'Líder Backend', email: 'juan@aventoai.com', avatar: 'JC', pin: '1234' },
  { id: 'sebastian', name: 'Sebastián Martínez', role: 'Fullstack / 3D & Frontend', email: 'sebastian@aventoai.com', avatar: 'SM', pin: '1234' },
]

export interface ScheduleSlot {
  id?: string
  partnerId: string
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'
  timeSlot: string
  type: 'dev' | 'meet' | 'makeup' | 'off'
}

export interface AbsenceMakeup {
  id: string
  partnerId: string
  partnerName: string
  absenceDate: string
  type: 'personal' | 'emergency'
  reason: string
  makeupSlot?: string
  status: 'pending' | 'completed'
  createdAt: string
}

