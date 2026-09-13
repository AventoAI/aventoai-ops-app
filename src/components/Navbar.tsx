import React, { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { TEAM_PARTNERS, Partner } from '../lib/supabase'

interface NavbarProps {
  sessionPartner: Partner | null
  viewingPartnerId: string
  onViewingPartnerChange: (partnerId: string) => void
  onOpenLogin: () => void
  onLogout: () => void
}

export function Navbar({
  sessionPartner,
  viewingPartnerId,
  onViewingPartnerChange,
  onOpenLogin,
  onLogout
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="relative z-30 bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 feather-glow-border">
      {/* Brand Header */}
      <div className="flex items-center gap-3 sm:gap-4">
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

      {/* Auth & View Controls */}
      <div className="w-full lg:w-auto flex flex-wrap lg:flex-nowrap items-center justify-start lg:justify-end gap-3">
        {/* View Schedule Selector */}
        <div className="flex items-center gap-2 bg-[#0F172A] border border-[#0077FF]/35 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-md">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1.5">
            <span className="text-[#00F0FF]">👁️</span> Ver Horario de:
          </span>
          <select
            value={viewingPartnerId}
            onChange={(e) => onViewingPartnerChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-[#00F0FF] focus:outline-none cursor-pointer border-none py-0.5 max-w-[220px] sm:max-w-none truncate"
          >
            {TEAM_PARTNERS.map(p => (
              <option key={p.id} value={p.id} className="bg-[#080E1E] text-white py-1">
                {p.name} ({p.role.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Logged in User Profile Dropdown */}
        {sessionPartner ? (
          <div className="relative z-40" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 bg-[#0F172A] border transition-all px-3.5 py-2 rounded-xl backdrop-blur-md shadow-md cursor-pointer group ${
                isMenuOpen
                  ? 'border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)] bg-[#0B152C]'
                  : 'border-[#0077FF]/40 hover:border-[#00F0FF]/50'
              }`}
            >
              {/* Avatar Circle */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#0077FF] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {sessionPartner.avatar}
              </div>

              {/* Partner Info */}
              <div className="flex flex-col text-left whitespace-nowrap">
                <span className="text-xs font-extrabold text-[#00F0FF] leading-tight">
                  {sessionPartner.name}
                </span>
                <span className="text-[10px] font-bold text-white tracking-wider uppercase leading-tight">
                  {sessionPartner.role}
                </span>
              </div>

              {/* Chevron Arrow */}
              <svg
                className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ml-1 ${
                  isMenuOpen ? 'rotate-180 text-[#00F0FF]' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Compact Dropdown Popup (No Redundant Duplication) */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#080E1E] border border-[#0077FF]/40 rounded-2xl p-2.5 shadow-2xl z-50 backdrop-blur-2xl space-y-2 animate-fade-in">
                <div className="px-2 py-1 text-[11px] text-slate-400 font-medium truncate flex items-center gap-1.5 border-b border-[#0077FF]/15 pb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">{sessionPartner.email}</span>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-100 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Cerrar Sesión</span>
                  </span>
                  <span className="text-[10px] text-rose-400/80 font-semibold">Salir</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>🔐 Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  )
}


