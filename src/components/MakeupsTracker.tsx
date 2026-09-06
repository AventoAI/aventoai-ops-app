import React, { useState } from 'react'
import { AbsenceMakeup } from '../lib/supabase'

export function MakeupsTracker() {
  const [absenceType, setAbsenceType] = useState<'personal' | 'emergency'>('personal')
  const [makeups, setMakeups] = useState<AbsenceMakeup[]>([
    {
      id: '1',
      partnerId: 'felipe',
      partnerName: 'Felipe Barrera',
      absenceDate: 'Viernes 4:00 PM',
      type: 'personal',
      reason: 'Trámite personal el Viernes en la tarde (4h)',
      makeupSlot: 'Sábado 9:00 AM - 1:00 PM (Frontend CRM)',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      partnerId: 'brayan',
      partnerName: 'Brayan Vera',
      absenceDate: 'Miércoles 10:00 AM',
      type: 'emergency',
      reason: 'Cita médica prioritaria (2h)',
      makeupSlot: 'Sábado pasado (Diseño UI MindConnect)',
      status: 'completed',
      createdAt: new Date().toISOString()
    }
  ])

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [makeupSlot, setMakeupSlot] = useState('Sábado • 8:00 AM - 12:00 PM')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newMakeup: AbsenceMakeup = {
      id: Date.now().toString(),
      partnerId: 'guillermo',
      partnerName: 'José Guillermo Paúl Díaz',
      absenceDate: date || 'Hoy',
      type: absenceType,
      reason: reason || 'Novedad personal',
      makeupSlot: absenceType === 'personal' ? makeupSlot : undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    setMakeups([newMakeup, ...makeups])
    setReason('')
    setDate('')
    alert('Novedad y compromiso de reposición registrado exitosamente.')
  }

  const markCompleted = (id: string) => {
    setMakeups(makeups.map(m => m.id === id ? { ...m, status: 'completed' } : m))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form: Registrar Novedad */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-[#00F0FF]">📝</span> Registrar Novedad / Reprogramación
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Registrar Compromiso de Reposición
          </button>
        </form>
      </div>

      {/* List: Historical Makeups */}
      <div className="lg:col-span-2 bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-[#00F0FF]">🔄</span> Compromisos de Reposición de Tiempo Activos
        </h2>

        <div className="space-y-3">
          {makeups.map((m) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}
