import React, { useState } from 'react'
import { TEAM_PARTNERS, Partner, verifyPartnerPIN } from '../lib/supabase'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (partner: Partner) => void
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('guillermo')
  const [pin, setPin] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const partner = TEAM_PARTNERS.find(p => p.id === selectedPartnerId)
    if (!partner) {
      setError('Socio no encontrado')
      return
    }

    // Secure bcrypt PIN check
    if (pin && !verifyPartnerPIN(pin, partner)) {
      setError('PIN de seguridad incorrecto.')
      return
    }

    setError(null)
    onLogin(partner)
  }

  const selectedPartner = TEAM_PARTNERS.find(p => p.id === selectedPartnerId) || TEAM_PARTNERS[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#080E1E] border border-[#0077FF]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden feather-glow-border">
        {/* Glow ambient background elements */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00F0FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#0077FF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Branding */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 shadow-xl shadow-[#00F0FF]/20 border border-[#00F0FF]/50 flex items-center justify-center">
            <img
              src="/aventoai-logo.jpg"
              alt="AventoAI Owl Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            AVENTO<span className="text-[#00F0FF]">AI</span> OPS
          </h2>
          <p className="text-xs text-slate-400">
            Autenticación de Integrante • Acceso a Gestión & Horarios
          </p>
        </div>

        {/* Quick Partner Avatars Selector */}
        <div className="relative z-10 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Selecciona tu Perfil de Socio:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {TEAM_PARTNERS.map((p) => {
              const isSelected = p.id === selectedPartnerId
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPartnerId(p.id)
                    setError(null)
                  }}
                  className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0077FF]/25 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-105'
                      : 'bg-[#0F172A]/70 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                  title={p.name}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-gradient-to-br from-[#00F0FF] to-[#0077FF] text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {p.avatar}
                  </div>
                  <span className="text-[9px] font-medium text-slate-300 mt-1 truncate w-full text-center">
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
          <div className="bg-[#0F172A]/90 border border-[#0077FF]/25 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#0077FF] p-0.5 text-slate-950 font-extrabold text-sm flex items-center justify-center shadow-md">
                {selectedPartner.avatar}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-white truncate">{selectedPartner.name}</h3>
                <p className="text-xs text-[#00F0FF]">{selectedPartner.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                PIN Personal o Contraseña (Opcional):
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError(null)
                }}
                placeholder="Ingresa PIN (Default: 1234)"
                className="w-full bg-[#080E1E] border border-[#0077FF]/30 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0077FF] to-[#00F0FF] hover:opacity-90 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#0077FF]/30 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🔐 Iniciar Sesión como {selectedPartner.name.split(' ')[0]}</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500 tracking-wide relative z-10">
          AventoAI Internal Ops • Acceso Restringido a Socios
        </p>
      </div>
    </div>
  )
}
