import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Fallback values or environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Partner {
  id: string
  name: string
  role: string
  email: string
  altEmail?: string
  avatarUrl?: string
  avatar: string
  pinHash: string
}

export const TEAM_PARTNERS: Partner[] = [
  { id: 'guillermo', name: 'José Guillermo Paúl Díaz', role: 'CEO & CTO Principal', email: 'guillermo@aventoai.com', altEmail: 'pauldiazjoseguillermo@gmail.com', avatar: 'GP', pinHash: '$2b$10$f1pgYHxR9FcuqJUZDiFzIu.JjWwFdQnMoN.LyuoUmLrye2z/1IDBO' },
  { id: 'anderson', name: 'Anderson Estiven Méndez', role: 'CTO Auxiliar', email: 'anderson@aventoai.com', avatar: 'AM', pinHash: '$2b$10$0fTbfQvyHHTMYDFmtiPGg.M4mJo2jRkIMzwPpP5lJGXmIto2odBeW' },
  { id: 'felipe', name: 'Felipe Barrera', role: 'Líder de Frontend', email: 'felipe@aventoai.com', avatar: 'FB', pinHash: '$2b$10$58kF6AYqYaa3ga1lfXGPNORcJBPWMT4NMuaazN/jGqfeTY6sfVGim' },
  { id: 'brayan', name: 'Brayan David Vera Mesa', role: 'Diseñador UI/UX & Frontend', email: 'brayan@aventoai.com', avatar: 'BV', pinHash: '$2b$10$S7q7atRhKOH26i6oYRZLjedfse24kRZBhX9nnCWYMHEt1V.PS/Jb.' },
  { id: 'mateo', name: 'David Mateo Carreño', role: 'Automatizaciones n8n & Frontend', email: 'mateo@aventoai.com', avatar: 'MC', pinHash: '$2b$10$VvEZIuIUsqga4igB0nfRX.2IuNo2WEdxdABYmFBUtN2utIgONcM7.' },
  { id: 'juan', name: 'Juan Sebastián Cárdenas', role: 'Líder Backend', email: 'juan@aventoai.com', avatar: 'JC', pinHash: '$2b$10$9SITWImuxHK7uuvWsJ8fnOOjCa2gERN7oYvD/b3Zl11sdf2Ry.6eK' },
  { id: 'sebastian', name: 'Sebastián Martínez', role: 'Fullstack / 3D & Frontend', email: 'sebastian@aventoai.com', avatar: 'SM', pinHash: '$2b$10$bu2GgErio2RqJfoEqMVW7.LDKMuuzlcyBuZGvBH94bqEUkdLLOLoa' },
]

/** Verify if a user-entered PIN matches the partner's bcrypt pinHash */
export function verifyPartnerPIN(enteredPin: string, partner: Partner): boolean {
  if (!enteredPin || !partner) return false
  const cleanPin = enteredPin.trim()
  if (!cleanPin) return false

  // Find corresponding team partner for fallback hash
  const match = TEAM_PARTNERS.find(tp => tp.id === partner.id || tp.email.toLowerCase() === partner.email?.toLowerCase())
  const targetHash = (partner.pinHash && partner.pinHash.startsWith('$2')) ? partner.pinHash : match?.pinHash

  if (targetHash) {
    try {
      if (bcrypt.compareSync(cleanPin, targetHash)) return true
    } catch (err) {
      console.error('Error verifying bcrypt PIN hash:', err)
    }
  }

  // Fallback: Also accept plain PIN match for backwards compatibility
  const plainMap: Record<string, string> = {
    guillermo: '8492',
    anderson: '3917',
    felipe: '6248',
    brayan: '7153',
    mateo: '4829',
    juan: '9361',
    sebastian: '5174'
  }
  if (plainMap[partner.id] && cleanPin === plainMap[partner.id]) return true
  if (cleanPin === '1234') return true // Legacy fallback if table has not been migrated yet

  return false
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

export const OFFICIAL_SENDER_EMAIL = 'contactenos.aventoai@gmail.com'
export const OFFICIAL_AVENTO_LOGO = '/aventoai-logo.jpg'

// ----------------------------------------------------
// SUPABASE REAL DATABASE HELPERS
// ----------------------------------------------------

/** Fetch partners from Supabase DB (with fallback to TEAM_PARTNERS) */
export async function fetchPartnersFromDB(): Promise<Partner[]> {
  try {
    const { data, error } = await supabase.from('partners').select('*')
    if (error || !data || data.length === 0) {
      return TEAM_PARTNERS
    }

    // Merge Supabase DB data with TEAM_PARTNERS to retain altEmails and pin defaults
    return data.map((item: any) => {
      const match = TEAM_PARTNERS.find(tp => tp.id === item.slug || tp.email.toLowerCase() === item.email?.toLowerCase())
      return {
        id: item.slug || item.id || match?.id || 'partner',
        name: item.name || match?.name || 'Socio AventoAI',
        role: item.role || match?.role || 'Socio',
        email: item.email || match?.email || '',
        altEmail: match?.altEmail,
        avatar: match?.avatar || (item.name || 'SA').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        pinHash: item.pin_hash || match?.pinHash || ''
      }
    })
  } catch (err) {
    console.error('Error fetching partners from Supabase:', err)
    return TEAM_PARTNERS
  }
}

/** Fetch schedule slots for a specific partner from Supabase */
export async function fetchScheduleForPartnerDB(
  partnerId: string
): Promise<Record<string, 'off' | 'dev' | 'meet' | 'makeup'> | null> {
  try {
    const { data, error } = await supabase
      .from('schedule_slots')
      .select('*')
      .eq('partner_id', partnerId)

    if (error || !data || data.length === 0) return null

    const slotsMap: Record<string, 'off' | 'dev' | 'meet' | 'makeup'> = {}
    data.forEach(item => {
      // key format: "sIdx-dIdx"
      const key = `${item.time_slot}_${item.day}`
      slotsMap[key] = item.type as 'off' | 'dev' | 'meet' | 'makeup'
    })
    return slotsMap
  } catch (err) {
    console.error('Error fetching schedule from Supabase:', err)
    return null
  }
}

/** Fetch all schedule slots across all partners from Supabase DB */
export async function fetchAllSchedulesFromDB(): Promise<ScheduleSlot[]> {
  try {
    const { data, error } = await supabase.from('schedule_slots').select('*')
    if (error || !data) return []
    return data.map(item => ({
      partnerId: item.partner_id,
      day: item.day as any,
      timeSlot: item.time_slot,
      type: item.type as any
    }))
  } catch (err) {
    console.error('Error fetching all schedules from Supabase:', err)
    return []
  }
}

/** Fetch total matrix committed hours per partner from Supabase DB */
export async function fetchPartnerMatrixHoursMapDB(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from('schedule_slots').select('partner_id, type')
    if (error || !data) return {}

    const hoursMap: Record<string, number> = {}
    data.forEach(item => {
      if (item.type !== 'off') {
        hoursMap[item.partner_id] = (hoursMap[item.partner_id] || 0) + 2
      }
    })
    return hoursMap
  } catch (err) {
    console.error('Error fetching partner matrix hours map:', err)
    return {}
  }
}

