import React from 'react'

interface NavbarProps {
  currentPartner: string
  onPartnerChange: (partnerId: string) => void
}

export function Navbar({ currentPartner, onPartnerChange }: NavbarProps) {
  return (
    <header className="bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 feather-glow-border">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Official AventoAI Owl Brand Logo */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-1 shadow-lg shadow-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src="/aventoai-logo.jpg"
            alt="AventoAI Owl Logo"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white">
              AVENTO<span className="text-[#00F0FF] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">AI</span>
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              OPS & COMMITMENT HUB
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 tracking-wide">
            INTELIGENCIA QUE IMPULSA RESULTADOS • SISTEMA OPERATIVO Y DE HORARIOS DE SOCIOS
          </p>
        </div>
      </div>

      {/* Partner Selector */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 bg-[#0F172A]/90 border border-[#0077FF]/30 px-3.5 py-2 rounded-xl backdrop-blur-md">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Socio Activo:</span>
        <select
          value={currentPartner}
          onChange={(e) => onPartnerChange(e.target.value)}
          className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="guillermo" className="bg-[#080E1E]">José Guillermo Paúl Díaz (CEO)</option>
          <option value="anderson" className="bg-[#080E1E]">Anderson Méndez (CTO Auxiliar)</option>
          <option value="felipe" className="bg-[#080E1E]">Felipe Barrera (Líder Frontend)</option>
          <option value="brayan" className="bg-[#080E1E]">Brayan Vera (Diseñador UI/UX)</option>
          <option value="mateo" className="bg-[#080E1E]">Mateo Carreño (n8n / Frontend)</option>
          <option value="juan" className="bg-[#080E1E]">Juan Cárdenas (Backend)</option>
          <option value="sebastian" className="bg-[#080E1E]">Sebastián Martínez (Fullstack/3D)</option>
        </select>
      </div>
    </header>
  )
}
