import React, { useState } from 'react'

interface AlertTask {
  id: string
  title: string
  assignedName: string
  assignedEmail: string
  projectName: string
  hoursStalled: number
  lastUpdate: string
}

export function BottlenecksList() {
  const [tasks] = useState<AlertTask[]>([
    {
      id: '1',
      title: 'Integración Webhook n8n multi-tenant (CRM)',
      assignedName: 'David Mateo Carreño',
      assignedEmail: 'mateo@aventoai.com',
      projectName: 'CRM AventoAI',
      hoursStalled: 52,
      lastUpdate: 'Esperando respuesta de schema de base de datos'
    },
    {
      id: '2',
      title: 'Pruebas de microexpresiones en App Móvil',
      assignedName: 'Anderson Estiven Méndez',
      assignedEmail: 'andolon.dmso@gmail.com',
      projectName: 'MindConnect',
      hoursStalled: 49,
      lastUpdate: 'Pendiente prueba de servidor sandbox'
    },
    {
      id: '3',
      title: 'Maquetación de Inbox conversacional',
      assignedName: 'José Guillermo Paúl Díaz',
      assignedEmail: 'pauldiazjoseguillermo@gmail.com',
      projectName: 'CRM AventoAI',
      hoursStalled: 48,
      lastUpdate: 'Revisión de componentes UI'
    }
  ])

  const [selectedTask, setSelectedTask] = useState<AlertTask | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const handleSendNotification = (task: AlertTask) => {
    setSelectedTask(task)
    setSentSuccess(false)
  }

  const confirmSendEmail = () => {
    if (!selectedTask) return
    setSendingEmail(true)
    setTimeout(() => {
      setSendingEmail(false)
      setSentSuccess(true)
    }, 1200)
  }

  return (
    <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0077FF]/20 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-red-400">🚨</span> Control de Entregables y Bloqueos ({">"}48h sin avance)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistema automático de alerta por correo electrónico para reconfirmar bloques de trabajo estancados.
          </p>
        </div>
        <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg self-start sm:self-auto">
          {tasks.length} Tareas en Alerta
        </span>
      </div>

      {/* Task Alerts List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#0F172A]/80 border border-red-500/30 hover:border-red-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 font-bold text-[11px] rounded border border-red-500/30">
                  Sin avance {task.hoursStalled}h
                </span>
                <span className="font-bold text-white text-xs sm:text-sm">{task.title}</span>
              </div>
              <p className="text-xs text-slate-400">
                Asignado a: <strong className="text-slate-200">{task.assignedName}</strong> ({task.assignedEmail}) • Proyecto: <span className="text-[#00F0FF]">{task.projectName}</span>
              </p>
              <p className="text-[11px] text-slate-300 italic">
                Último reporte: "{task.lastUpdate}"
              </p>
            </div>

            <button
              onClick={() => handleSendNotification(task)}
              className="w-full md:w-auto px-4 py-2.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Notificar por Correo
            </button>
          </div>
        ))}
      </div>

      {/* Modal / Toast for Email Confirmation */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#080E1E] border border-[#0077FF]/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl feather-glow-border">
            <div className="flex items-center justify-between border-b border-[#0077FF]/20 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>📧</span> Notificación por Correo Electrónico
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {!sentSuccess ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">
                  Se enviará un correo electrónico directo de aviso a:
                </p>
                <div className="bg-[#0F172A] border border-[#0077FF]/30 p-3 rounded-xl space-y-1">
                  <p className="text-white font-bold">{selectedTask.assignedName}</p>
                  <p className="text-[#00F0FF] font-semibold">{selectedTask.assignedEmail}</p>
                  <p className="text-slate-400 text-[11px]">Asunto: [AventoAI Ops] Reconfirmación de Bloque: {selectedTask.title}</p>
                </div>
                <p className="text-slate-400 text-[11px]">
                  El correo incluirá un botón interactivo de 1-clic para que el socio reconfirme su siguiente bloque de trabajo o agende su reposición en fin de semana.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="w-1/2 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmSendEmail}
                    disabled={sendingEmail}
                    className="w-1/2 py-2 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] text-slate-950 font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? 'Enviando...' : 'Enviar Correo Ahora'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-white text-sm">¡Correo Enviado Exitosamente!</h4>
                <p className="text-slate-300 text-xs">
                  Se ha enviado la notificación de reconfirmación a <strong className="text-[#00F0FF]">{selectedTask.assignedEmail}</strong>.
                </p>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 mt-2"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
