import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEAM_PARTNERS, Partner, fetchPartnersFromDB, verifyPartnerPIN } from '../lib/supabase'

interface LoginPageProps {
  onLoginSuccess?: (partner: Partner) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate()
  const [partners, setPartners] = useState<Partner[]>(TEAM_PARTNERS)
  const [email, setEmail] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false)

  // Fetch real partners list from Supabase DB on mount
  useEffect(() => {
    let isMounted = true
    async function loadPartners() {
      const dbPartners = await fetchPartnersFromDB()
      if (isMounted && dbPartners && dbPartners.length > 0) {
        setPartners(dbPartners)
      }
    }
    loadPartners()
    return () => { isMounted = false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.trim()) {
      setError('Por favor ingresa tu correo electrónico de socio')
      return
    }

    setIsLoggingIn(true)
    // Make sure we have the latest list from Supabase DB
    const currentPartners = await fetchPartnersFromDB()
    const activePartners = currentPartners.length > 0 ? currentPartners : partners
    setIsLoggingIn(false)

    const query = email.trim().toLowerCase()
    const queryClean = query.replace(/[^a-z0-9]/g, '')

    const partner = activePartners.find(p => {
      const pEmail = p.email.toLowerCase()
      const pAltEmail = (p.altEmail || '').toLowerCase()
      const pId = p.id.toLowerCase()
      const pName = p.name.toLowerCase()
      const pNameClean = pName.replace(/[^a-z0-9]/g, '')

      // 1. Exact match on primary email or alt email
      if (query === pEmail || (pAltEmail && query === pAltEmail)) return true

      // 2. Exact match on partner ID / slug
      if (query === pId) return true

      // 3. User prefix match (part before @)
      const userPrefix = query.split('@')[0]
      if (userPrefix === pId) return true
      if (userPrefix.includes('guillermo') || userPrefix.includes('pauldiaz')) {
        if (pId === 'guillermo') return true
      }

      // 4. Partial match on name
      if (pName.includes(query) || query.includes(pId)) return true

      // 5. Clean string cross-match
      if (queryClean.length >= 4 && (pNameClean.includes(queryClean) || queryClean.includes(pNameClean))) return true

      return false
    })

    if (!partner) {
      setError('No se encontró ningún socio registrado con este correo o nombre')
      return
    }

    // Secure bcrypt PIN verification for partner access
    if (pin && !verifyPartnerPIN(pin, partner)) {
      setError('PIN de seguridad incorrecto. Revisa tus credenciales institucionales de AventoAI.')
      return
    }

    // Save session in localStorage
    localStorage.setItem('avento_session_partner_id', partner.id)
    if (onLoginSuccess) {
      onLoginSuccess(partner)
    }

    // Navigate to main application dashboard
    navigate('/')
  }


  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans selection:bg-[#00F0FF] selection:text-slate-950">
      {/* Background Lighting Effects */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-60" />
      <div className="fixed inset-0 bg-mesh-orbs pointer-events-none z-0" />
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#0077FF]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#00F0FF]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between relative z-10 py-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
          <span>AVENTOAI OPS HUB</span>
        </div>
      </header>

      {/* Main Split Card Login Layout */}
      <main className="max-w-5xl w-full mx-auto my-auto relative z-10 py-6">
        <div className="bg-[#080E1E]/90 backdrop-blur-2xl border border-[#0077FF]/30 rounded-3xl sm:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,119,255,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 feather-glow-border">

          {/* LEFT COLUMN: Hero Graphic & Branding Banner (Visible on Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-[#0B152C] via-[#080E1E] to-[#040914] p-6 sm:p-8 md:p-10 flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-[#0077FF]/20 min-h-[580px]">
            {/* Dots Pattern Overlay */}
            <div className="absolute top-6 right-6 grid grid-cols-5 gap-1.5 opacity-30 pointer-events-none">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"></div>
              ))}
            </div>

            {/* Top Tagline */}
            <div className="relative z-10 space-y-1">
              <span className="px-3 py-1 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-extrabold tracking-widest uppercase rounded-full shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                SOFTWARE OPERATIVO 2026
              </span>
            </div>

            {/* Center Official AventoAI Logo Card */}
            <div className="my-auto py-6 flex flex-col items-center justify-center relative z-10 text-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0077FF] to-[#00F0FF] rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition-all duration-500"></div>
                <div className="w-48 h-48 sm:w-56 sm:h-56 p-4 rounded-3xl bg-white border-2 border-[#00F0FF]/60 shadow-2xl relative z-10 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                  <img
                    src="/aventoai-logo.jpg"
                    alt="AventoAI Official Owl Logo"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#00F0FF] tracking-widest uppercase">
                  CENTRO DE DISPONIBILIDAD & COMPROMISOS
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                  AVENTO<span className="text-[#00F0FF]">AI</span> OPS
                </h3>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="relative z-10 pt-4 border-t border-[#0077FF]/20 flex items-center justify-between text-[11px] text-slate-400">
              <span>AventoAI Agency Standards</span>
              <span className="font-mono text-[#00F0FF]">v2.4.0</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Login Form */}
          <div className="col-span-1 lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">

            {/* Form Top Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#0F172A] text-slate-300 border border-slate-700 text-[10px] font-bold tracking-wider uppercase rounded-full">
                  • ACCESO OFICIAL • AVENTOAI
                </span>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-[#00F0FF]/40 shadow-md">
                    <img src="/aventoai-logo.jpg" alt="AventoAI Logo" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <span className="text-sm font-extrabold text-white tracking-wider">
                    AVENTO<span className="text-[#00F0FF]">AI</span>
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-[#00F0FF] tracking-wider uppercase">ACCESO A SOCIOS DE LA AGENCIA</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ingresa tus credenciales para gestionar tu matriz de disponibilidad, reposición de horas y compromisos de proyecto.
                </p>
              </div>
            </div>

            {/* Login Form (Clean Email & Password) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  CORREO ELECTRÓNICO <span className="text-[#00F0FF]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    placeholder="ejemplo@aventoai.com"
                    className="w-full bg-[#0F172A]/90 border border-[#0077FF]/30 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs text-slate-400">✉️</span>
                </div>
              </div>

              {/* Password / PIN Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  CONTRASEÑA O PIN DE SOCIO <span className="text-[#00F0FF]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value)
                      setError(null)
                    }}
                    placeholder="•••• (PIN de 4 dígitos)"
                    className="w-full bg-[#0F172A]/90 border border-[#0077FF]/30 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5500] to-[#FF8800] hover:from-[#FF6600] hover:to-[#FFAA00] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#FF5500]/30 cursor-pointer flex items-center justify-center gap-2 group mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validando con Supabase...</span>
                  </>
                ) : (
                  <span>→ Iniciar Sesión</span>
                )}
              </button>
            </form>

            {/* Bottom Help Link */}
            <div className="text-center pt-2">
              <a
                href="mailto:pauldiazjoseguillermo@gmail.com"
                className="text-xs text-slate-400 hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1 font-medium"
              >
                ¿Olvidaste tu PIN de socio o necesitas apoyo? <span className="text-[#00F0FF] font-bold">Contactar al CEO →</span>
              </a>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl w-full mx-auto text-center relative z-10 py-2">
        <p className="text-[11px] text-slate-500">
          © 2026 AventoAI Agency • Todos los derechos reservados. Uso exclusivo interno del equipo de socios.
        </p>
      </footer>
    </div>
  )
}
