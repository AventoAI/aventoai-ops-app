import React, { useState, useEffect } from 'react'
import { TEAM_PARTNERS, Partner, fetchScheduleForPartnerDB, saveScheduleForPartnerDB, fetchAllSchedulesFromDB } from '../lib/supabase'

interface AvailabilityMatrixProps {
  sessionPartner: Partner | null
  viewingPartnerId: string
  onOpenLogin?: () => void
}

export function AvailabilityMatrix({ sessionPartner, viewingPartnerId, onOpenLogin }: AvailabilityMatrixProps) {
  const slots = ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const [selectedMobileDay, setSelectedMobileDay] = useState<number | 'all'>('all')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const viewingPartner = TEAM_PARTNERS.find(p => p.id === viewingPartnerId) || TEAM_PARTNERS[0]
  const isEditable = sessionPartner !== null && sessionPartner.id === viewingPartnerId

  const [gridState, setGridState] = useState<Record<string, 'off' | 'dev' | 'meet' | 'makeup'>>({})

  const [teamStats, setTeamStats] = useState<{
    bestSlot: { day: string; slot: string; quorum: number; pct: number }
    secondSlot: { day: string; slot: string; quorum: number; pct: number }
    totalHours: number
    avgHours: number
    activePartnersCount: number
  }>({
    bestSlot: { day: 'Martes', slot: '18:00 - 20:00', quorum: 6, pct: 85 },
    secondSlot: { day: 'Jueves', slot: '18:00 - 20:00', quorum: 7, pct: 100 },
    totalHours: 115,
    avgHours: 16.4,
    activePartnersCount: 7
  })

  // Fetch real schedule from Supabase on viewing partner change
  useEffect(() => {
    let isMounted = true

    async function loadScheduleFromSupabase() {
      setIsLoading(true)
      const dbSlots = await fetchScheduleForPartnerDB(viewingPartnerId)

      if (!isMounted) return

      const initial: Record<string, 'off' | 'dev' | 'meet' | 'makeup'> = {}

      slots.forEach((slotStr, sIdx) => {
        days.forEach((dayStr, dIdx) => {
          const key = `${sIdx}-${dIdx}`
          const dbKey = `${slotStr}_${dayStr}`

          if (dbSlots && dbSlots[dbKey]) {
            initial[key] = dbSlots[dbKey]
          } else {
            // Default to 'off' (No disponible) if partner has not saved a schedule yet
            initial[key] = 'off'
          }
        })
      })

      setGridState(initial)
      setIsLoading(false)
    }

    loadScheduleFromSupabase()
    return () => {
      isMounted = false
    }
  }, [viewingPartnerId])

  // Compute real dynamic statistics from Supabase across all partners
  useEffect(() => {
    let isMounted = true

    async function computeStats() {
      const allSlots = await fetchAllSchedulesFromDB()
      if (!isMounted) return

      if (!allSlots || allSlots.length === 0) return

      const slotCounts: Record<string, Set<string>> = {}
      const totalSlotsByPartner = new Set<string>()
      let totalCommittedBlocks = 0

      allSlots.forEach(s => {
        if (s.type !== 'off') {
          totalCommittedBlocks++
          totalSlotsByPartner.add(s.partnerId)
        }
        if (s.type === 'meet' || s.type === 'dev') {
          const key = `${s.day} • ${s.timeSlot}`
          if (!slotCounts[key]) slotCounts[key] = new Set()
          slotCounts[key].add(s.partnerId)
        }
      })

      const totalPartnersCount = TEAM_PARTNERS.length || 7
      const sortedSlots = Object.entries(slotCounts)
        .map(([key, partnerSet]) => {
          const parts = key.split(' • ')
          const quorum = partnerSet.size
          const pct = Math.round((quorum / totalPartnersCount) * 100)
          return { day: parts[0], slot: parts[1], quorum, pct }
        })
        .sort((a, b) => b.quorum - a.quorum)

      const best = sortedSlots[0] || { day: 'Martes', slot: '18:00 - 20:00', quorum: 6, pct: 85 }
      const second = sortedSlots[1] || { day: 'Jueves', slot: '18:00 - 20:00', quorum: 5, pct: 71 }

      const totalHours = totalCommittedBlocks * 2
      const activePartnersCount = totalSlotsByPartner.size || totalPartnersCount
      const avgHours = parseFloat((totalHours / totalPartnersCount).toFixed(1))

      setTeamStats({
        bestSlot: best,
        secondSlot: second,
        totalHours,
        avgHours,
        activePartnersCount
      })
    }

    computeStats()
    return () => {
      isMounted = false
    }
  }, [gridState])

  const toggleSlot = (sIdx: number, dIdx: number) => {
    if (!isEditable) {
      if (!sessionPartner) {
        alert("🔒 Debes iniciar sesión para editar tu horario.")
        if (onOpenLogin) onOpenLogin()
      } else {
        alert(`🔒 Solo puedes modificar tu propio horario. Estás viendo el horario de ${viewingPartner.name} en modo Solo Lectura.`)
      }
      return
    }

    const key = `${sIdx}-${dIdx}`
    const states: Array<'off' | 'dev' | 'meet' | 'makeup'> = ['off', 'dev', 'meet', 'makeup']
    const current = gridState[key] || 'off'
    const nextState = states[(states.indexOf(current) + 1) % states.length]
    setGridState((prev) => ({ ...prev, [key]: nextState }))
  }

  const handleSaveToSupabase = async () => {
    if (!isEditable) {
      alert(`🔒 Estás viendo el horario de ${viewingPartner.name} en modo Solo Lectura. No puedes sobrescribir sus datos.`)
      return
    }

    setIsSaving(true)
    const slotsToSave: { day: string; timeSlot: string; type: 'off' | 'dev' | 'meet' | 'makeup' }[] = []

    slots.forEach((slotStr, sIdx) => {
      days.forEach((dayStr, dIdx) => {
        const key = `${sIdx}-${dIdx}`
        slotsToSave.push({
          day: dayStr,
          timeSlot: slotStr,
          type: gridState[key] || 'off'
        })
      })
    })

    const result = await saveScheduleForPartnerDB(viewingPartnerId, slotsToSave)
    setIsSaving(false)

    if (result.success) {
      alert(`✅ ¡El horario de ${viewingPartner.name} ha sido guardado exitosamente en tu base de datos de Supabase!`)
      // Trigger gridState update to re-compute stats
      setGridState(prev => ({ ...prev }))
    } else {
      alert(`⚠️ No se pudo guardar en Supabase: ${result.message || 'Verifica que ejecutaste la consulta SQL'}`)
    }
  }

  const getSlotClass = (state: string) => {
    switch (state) {
      case 'dev': return 'bg-[#0077FF] text-white font-bold shadow-[0_0_10px_rgba(0,119,255,0.4)]'
      case 'meet': return 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
      case 'makeup': return 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
      default: return 'bg-[#0F172A]/70 text-slate-500 border border-slate-800 hover:border-[#0077FF]/40'
    }
  }

  const getSlotLabel = (state: string) => {
    switch (state) {
      case 'dev': return 'Dev Avento'
      case 'meet': return 'Libre Reunión'
      case 'makeup': return 'Reposición'
      default: return 'No disponible'
    }
  }

  const filteredDayIndices = selectedMobileDay === 'all' 
    ? days.map((_, i) => i) 
    : [selectedMobileDay as number]

  return (
    <div className="space-y-6">
      {/* Clean & Professional Read Only or Editable Banner */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xl backdrop-blur-md ${
        isEditable
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-[#0077FF]/10 border-[#0077FF]/30 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{isEditable ? '✏️' : '👁️'}</span>
          <div>
            <p className="font-bold flex items-center gap-2">
              {isEditable
                ? `Estás en tu horario (${sessionPartner.name})`
                : `Viendo horario de ${viewingPartner.name} (${viewingPartner.role})`}
              {isLoading && (
                <span className="text-[10px] text-[#00F0FF] animate-pulse flex items-center gap-1 font-mono">
                  ⚡ Leyendo...
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isEditable
                ? 'Tienes permisos para editar y guardar cambios en tus franjas semanales.'
                : 'Modo Solo Lectura. Únicamente el propietario de este perfil puede modificar sus bloques.'}
            </p>
          </div>
        </div>

        {!isEditable && !sessionPartner && (
          <button
            onClick={onOpenLogin}
            className="px-3 py-1.5 bg-[#0077FF] hover:bg-[#0077FF]/80 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
          >
            🔐 Iniciar Sesión para Editar
          </button>
        )}
      </div>

      {/* Top Dynamic Stats Grid (Real-time Supabase Computed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Mejor Franja para Reuniones</p>
            <p className="text-base sm:text-lg font-bold text-[#00F0FF] mt-1 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              {teamStats.bestSlot.day} • {teamStats.bestSlot.slot}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Quórum: {teamStats.bestSlot.quorum} de {TEAM_PARTNERS.length} socios libres
            </p>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            {teamStats.bestSlot.pct}%
          </div>
        </div>

        <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Segunda Opción de Reunión</p>
            <p className="text-base sm:text-lg font-bold text-emerald-400 mt-1">
              {teamStats.secondSlot.day} • {teamStats.secondSlot.slot}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Quórum: {teamStats.secondSlot.quorum} de {TEAM_PARTNERS.length} socios libres
            </p>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            {teamStats.secondSlot.pct}%
          </div>
        </div>

        <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 flex items-center justify-between shadow-xl sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Horas Totales Comprometidas</p>
            <p className="text-base sm:text-lg font-bold text-slate-100 mt-1">
              {teamStats.totalHours} Horas / Semana
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Promedio: {teamStats.avgHours} hrs / socio
            </p>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0077FF]/15 border border-[#0077FF]/30 text-[#0077FF] flex items-center justify-center font-bold text-xs sm:text-sm">
            {teamStats.activePartnersCount}/{TEAM_PARTNERS.length}
          </div>
        </div>
      </div>

      {/* Schedule Selector Component */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 feather-glow-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">📅</span> Franjas de Disponibilidad Semanal
            </h2>
            <p className="text-xs text-slate-400">
              {isEditable
                ? "Haz clic en los bloques para definir tus horas de desarrollo y franjas para reuniones."
                : `Consultando los bloques asignados de ${viewingPartner.name}.`}
            </p>
          </div>

          <button
            onClick={handleSaveToSupabase}
            disabled={!isEditable || isSaving}
            className={`w-full sm:w-auto px-4 py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isEditable
                ? 'bg-gradient-to-r from-[#0077FF] to-[#00F0FF] hover:opacity-90 text-slate-950 shadow-[#0077FF]/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Guardando en Supabase...</span>
              </>
            ) : isEditable ? (
              'Guardar Mi Horario'
            ) : (
              '🔒 Solo Lectura'
            )}
          </button>
        </div>

        {/* Mobile Day Filter Pills */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedMobileDay('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedMobileDay === 'all'
                ? 'bg-[#0077FF] text-white shadow-md'
                : 'bg-[#0F172A] text-slate-400 border border-slate-800'
            }`}
          >
            Toda la semana
          </button>
          {days.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedMobileDay(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedMobileDay === i
                  ? 'bg-[#0077FF] text-white shadow-md'
                  : 'bg-[#0F172A] text-slate-400 border border-slate-800'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-center border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-[#0F172A]/90 text-slate-300 border-b border-[#0077FF]/20">
                <th className="p-3 text-left font-semibold sticky left-0 bg-[#0F172A] z-10">Franja Horaria</th>
                {filteredDayIndices.map((dIdx) => (
                  <th key={days[dIdx]} className={`p-3 font-semibold ${dIdx >= 5 ? 'text-amber-400' : ''}`}>
                    {days[dIdx]} {dIdx >= 5 ? '(Reposición)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0077FF]/15">
              {slots.map((slot, sIdx) => (
                <tr key={slot}>
                  <td className="p-3 text-left font-medium text-slate-300 bg-[#0F172A]/90 border-r border-[#0077FF]/20 sticky left-0 z-10 shadow-r">
                    {slot}
                  </td>
                  {filteredDayIndices.map((dIdx) => {
                    const key = `${sIdx}-${dIdx}`
                    const state = gridState[key] || 'off'
                    return (
                      <td key={dIdx} className="p-1.5 sm:p-2 min-w-[100px]">
                        <button
                          onClick={() => toggleSlot(sIdx, dIdx)}
                          className={`w-full py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-sm ${getSlotClass(state)} ${
                            !isEditable ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-[1.02]'
                          }`}
                          title={!isEditable ? `Horario de ${viewingPartner.name} (Solo Lectura)` : 'Clic para cambiar tipo'}
                        >
                          {getSlotLabel(state)}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs pt-2 text-slate-400">
          <span className="font-medium text-slate-300">Convenciones:</span>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-[#0077FF]"></span> <span>Dev Avento</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> <span>Reunión</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-500"></span> <span>Reposición</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-[#0F172A] border border-slate-700"></span> <span>No disponible</span></div>
        </div>
      </div>
    </div>
  )
}