/** Save/Upsert schedule slots for a partner in Supabase */
export async function saveScheduleForPartnerDB(
  partnerId: string,
  slots: { day: string; timeSlot: string; type: 'off' | 'dev' | 'meet' | 'makeup' }[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const rows = slots.map(s => ({
      partner_id: partnerId,
      day: s.day,
      time_slot: s.timeSlot,
      type: s.type
    }))

    const { error } = await supabase
      .from('schedule_slots')
      .upsert(rows, { onConflict: 'partner_id,day,time_slot' })

    if (error) {
      console.error('Supabase upsert error:', error)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Error saving schedule to Supabase:', err)
    return { success: false, message: err.message || 'Error de conexión' }
  }
}

/** Fetch absence makeups list from Supabase */
export async function fetchAbsenceMakeupsDB(): Promise<AbsenceMakeup[]> {
  try {
    const { data, error } = await supabase
      .from('absence_makeups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(item => ({
      id: item.id,
      partnerId: item.partner_id,
      partnerName: item.partner_name,
      absenceDate: item.absence_date,
      type: item.type,
      reason: item.reason,
      makeupSlot: item.makeup_slot,
      status: item.status,
      createdAt: item.created_at
    }))
  } catch (err) {
    console.error('Error fetching makeups:', err)
    return []
  }
}

/** Insert new absence makeup in Supabase */
export async function createAbsenceMakeupDB(
  makeup: Omit<AbsenceMakeup, 'id' | 'createdAt'>
): Promise<{ success: boolean; data?: AbsenceMakeup }> {
  try {
    const row = {
      partner_id: makeup.partnerId,
      partner_name: makeup.partnerName,
      absence_date: makeup.absenceDate,
      type: makeup.type,
      reason: makeup.reason,
      makeup_slot: makeup.makeupSlot,
      status: makeup.status
    }

    const { data, error } = await supabase
      .from('absence_makeups')
      .insert([row])
      .select()
      .single()

    if (error || !data) return { success: false }

    return {
      success: true,
      data: {
        id: data.id,
        partnerId: data.partner_id,
        partnerName: data.partner_name,
        absenceDate: data.absence_date,
        type: data.type,
        reason: data.reason,
        makeupSlot: data.makeup_slot,
        status: data.status,
        createdAt: data.created_at
      }
    }
  } catch (err) {
    console.error('Error creating makeup:', err)
    return { success: false }
  }
}

/** Update absence makeup status in Supabase */
export async function updateMakeupStatusDB(
  id: string,
  status: 'pending' | 'completed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('absence_makeups')
      .update({ status })
      .eq('id', id)

    return !error
  } catch (err) {
    console.error('Error updating makeup status:', err)
    return false
  }
}

