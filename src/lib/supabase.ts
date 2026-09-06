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
}

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
