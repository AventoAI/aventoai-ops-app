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
    <header className="relative z-30 bg-[#080E1E]/80 backdrop-blur-xl border border-[#0077FF]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 feather-glow-border">
      {/* Top Header Row: Brand Logo + Logged-in Partner Profile Button */}
      <div className="flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white p-1 shadow-lg shadow-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/aventoai-logo.jpg"
              alt="AventoAI Owl Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-wider text-white">
                AVENTO<span className="text-[#00F0FF] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] sm:text-xs font-semibold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                OPS HUB
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 tracking-wide hidden sm:block">
              INTELIGENCIA QUE IMPULSA RESULTADOS • SISTEMA OPERATIVO Y DE HORARIOS DE SOCIOS
            </p>
          </div>
        </div>

        {/* Logged in User Profile Dropdown in Top Right */}
        {sessionPartner ? (
          <div className="relative z-40" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 bg-[#0F172A] border transition-all px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl backdrop-blur-md shadow-md cursor-pointer group ${
                isMenuOpen
                  ? 'border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)] bg-[#0B152C]'
                  : 'border-[#0077FF]/40 hover:border-[#00F0FF]/50'
              }`}
            >
              {/* Avatar Circle */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#0077FF] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {sessionPartner.avatar}
              </div>

              {/* Partner Name & Role */}
              <div className="hidden sm:flex flex-col text-left whitespace-nowrap">
                <span className="text-xs font-extrabold text-[#00F0FF] leading-tight">
                  {sessionPartner.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-bold text-white tracking-wider uppercase leading-tight">
                  {sessionPartner.role.split(' ')[0]}
                </span>
              </div>

              {/* Chevron Arrow */}
              <svg
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ml-0.5 ${
                  isMenuOpen ? 'rotate-180 text-[#00F0FF]' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Compact Dropdown Popup */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-[#080E1E] border border-[#0077FF]/40 rounded-2xl p-3 shadow-2xl z-50 backdrop-blur-2xl space-y-2.5 animate-fade-in">
                <div className="px-1 py-1 border-b border-[#0077FF]/15 pb-2.5">
                  <p className="text-xs font-extrabold text-white">{sessionPartner.name}</p>
                  <p className="text-[10px] text-slate-400">{sessionPartner.role}</p>
                  <p className="text-[10px] text-[#00F0FF] font-mono mt-0.5 truncate">{sessionPartner.email}</p>
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
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>🔐 Iniciar Sesión</span>
          </button>
        )}
      </div>

      {/* Controls Bar: Single Clean "Ver Horario de" Bar */}
      <div className="pt-2 border-t border-[#0077FF]/15">
        <div className="w-full flex items-center gap-2.5 bg-[#0F172A] border border-[#0077FF]/35 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-md">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0">
            <span className="text-[#00F0FF]">👁️</span> Ver Horario de:
          </span>
          <select
            value={viewingPartnerId}
            onChange={(e) => onViewingPartnerChange(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#00F0FF] focus:outline-none cursor-pointer border-none py-0.5 truncate"
          >
            {TEAM_PARTNERS.map(p => (
              <option key={p.id} value={p.id} className="bg-[#080E1E] text-white py-1">
                {p.name} ({p.role.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}


