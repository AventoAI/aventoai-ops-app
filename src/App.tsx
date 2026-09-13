import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { FallingFeathers } from './components/FallingFeathers'
import { Navbar } from './components/Navbar'
import { AvailabilityMatrix } from './components/AvailabilityMatrix'
import { ProjectAllocation } from './components/ProjectAllocation'
import { MakeupsTracker } from './components/MakeupsTracker'
import { BottlenecksList } from './components/BottlenecksList'
import { LoginPage } from './pages/LoginPage'
import { TEAM_PARTNERS, Partner } from './lib/supabase'

function DashboardPage({
  sessionPartner,
  onLogout
}: {
  sessionPartner: Partner
  onLogout: () => void
}) {
  const navigate = useNavigate()
  
  // Default viewing partner to the currently logged in partner's ID
  const [viewingPartnerId, setViewingPartnerId] = useState<string>(sessionPartner.id)
  const [activeTab, setActiveTab] = useState<'availability' | 'projects' | 'makeups' | 'bottlenecks'>('availability')

  // Keep viewingPartnerId aligned if session changes
  useEffect(() => {
    setViewingPartnerId(sessionPartner.id)
  }, [sessionPartner.id])

  return (
    <div className="bg-[#020817] text-slate-100 min-h-screen antialiased p-3 sm:p-5 md:p-6 relative overflow-x-hidden">
      {/* Background Grid & Mesh Orbs Overlay */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-80" />
      <div className="fixed inset-0 bg-mesh-orbs pointer-events-none z-0" />

      {/* Ambient Light Orbs */}
      <div className="fixed -top-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-[#0077FF]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-[#00F0FF]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Falling Feathers Background Layer */}
      <FallingFeathers />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 relative z-10">
        <Navbar
          sessionPartner={sessionPartner}
          viewingPartnerId={viewingPartnerId}
          onViewingPartnerChange={setViewingPartnerId}
          onOpenLogin={() => navigate('/login')}
          onLogout={() => {
            onLogout()
            navigate('/login')
          }}
        />

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#0077FF]/20 pb-2 custom-scrollbar">
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'availability'
                ? 'bg-[#0077FF] text-white shadow-lg shadow-[#0077FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#0077FF]/20'
            }`}
          >
            <svg className="w-4 h-4 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Matriz & Reuniones
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#0077FF] text-white shadow-lg shadow-[#0077FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#0077FF]/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Horas por Proyecto
          </button>

          <button
            onClick={() => setActiveTab('makeups')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'makeups'
                ? 'bg-[#0077FF] text-white shadow-lg shadow-[#0077FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#0077FF]/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Novedades & Reposición
          </button>

          <button
            onClick={() => setActiveTab('bottlenecks')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bottlenecks'
                ? 'bg-[#0077FF] text-white shadow-lg shadow-[#0077FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#0077FF]/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {"Control Tareas (>48h)"}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'availability' && (
          <AvailabilityMatrix
            sessionPartner={sessionPartner}
            viewingPartnerId={viewingPartnerId}
            onOpenLogin={() => navigate('/login')}
          />
        )}
        {activeTab === 'projects' && <ProjectAllocation />}
        {activeTab === 'makeups' && <MakeupsTracker />}
        {activeTab === 'bottlenecks' && <BottlenecksList />}
      </div>
    </div>
  )
}

export function App() {
  const [sessionPartner, setSessionPartner] = useState<Partner | null>(() => {
    const savedId = localStorage.getItem('avento_session_partner_id')
    return TEAM_PARTNERS.find(p => p.id === savedId) || null
  })

  const handleLoginSuccess = (partner: Partner) => {
    setSessionPartner(partner)
  }

  const handleLogout = () => {
    setSessionPartner(null)
    localStorage.removeItem('avento_session_partner_id')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/"
          element={
            sessionPartner ? (
              <DashboardPage
                sessionPartner={sessionPartner}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