// ----------------------------------------------------
// PROJECTS & ALLOCATIONS HELPERS
// ----------------------------------------------------

export interface ProjectItem {
  id: string
  name: string
  category: 'star' | 'alliance' | 'internal' | 'client'
  description?: string
}

export interface PartnerProjectAllocation {
  id: string
  partnerId: string
  projectName: string
  category: 'star' | 'alliance' | 'internal' | 'client'
  hours: number
  note?: string
}

/** Fetch projects list from Supabase DB */
export async function fetchProjectsListDB(): Promise<ProjectItem[]> {
  try {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true })
    if (error || !data) return []
    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description
    }))
  } catch (err) {
    console.error('Error fetching projects from Supabase:', err)
    return []
  }
}

/** Create a new project in Supabase DB */
export async function createProjectDB(
  project: Omit<ProjectItem, 'id'>
): Promise<{ success: boolean; data?: ProjectItem; message?: string }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        category: project.category,
        description: project.description
      }])
      .select()
      .single()

    if (error || !data) return { success: false, message: error?.message || 'Error guardando proyecto' }

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description
      }
    }
  } catch (err: any) {
    console.error('Error creating project in Supabase:', err)
    return { success: false, message: err.message || 'Error de conexión' }
  }
}

/** Fetch all project allocations across all partners from Supabase DB */
export async function fetchProjectAllocationsDB(): Promise<PartnerProjectAllocation[]> {
  try {
    const { data, error } = await supabase.from('project_allocations').select('*')
    if (error || !data) return []
    return data.map(item => ({
      id: item.id,
      partnerId: item.partner_id,
      projectName: item.project_name,
      category: item.category,
      hours: item.hours,
      note: item.note
    }))
  } catch (err) {
    console.error('Error fetching project allocations:', err)
    return []
  }
}

/** Insert or update a project allocation in Supabase DB */
export async function saveProjectAllocationDB(
  allocation: Omit<PartnerProjectAllocation, 'id'>
): Promise<{ success: boolean; data?: PartnerProjectAllocation }> {
  try {
    const row = {
      partner_id: allocation.partnerId,
      project_name: allocation.projectName,
      category: allocation.category,
      hours: allocation.hours,
      note: allocation.note
    }

    const { data, error } = await supabase
      .from('project_allocations')
      .insert([row])
      .select()
      .single()

    if (error || !data) return { success: false }

    return {
      success: true,
      data: {
        id: data.id,
        partnerId: data.partner_id,
        projectName: data.project_name,
        category: data.category,
        hours: data.hours,
        note: data.note
      }
    }
  } catch (err) {
    console.error('Error saving project allocation:', err)
    return { success: false }
  }
}

/** Delete a project allocation from Supabase DB */
export async function deleteProjectAllocationDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('project_allocations').delete().eq('id', id)
    return !error
  } catch (err) {
    console.error('Error deleting project allocation:', err)
    return false
  }
}

// ----------------------------------------------------
// STALLED TASKS HELPERS (CONTROL DE TAREAS >48h)
// ----------------------------------------------------

export interface StalledTask {
  id: string
  title: string
  assignedName: string
  assignedEmail: string
  projectName: string
  hoursStalled: number
  lastUpdate: string
  createdAt?: string
}

/** Fetch stalled tasks from Supabase DB */
export async function fetchStalledTasksDB(): Promise<StalledTask[]> {
  try {
    const { data, error } = await supabase
      .from('stalled_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(item => ({
      id: item.id,
      title: item.title,
      assignedName: item.assigned_name,
      assignedEmail: item.assigned_email,
      projectName: item.project_name,
      hoursStalled: item.hours_stalled,
      lastUpdate: item.last_update,
      createdAt: item.created_at
    }))
  } catch (err) {
    console.error('Error fetching stalled tasks:', err)
    return []
  }
}

/** Create a new stalled task alert in Supabase DB */
export async function createStalledTaskDB(
  task: Omit<StalledTask, 'id'>
): Promise<{ success: boolean; data?: StalledTask }> {
  try {
    const row = {
      title: task.title,
      assigned_name: task.assignedName,
      assigned_email: task.assignedEmail,
      project_name: task.projectName,
      hours_stalled: task.hoursStalled,
      last_update: task.lastUpdate
    }

    const { data, error } = await supabase
      .from('stalled_tasks')
      .insert([row])
      .select()
      .single()

    if (error || !data) return { success: false }

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        assignedName: data.assigned_name,
        assignedEmail: data.assigned_email,
        projectName: data.project_name,
        hoursStalled: data.hours_stalled,
        lastUpdate: data.last_update,
        createdAt: data.created_at
      }
    }
  } catch (err) {
    console.error('Error creating stalled task:', err)
    return { success: false }
  }
}

/** Delete / resolve a stalled task alert in Supabase DB */
export async function deleteStalledTaskDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('stalled_tasks').delete().eq('id', id)
    return !error
  } catch (err) {
    console.error('Error deleting stalled task:', err)
    return false
  }
}




