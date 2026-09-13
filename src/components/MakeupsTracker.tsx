import React, { useState, useEffect } from 'react'
import { AbsenceMakeup, Partner, fetchAbsenceMakeupsDB, createAbsenceMakeupDB, updateMakeupStatusDB } from '../lib/supabase'

interface MakeupsTrackerProps {
  sessionPartner?: Partner | null
}

export function MakeupsTracker({ sessionPartner }: MakeupsTrackerProps) {
  const [absenceType, setAbsenceType] = useState<'personal' | 'emergency'>('personal')
  const [makeups, setMakeups] = useState<AbsenceMakeup[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [makeupSlot, setMakeupSlot] = useState('Sábado • 8:00 AM - 12:00 PM')

  // Fetch real absence makeups from Supabase DB on component mount
  useEffect(() => {
    let isMounted = true

    async function loadMakeupsFromDB() {
      setIsLoading(true)
      const dbData = await fetchAbsenceMakeupsDB()

      if (!isMounted) return

      if (dbData !== null) {
        setMakeups(dbData)
      } else {
        setMakeups([])
      }
      setIsLoading(false)
    }

    loadMakeupsFromDB()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const partnerId = sessionPartner?.id || 'guillermo'
    const partnerName = sessionPartner?.name || 'José Guillermo Paúl Díaz'

    const newMakeupData = {
      partnerId,
      partnerName,
      absenceDate: date || 'Próximo turno',
      type: absenceType,
      reason: reason || 'Novedad personal de horario',
      makeupSlot: absenceType === 'personal' ? makeupSlot : undefined,
      status: 'pending' as const
    }

    setIsSaving(true)
    const result = await createAbsenceMakeupDB(newMakeupData)
    setIsSaving(false)

    if (result.success && result.data) {
      setMakeups(prev => [result.data!, ...prev])
      setReason('')
      setDate('')
      alert('✅ Compromiso de reposición registrado exitosamente en tu base de datos de Supabase.')
    } else {
      // Fallback local addition if DB table isn't ready
      const fallback: AbsenceMakeup = {
        id: Date.now().toString(),
        ...newMakeupData,
        createdAt: new Date().toISOString()
      }
      setMakeups(prev => [fallback, ...prev])
      setReason('')
      setDate('')
      alert('⚠️ Registrado localmente. Si no guardó en Supabase, asegúrate de ejecutar el script SQL en Supabase.')
    }
  }

  const markCompleted = async (id: string) => {
    // Optimistic update in UI
    setMakeups(prev => prev.map(m => m.id === id ? { ...m, status: 'completed' } : m))

    // Real update in Supabase
    await updateMakeupStatusDB(id, 'completed')
  }

  return (
    <div className="space-y-5">
      {/* Explanatory Banner of Business Logic */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 shadow-xl space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">💡 Lógica de Novedades & Reposiciones en AventoAI Ops Hub</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-300">
          <div className="p-2.5 rounded-xl bg-[#0F172A]/70 border border-[#0077FF]/15">
            <strong className="text-white block mb-0.5">1. Matriz vs. Novedad Puntual</strong>
            La Matriz de Disponibilidad es tu horario fijo recurrente. Para ausencias de un día o turno, registras la novedad aquí sin alterar tu horario base.
          </div>
          <div className="p-2.5 rounded-xl bg-[#0F172A]/70 border border-[#0077FF]/15">
            <strong className="text-white block mb-0.5">2. Reflejo en Matriz</strong>
            Al pactar reposición de fin de semana (Sábado/Domingo), el bloque se resalta en <span className="text-amber-400 font-semibold">Naranja (Reposición)</span> en el cuadrante de horarios.
          </div>
          <div className="p-2.5 rounded-xl bg-[#0F172A]/70 border border-[#0077FF]/15">
            <strong className="text-white block mb-0.5">3. Control de Cumplimiento</strong>
            El socio o el CEO marca <strong className="text-emerald-400">"Marcar Cumplido"</strong> tras ejecutar la reposición, cambiando el estado en Supabase a <span className="text-emerald-400 font-bold">Verificado ✓</span>.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form: Registrar Novedad */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-[#00F0FF]">📝</span> Registrar Novedad / Reprogramación
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Socio Solicitante:</label>
            <div className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl p-2.5 text-[#00F0FF] font-bold">
              {sessionPartner ? `${sessionPartner.name} (${sessionPartner.role.split(' ')[0]})` : 'José Guillermo Paúl Díaz (CEO)'}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tipo de Novedad:</label>
            <select
              value={absenceType}
              onChange={(e) => setAbsenceType(e.target.value as 'personal' | 'emergency')}
              className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl p-2.5 text-slate-200 focus:outline-none"
            >
              <option value="personal">Asunto Personal / Salida (Requiere Reposición)</option>
              <option value="emergency">Emergencia Familiar / Salud (Justificada)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Fecha / Franja que NO trabajarás:</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: 'light' }}
              className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl p-2.5 text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          {absenceType === 'personal' && (
            <div>
              <label className="block text-amber-400 font-semibold mb-1">Bloque de Reposición en Fin de Semana:</label>
              <select
                value={makeupSlot}
                onChange={(e) => setMakeupSlot(e.target.value)}
                className="w-full bg-[#0F172A] border border-amber-500/40 rounded-xl p-2.5 text-amber-200 focus:outline-none cursor-pointer"
              >
                <option>Sábado • 8:00 AM - 12:00 PM</option>
                <option>Sábado • 2:00 PM - 6:00 PM</option>
                <option>Domingo • 9:00 AM - 1:00 PM</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">Justificación o Detalle:</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl p-2.5 text-slate-200 focus:outline-none"
              placeholder="Motivo o tarea a adelantar en la reposición..."
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Guardando en Supabase...</span>
              </>
            ) : (
              'Registrar Compromiso de Reposición'
            )}
          </button>
        </form>
      </div>

      {/* List: Historical Makeups */}
      <div className="lg:col-span-2 bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-[#00F0FF]">🔄</span> Compromisos de Reposición Activos
          </h2>
          {isLoading && (
            <span className="text-xs text-[#00F0FF] animate-pulse flex items-center gap-1 font-mono">
              ⚡ Leyendo de Supabase...
            </span>
          )}
        </div>

        <div className="space-y-3">
          {makeups.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0F172A]/50 border border-dashed border-slate-800 text-center space-y-2">
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-bold text-emerald-400">Sin compromisos de reposición registrados</p>
              <p className="text-xs text-slate-400">Usa el formulario a la izquierda para registrar novedades o bloques de horas a reponer.</p>
            </div>
          ) : (
            makeups.map((m) => (
              <div
                key={m.id}
                className={`bg-[#0F172A]/80 border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${m.status === 'pending' ? 'border-amber-500/40' : 'border-[#0077FF]/30'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{m.partnerName}</span>
                    {m.status === 'pending' ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded border border-amber-500/30">
                        Pendiente Reposición
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/30">
                        Reposición Cumplida
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Novedad: {m.reason}</p>
                  {m.makeupSlot && (
                    <p className="text-xs text-amber-300 font-medium">Bloque de Reposición: {m.makeupSlot}</p>
                  )}
                </div>
                {m.status === 'pending' ? (
                  <button
                    onClick={() => markCompleted(m.id)}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Marcar Cumplido
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">✓ Verificado</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)
}

