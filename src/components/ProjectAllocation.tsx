import React, { useState, useEffect } from 'react'
import {
  TEAM_PARTNERS,
  Partner,
  ProjectItem,
  PartnerProjectAllocation,
  fetchProjectsListDB,
  createProjectDB,
  fetchProjectAllocationsDB,
  saveProjectAllocationDB,
  deleteProjectAllocationDB,
  fetchPartnerMatrixHoursMapDB
} from '../lib/supabase'

interface ProjectAllocationProps {
  sessionPartner?: Partner | null
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  { id: '1', name: 'CRM AventoAI', category: 'star', description: 'Producto Propio (CRM & Inbox Multi-tenant)' },
  { id: '2', name: 'MindConnect', category: 'alliance', description: 'Alianza Estratégica (50/50)' },
  { id: '3', name: 'Veva / Clientes', category: 'client', description: 'Desarrollo & Soporte para Clientes Externos' },
  { id: '4', name: 'Landing Page AventoAI', category: 'internal', description: 'Mejoras Visuales y UX Internas' }
]

export function ProjectAllocation({ sessionPartner }: ProjectAllocationProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS)
  const [allocations, setAllocations] = useState<PartnerProjectAllocation[]>([])
  const [matrixHoursMap, setMatrixHoursMap] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Modals & Forms State
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false)
  const [newProjectName, setNewProjectName] = useState<string>('')
  const [newProjectCategory, setNewProjectCategory] = useState<'star' | 'alliance' | 'internal' | 'client'>('star')
  const [newProjectDesc, setNewProjectDesc] = useState<string>('')

  const [showAddAllocationModal, setShowAddAllocationModal] = useState<boolean>(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(sessionPartner?.id || 'guillermo')
  const [selectedProjectName, setSelectedProjectName] = useState<string>('')
  const [allocHours, setAllocHours] = useState<number>(4)
  const [allocNote, setAllocNote] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const isCEO = sessionPartner?.id === 'guillermo'

  // Fetch real Projects, Allocations & Matrix Hours from Supabase DB on mount
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      const [dbProjects, dbAllocations, dbMatrixMap] = await Promise.all([
        fetchProjectsListDB(),
        fetchProjectAllocationsDB(),
        fetchPartnerMatrixHoursMapDB()
      ])

      if (!isMounted) return

      // Merge default agency projects with any new projects from Supabase DB
      const mergedProjects = [...DEFAULT_PROJECTS]
      if (dbProjects && dbProjects.length > 0) {
        dbProjects.forEach(dbP => {
          if (!mergedProjects.some(p => p.name.toLowerCase() === dbP.name.toLowerCase())) {
            mergedProjects.push(dbP)
          }
        })
      }
      setProjects(mergedProjects)

      if (dbAllocations !== null) {
        setAllocations(dbAllocations)
      }

      if (dbMatrixMap) {
        setMatrixHoursMap(dbMatrixMap)
      }

      setIsLoading(false)
    }

    loadData()
    return () => { isMounted = false }
  }, [])

  // Create a new project in Supabase DB
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCEO) {
      alert('🔒 Solo el CEO (Guillermo) puede crear nuevos proyectos en la agencia.')
      return
    }

    if (!newProjectName.trim()) {
      alert('Por favor ingresa el nombre del proyecto.')
      return
    }

    const createdName = newProjectName.trim()
    setIsSubmitting(true)
    const result = await createProjectDB({
      name: createdName,
      category: newProjectCategory,
      description: newProjectDesc.trim() || undefined
    })
    setIsSubmitting(false)

    const newProjItem: ProjectItem = result.success && result.data ? result.data : {
      id: Date.now().toString(),
      name: createdName,
      category: newProjectCategory,
      description: newProjectDesc.trim()
    }

    setProjects(prev => {
      if (prev.some(p => p.name.toLowerCase() === createdName.toLowerCase())) return prev
      return [...prev, newProjItem]
    })
    setSelectedProjectName(createdName)
    setNewProjectName('')
    setNewProjectDesc('')
    setShowCreateProjectModal(false)
    alert(`✅ ¡Proyecto "${createdName}" disponible! Ahora puedes asignarle horas a los socios.`)
  }

  // Assign hours of a project to a partner
  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectName) {
      alert('Por favor selecciona un proyecto.')
      return
    }

    // Force non-CEO users to assign to themselves only
    const targetPartnerId = isCEO ? selectedPartnerId : (sessionPartner?.id || selectedPartnerId)
    const targetPartner = TEAM_PARTNERS.find(p => p.id === targetPartnerId)
    const projCategory = projects.find(p => p.name === selectedProjectName)?.category || 'internal'

    const newAllocData = {
      partnerId: targetPartnerId,
      projectName: selectedProjectName,
      category: projCategory,
      hours: Number(allocHours),
      note: allocNote.trim() || undefined
    }

    setIsSubmitting(true)
    const result = await saveProjectAllocationDB(newAllocData)
    setIsSubmitting(false)

    const savedItem: PartnerProjectAllocation = result.success && result.data ? result.data : {
      id: Date.now().toString(),
      ...newAllocData
    }

    setAllocations(prev => {
      // Replace existing allocation for same partner and project, or add new
      const filtered = prev.filter(a => !(a.partnerId === targetPartnerId && a.projectName === selectedProjectName))
      return [...filtered, savedItem]
    })

    setAllocNote('')
    setShowAddAllocationModal(false)
    alert(`✅ ${Number(allocHours)}h asignadas a ${targetPartner?.name} en "${selectedProjectName}".`)
  }

  // Remove allocation
  const handleDeleteAllocation = async (id: string) => {
    setAllocations(prev => prev.filter(a => a.id !== id))
    await deleteProjectAllocationDB(id)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'star':
        return <span className="px-2 py-0.5 bg-[#0077FF]/20 text-[#00F0FF] text-[10px] font-semibold rounded border border-[#0077FF]/30">CRM (Producto)</span>
      case 'alliance':
        return <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold rounded border border-indigo-500/30">MindConnect</span>
      case 'client':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded border border-emerald-500/30">Cliente</span>
      default:
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-semibold rounded border border-amber-500/30">Interno</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Overview & Project Action Header */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">🎯</span> Distribución de Horas por Proyecto
            </h2>
            {isLoading && (
              <span className="text-xs text-[#00F0FF] animate-pulse flex items-center gap-1 font-mono">
                ⚡ Cargando de Supabase...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Asigna y equilibra las horas semanales de cada socio con los proyectos activos de AventoAI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {isCEO && (
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#0F172A] hover:bg-[#0077FF]/20 border border-[#0077FF]/40 text-[#00F0FF] font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>✨ + Crear Proyecto</span>
            </button>
          )}

          <button
            onClick={() => {
              if (sessionPartner) setSelectedPartnerId(sessionPartner.id)
              if (projects.length > 0) setSelectedProjectName(projects[0].name)
              setShowAddAllocationModal(true)
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl shadow-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="hidden sm:inline">📌 Asignar Horas</span>
            <span className="inline sm:hidden">📌 Asignar Horas</span>
          </button>
        </div>
      </div>

      {/* Active Projects Summary Catalog */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0077FF]/15 pb-2.5">
          <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
            <span className="text-[#00F0FF]">📁</span> Catálogo de Proyectos ({projects.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Total horas asignadas en agencia: <strong className="text-[#00F0FF] font-bold">{allocations.reduce((a, b) => a + b.hours, 0)}h/sem</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {projects.map(p => {
            const totalProjHours = allocations.filter(a => a.projectName === p.name).reduce((acc, a) => acc + a.hours, 0)
            return (
              <div key={p.id} className="px-3 py-1.5 bg-[#0F172A] border border-[#0077FF]/25 hover:border-[#0077FF]/40 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all">
                <span className="font-semibold text-slate-200">{p.name}</span>
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#0077FF]/20 text-[#00F0FF] border border-[#0077FF]/30">
                  {totalProjHours}h
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Grid of Partner Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEAM_PARTNERS.map((partner) => {
          const partnerAllocations = allocations.filter(a => a.partnerId === partner.id)
          const projHours = partnerAllocations.reduce((acc, a) => acc + a.hours, 0)
          const matrixHours = matrixHoursMap[partner.id] || 0
          const isCurrentSession = sessionPartner && sessionPartner.id === partner.id

          const isOverAllocated = matrixHours > 0 && projHours > matrixHours
          const isUnderAllocated = matrixHours > 0 && projHours < matrixHours
          const isExactMatch = matrixHours > 0 && projHours === matrixHours

          return (
            <div
              key={partner.id}
              className={`bg-[#080E1E]/90 backdrop-blur-xl border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 ${
                isOverAllocated
                  ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : isCurrentSession
                  ? 'border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.15)] bg-[#0B152C]/90'
                  : 'border-[#0077FF]/25 hover:border-[#0077FF]/45'
              }`}
            >
              <div className="space-y-3.5">
                {/* Spacious Header with Partner Info + Metrics Pill Row */}
                <div className="border-b border-[#0077FF]/20 pb-3 space-y-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#0077FF] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-[#0077FF]/20">
                      {partner.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-sm leading-tight truncate flex items-center gap-1.5">
                        <span className="truncate">{partner.name}</span>
                        {isCurrentSession && (
                          <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/15 px-1.5 py-0.5 rounded font-mono shrink-0">Tú</span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">{partner.role}</p>
                    </div>
                  </div>

                  {/* Dedicated Metrics Row - Never Wraps Awkwardly */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="px-2.5 py-1 bg-[#0F172A] border border-[#0077FF]/30 text-[#00F0FF] font-extrabold text-xs rounded-lg whitespace-nowrap shadow-sm">
                      📌 {projHours}h asignadas
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      🗓️ Matriz: <strong className="text-slate-200">{matrixHours > 0 ? `${matrixHours}h/sem` : 'Sin definir'}</strong>
                    </span>
                  </div>
                </div>

                {/* Projects Breakdown List */}
                <div className="space-y-2.5">
                  {partnerAllocations.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#0F172A]/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      Sin proyectos asignados aún.
                    </div>
                  ) : (
                    partnerAllocations.map((alloc) => (
                      <div key={alloc.id} className="bg-[#0F172A]/80 border border-[#0077FF]/15 hover:border-[#0077FF]/35 rounded-xl p-3 space-y-1.5 transition-all group">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white truncate max-w-[140px]">{alloc.projectName}</span>
                          <div className="flex items-center gap-1.5">
                            {getTypeBadge(alloc.category)}
                            <span className="font-bold text-xs text-slate-200">{alloc.hours}h</span>
                            {(isCurrentSession || (sessionPartner && sessionPartner.id === 'guillermo')) && (
                              <button
                                onClick={() => handleDeleteAllocation(alloc.id)}
                                className="text-xs text-slate-500 hover:text-rose-400 transition-colors ml-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Eliminar asignación"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        {alloc.note && (
                          <p className="text-[11px] text-slate-400 italic">📌 {alloc.note}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Clean Footer Progress Bar & Capacity Alert */}
              <div className="pt-2 border-t border-[#0077FF]/15 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  {matrixHours === 0 ? (
                    <>
                      <span className="text-slate-400">Total Proyectos:</span>
                      <span className="text-[#00F0FF] font-bold">{projHours}h asignadas</span>
                    </>
                  ) : isOverAllocated ? (
                    <>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        ⚠️ Sobrecarga (+{projHours - matrixHours}h vs Matriz)
                      </span>
                      <span className="text-amber-300 font-extrabold">{projHours}h / {matrixHours}h</span>
                    </>
                  ) : isUnderAllocated ? (
                    <>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        💡 Capacidad libre: {matrixHours - projHours}h por asignar
                      </span>
                      <span className="text-[#00F0FF] font-extrabold">{projHours}h / {matrixHours}h</span>
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Balance perfecto con Matriz
                      </span>
                      <span className="text-emerald-300 font-extrabold">{projHours}h / {matrixHours}h</span>
                    </>
                  )}
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isOverAllocated
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
                        : isExactMatch
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-[#0077FF] to-[#00F0FF]'
                    }`}
                    style={{
                      width: `${
                        matrixHours > 0
                          ? Math.min((projHours / matrixHours) * 100, 100)
                          : Math.min((projHours / 20) * 100, 100)
                      }%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL 1: Crear Nuevo Proyecto */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#080E1E] border border-[#0077FF]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#0077FF]/20 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>✨</span> Crear Nuevo Proyecto de Agencia
              </h3>
              <button
                onClick={() => setShowCreateProjectModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Proyecto:</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="ej. MindConnect 2.0, CRM Inbox, etc."
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Categoría / Tipo:</label>
                <select
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none"
                >
                  <option value="star">CRM (Producto Propio)</option>
                  <option value="alliance">Alianza (50/50)</option>
                  <option value="client">Cliente Externo</option>
                  <option value="internal">AventoAI Interno</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción / Enfoque:</label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Breve descripción del alcance del proyecto..."
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Asignar Horas de Proyecto a Socio */}
      {showAddAllocationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#080E1E] border border-[#0077FF]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#0077FF]/20 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>📌</span> Asignar Horas a Socio
              </h3>
              <button
                onClick={() => setShowAddAllocationModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAllocation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Socio Asignado:</span>
                  {!isCEO && (
                    <span className="text-[10px] text-[#00F0FF] font-mono font-normal">
                      (Auto-asignación)
                    </span>
                  )}
                </label>
                <select
                  value={selectedPartnerId}
                  disabled={!isCEO}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {TEAM_PARTNERS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role.split(' ')[0]})</option>
                  ))}
                </select>
                {!isCEO && (
                  <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
                    💡 Como socio, asignas horas a tu propio perfil. Las asignaciones de horas a otros miembros las gestiona el CEO.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proyecto:</label>
                <select
                  value={selectedProjectName}
                  onChange={(e) => setSelectedProjectName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Horas Semanales Dedicadas:</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={allocHours}
                  onChange={(e) => setAllocHours(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nota de Enfoque / Responsabilidad:</label>
                <input
                  type="text"
                  value={allocNote}
                  onChange={(e) => setAllocNote(e.target.value)}
                  placeholder="ej. Liderazgo backend, QA, Despliegues n8n..."
                  className="w-full bg-[#0F172A] border border-[#0077FF]/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAllocationModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

