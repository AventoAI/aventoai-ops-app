import React, { useState, useEffect } from 'react'
import { TEAM_PARTNERS, Partner } from '../lib/supabase'

interface AvailabilityMatrixProps {
  sessionPartner: Partner | null
  viewingPartnerId: string
  onOpenLogin?: () => void
}

export function AvailabilityMatrix({ sessionPartner, viewingPartnerId, onOpenLogin }: AvailabilityMatrixProps) {
  const slots = ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const [selectedMobileDay, setSelectedMobileDay] = useState<number | 'all'>('all')

  const viewingPartner = TEAM_PARTNERS.find(p => p.id === viewingPartnerId) || TEAM_PARTNERS[0]
  const isEditable = sessionPartner !== null && sessionPartner.id === viewingPartnerId

  // Mock initial grids per partner to simulate different member schedules
  const [gridState, setGridState] = useState<Record<string, 'off' | 'dev' | 'meet' | 'makeup'>>({})

  useEffect(() => {
    // Generate deterministic mock schedule based on partner ID
    const partnerHash = viewingPartnerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const initial: Record<string, 'off' | 'dev' | 'meet' | 'makeup'> = {}
    
    slots.forEach((_, sIdx) => {
      days.forEach((_, dIdx) => {
        const key = `${sIdx}-${dIdx}`
        const seed = (sIdx + 1) * (dIdx + 1) + partnerHash
        if (seed % 11 === 0) initial[key] = 'meet'
        else if (seed % 3 === 0 && dIdx < 5) initial[key] = 'dev'
        else if (dIdx >= 5 && seed % 4 === 0) initial[key] = 'makeup'
        else initial[key] = 'off'
      })
    })
    setGridState(initial)
  }, [viewingPartnerId])

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
      {/* Read Only or Editable Alert Banner */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xl backdrop-blur-md ${
        isEditable
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-[#0077FF]/10 border-[#0077FF]/30 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{isEditable ? '✏️' : '👁️'}</span>
          <div>
            <p className="font-bold">
              {isEditable
                ? `Estás en tu horario (${sessionPartner.name})`
                : `Viendo horario de ${viewingPartner.name} (${viewingPartner.role})`}
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

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Mejor Franja para Reuniones</p>
            <p className="text-base sm:text-lg font-bold text-[#00F0FF] mt-1 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              Martes • 6:00 PM - 8:00 PM
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Quórum: 6 de 7 socios libres</p>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            85%
          </div>
        </div>

        <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Segunda Opción de Reunión</p>
            <p className="text-base sm:text-lg font-bold text-emerald-400 mt-1">Jueves • 7:00 PM - 9:00 PM</p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Quórum: 7 de 7 socios libres</p>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            100%
          </div>
        </div>

        <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 flex items-center justify-between shadow-xl sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Horas Totales Comprometidas</p>
            <p className="text-base sm:text-lg font-bold text-slate-100 mt-1">115 Horas / Semana</p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Promedio: 16.4 hrs / socio</p>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0077FF]/15 border border-[#0077FF]/30 text-[#0077FF] flex items-center justify-center font-bold text-xs sm:text-sm">
            7/7
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
            onClick={() => {
              if (isEditable) {
                alert(`¡Horario de ${viewingPartner.name} guardado exitosamente en Supabase!`)
              } else {
                alert(`🔒 Estás viendo el horario de ${viewingPartner.name} en modo Solo Lectura. No puedes sobrescribir sus datos.`)
              }
            }}
            disabled={!isEditable}
            className={`w-full sm:w-auto px-4 py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg ${
              isEditable
                ? 'bg-gradient-to-r from-[#0077FF] to-[#00F0FF] hover:opacity-90 text-slate-950 shadow-[#0077FF]/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isEditable ? 'Guardar Mi Horario' : '🔒 Solo Lectura'}
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
          <table className="w-full text-xs text-center border-collapse">
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
