import React, { useState, useEffect } from 'react'
import {
  TEAM_PARTNERS,
  Partner,
  StalledTask,
  fetchStalledTasksDB,
  createStalledTaskDB,
  deleteStalledTaskDB
} from '../lib/supabase'

interface BottlenecksListProps {
  sessionPartner?: Partner | null
}

export function BottlenecksList({ sessionPartner }: BottlenecksListProps) {
  const [tasks, setTasks] = useState<StalledTask[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Modal State for Notification
  const [selectedTask, setSelectedTask] = useState<StalledTask | null>(null)
  const [sendingEmail, setSendingEmail] = useState<boolean>(false)
  const [sentSuccess, setSentSuccess] = useState<boolean>(false)

  // Modal State for New Task
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false)
  const [taskTitle, setTaskTitle] = useState<string>('')
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(sessionPartner?.id || 'guillermo')
  const [projectName, setProjectName] = useState<string>('CRM AventoAI')
  const [hoursStalled, setHoursStalled] = useState<number>(48)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Load stalled tasks from Supabase DB on mount
  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      setIsLoading(true)
      const dbTasks = await fetchStalledTasksDB()
      if (!isMounted) return

      if (dbTasks !== null) {
        setTasks(dbTasks)
      } else {
        setTasks([])
      }
      setIsLoading(false)
    }

    loadTasks()
    return () => { isMounted = false }
  }, [])

  // Create new stalled task alert in Supabase DB
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) {
      alert('Por favor ingresa el título del entregable o tarea.')
      return
    }

    const assigned = TEAM_PARTNERS.find(p => p.id === selectedPartnerId) || TEAM_PARTNERS[0]

    setIsSubmitting(true)
    const result = await createStalledTaskDB({
      title: taskTitle.trim(),
      assignedName: assigned.name,
      assignedEmail: assigned.email,
      projectName,
      hoursStalled,
      lastUpdate: lastUpdate.trim() || 'Sin reporte reciente'
    })
    setIsSubmitting(false)

    if (result.success && result.data) {
      setTasks(prev => [result.data!, ...prev])
      setTaskTitle('')
      setLastUpdate('')
      setShowAddTaskModal(false)
      alert(`✅ ¡Alerta de tarea estancada guardada en Supabase DB!`)
    } else {
      const fallback: StalledTask = {
        id: Date.now().toString(),
        title: taskTitle.trim(),
        assignedName: assigned.name,
        assignedEmail: assigned.email,
        projectName,
        hoursStalled,
        lastUpdate: lastUpdate.trim() || 'Sin reporte reciente'
      }
      setTasks(prev => [fallback, ...prev])
      setTaskTitle('')
      setLastUpdate('')
      setShowAddTaskModal(false)
      alert(`⚠️ Registrado localmente.`)
    }
  }

  // Resolve / Delete a task alert
  const handleResolveTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await deleteStalledTaskDB(id)
  }

  // Toast notification banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Direct email alert dispatch without preview modal
  const handleSendEmailAlert = (task: StalledTask) => {
    const senderEmail = 'contactenos.aventoai@gmail.com'
    const subject = encodeURIComponent(`🚨 [ALERTA AVENTOAI] Reconfirmación de Tarea: ${task.title}`)
    const body = encodeURIComponent(
      `Hola ${task.assignedName},\n\n` +
      `🚨 ALERTA DE SEGUIMIENTO Y AVANCE (AventoAI Ops Hub)\n` +
      `----------------------------------------------------------------------\n` +
      `Se ha detectado una pausa de ${task.hoursStalled} horas sin avance reportado en la siguiente tarea de la agencia:\n\n` +
      `📌 Entregable: ${task.title}\n` +
      `📁 Proyecto: ${task.projectName}\n` +
      `💬 Último reporte: "${task.lastUpdate}"\n\n` +
      `Por favor ingresa a AventoAI Ops Hub para reconfirmar tu próximo bloque de trabajo en la Matriz de Disponibilidad o agendar tu reposición en fin de semana.\n\n` +
      `----------------------------------------------------------------------\n` +
      `Enviado desde el servicio oficial: ${senderEmail}\n` +
      `AventoAI Ops & Commitment Hub - Sistema Operativo y Horarios de Socios\n` +
      `Logo oficial: https://aventoai.com/aventoai-logo.jpg`
    )

    // Open Gmail Web Composer pre-filled
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(task.assignedEmail)}&su=${subject}&body=${body}`
    const openedWindow = window.open(gmailUrl, '_blank')

    // Fallback to mailto link if popup blocker stops new tab
    if (!openedWindow) {
      window.open(`mailto:${task.assignedEmail}?subject=${subject}&body=${body}`, '_self')
    }

    setToastMessage(`🚀 Notificación iniciada para ${task.assignedName} (${task.assignedEmail}) desde ${senderEmail}`)
    setTimeout(() => setToastMessage(null), 5000)
  }

  return (
    <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-[#0077FF]/20 border border-[#00F0FF]/50 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs animate-fade-in font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base">📧</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0077FF]/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-rose-400">🚨</span> Control de Entregables y Bloqueos (&gt;48h sin avance)
            </h2>
            {isLoading && (
              <span className="text-xs text-[#00F0FF] animate-pulse flex items-center gap-1 font-mono">
                ⚡ Leyendo...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistema directo de notificación por correo desde <strong className="text-[#00F0FF] font-mono">contactenos.aventoai@gmail.com</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl shrink-0">
            {tasks.length} Tareas en Alerta
          </span>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-3.5 py-1.5 bg-[#0077FF] hover:bg-[#0077FF]/80 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
          >
            + Nueva Alerta
          </button>
        </div>
      </div>

      {/* Task Alerts List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0F172A]/50 border border-dashed border-slate-800 text-center space-y-2">
            <span className="text-2xl">🎉</span>
            <p className="text-sm font-bold text-emerald-400">¡Excelente! Sin entregables estancados.</p>
            <p className="text-xs text-slate-400">Todos los proyectos de la agencia están al día en la matriz de horas.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-[#0F172A]/80 border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-bold text-[11px] rounded border border-rose-500/30">
                    Sin avance {task.hoursStalled}h
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm">{task.title}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Asignado a: <strong className="text-slate-200">{task.assignedName}</strong> (<span className="text-[#00F0FF] font-mono">{task.assignedEmail}</span>) • Proyecto: <span className="text-[#00F0FF] font-semibold">{task.projectName}</span>
                </p>
                <p className="text-[11px] text-slate-300 italic">
                  Último reporte: "{task.lastUpdate}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolveTask(task.id)}
                  className="px-3 py-2 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  title="Marcar como resuelto"
                >
                  ✓ Resuelto
                </button>

                <button
                  onClick={() => handleSendEmailAlert(task)}
                  className="px-4 py-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
                >
                  <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>Enviar Correo</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 2: Registrar Nueva Alerta de Tarea */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#080E1E] border border-[#0077FF]/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#0077FF]/20 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>🚨</span> Registrar Alerta de Entregable (&gt;48h)
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título de la Tarea / Entregable:</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="ej. Integración de API, Pruebas Sandbox..."
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Socio Asignado:</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none"
                >
                  {TEAM_PARTNERS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role.split(' ')[0]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proyecto:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="ej. CRM AventoAI, MindConnect..."
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Horas en Pausa / Sin Avance:</label>
                <input
                  type="number"
                  min={48}
                  value={hoursStalled}
                  onChange={(e) => setHoursStalled(parseInt(e.target.value) || 48)}
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Último Reporte o Motivo de Pausa:</label>
                <textarea
                  rows={2}
                  value={lastUpdate}
                  onChange={(e) => setLastUpdate(e.target.value)}
                  placeholder="ej. Esperando respuesta de cliente o prueba en servidor..."
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

