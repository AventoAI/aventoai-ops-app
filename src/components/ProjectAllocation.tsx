import React from 'react'

interface PartnerAssignment {
  name: string
  role: string
  avatar: string
  projects: {
    name: string
    hours: number
    type: 'star' | 'alliance' | 'internal' | 'client'
    note?: string
  }[]
}

const PARTNER_ASSIGNMENTS: PartnerAssignment[] = [
  {
    name: "José Guillermo Paúl Díaz",
    role: "CEO & CTO Principal",
    avatar: "GP",
    projects: [
      { name: "CRM AventoAI", hours: 8, type: "star", note: "Liderazgo de producto & QA" },
      { name: "MindConnect", hours: 6, type: "alliance", note: "Dirección general, Frontend/IA Python" },
      { name: "Veva / Clientes", hours: 6, type: "client", note: "Responsable directo frente a clientes" },
    ]
  },
  {
    name: "Anderson Estiven Méndez",
    role: "CTO Auxiliar",
    avatar: "AM",
    projects: [
      { name: "MindConnect", hours: 8, type: "alliance", note: "Diseño, infraestructura & despliegues" },
      { name: "CRM AventoAI", hours: 5, type: "star", note: "Despliegues e infraestructura general" },
      { name: "Soporte General AventoAI", hours: 3, type: "internal", note: "Supervisión de servidores y DevOps" },
    ]
  },
  {
    name: "Sebastián Martínez",
    role: "Fullstack / 3D & Frontend",
    avatar: "SM",
    projects: [
      { name: "MindConnect", hours: 12, type: "alliance", note: "FULL: Mascotas 3D, UI & Animaciones App" },
      { name: "Landing Page AventoAI", hours: 4, type: "internal", note: "Implementación de mejoras visuales y UX" },
    ]
  },
  {
    name: "Felipe Barrera",
    role: "Líder de Frontend",
    avatar: "FB",
    projects: [
      { name: "CRM AventoAI", hours: 8, type: "star", note: "Desarrollo de Inbox y Maquetación" },
      { name: "MindConnect", hours: 4, type: "alliance", note: "Apoyo puntual en montaje de repositorio" },
    ]
  },
  {
    name: "Brayan David Vera Mesa",
    role: "Diseñador UI/UX & Frontend",
    avatar: "BV",
    projects: [
      { name: "Veva / Docusim", hours: 8, type: "client", note: "Diseño UX y maquetación cliente" },
      { name: "CRM AventoAI", hours: 4, type: "star", note: "Diseño de interfaz de usuario" },
      { name: "MindConnect", hours: 4, type: "alliance", note: "Diseño visual de mascotas/componentes" },
    ]
  },
  {
    name: "David Mateo Carreño",
    role: "Automatizaciones n8n & Frontend",
    avatar: "MC",
    projects: [
      { name: "CRM AventoAI", hours: 12, type: "star", note: "Integración de flujos n8n multi-tenant" },
      { name: "Veva / Clientes", hours: 4, type: "client", note: "Automatizaciones de soporte" },
    ]
  },
  {
    name: "Juan Sebastián Cárdenas",
    role: "Líder Backend",
    avatar: "JC",
    projects: [
      { name: "CRM AventoAI", hours: 14, type: "star", note: "Arquitectura backend Node/Express & MySQL" },
    ]
  }
]

export function ProjectAllocation() {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'star':
        return <span className="px-2 py-0.5 bg-[#0077FF]/20 text-[#00F0FF] text-[10px] font-semibold rounded border border-[#0077FF]/30">CRM (Producto)</span>
      case 'alliance':
        return <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold rounded border border-indigo-500/30">MindConnect (50/50)</span>
      case 'client':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded border border-emerald-500/30">Cliente (Veva)</span>
      default:
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-semibold rounded border border-amber-500/30">AventoAI Interno</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <div className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-5 shadow-2xl space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-[#00F0FF]">🎯</span> Asignación Personalizada por Socio y Proyecto
        </h2>
        <p className="text-xs text-slate-400">
          Cada integrante de AventoAI tiene un enfoque de trabajo específico. Los proyectos activos son: 
          <strong className="text-white"> CRM AventoAI</strong> (Producto Propio), 
          <strong className="text-white"> MindConnect</strong> (Alianza 50/50), 
          <strong className="text-white"> Veva/Clientes</strong> y 
          <strong className="text-amber-400"> Landing AventoAI (Mejoras Visuales)</strong>.
        </p>
      </div>

      {/* Grid of Partner Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PARTNER_ASSIGNMENTS.map((partner) => {
          const totalHours = partner.projects.reduce((acc, p) => acc + p.hours, 0)
          return (
            <div
              key={partner.name}
              className="bg-[#080E1E]/90 backdrop-blur-xl border border-[#0077FF]/25 hover:border-[#00F0FF]/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#0077FF]/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#0077FF] p-0.5 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-[#0077FF]/20">
                      {partner.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{partner.name}</h3>
                      <p className="text-[11px] text-slate-400">{partner.role}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#0F172A] border border-[#0077FF]/30 text-white font-bold text-xs rounded-lg">
                    {totalHours}h/sem
                  </span>
                </div>

                {/* Projects Breakdown list */}
                <div className="space-y-2.5">
                  {partner.projects.map((proj, idx) => (
                    <div key={idx} className="bg-[#0F172A]/80 border border-[#0077FF]/15 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{proj.name}</span>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(proj.type)}
                          <span className="font-bold text-xs text-slate-200">{proj.hours}h</span>
                        </div>
                      </div>
                      {proj.note && (
                        <p className="text-[11px] text-slate-400 italic">📌 {proj.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Progress Bar */}
              <div className="pt-2 border-t border-[#0077FF]/15 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Cumplimiento Dedicación:</span>
                  <span className="text-[#00F0FF] font-bold">100% de la cuota</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-[#0077FF] to-[#00F0FF] h-1.5 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
