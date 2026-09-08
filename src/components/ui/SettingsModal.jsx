// src/components/ui/SettingsModal.jsx
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAppStore } from '../../store/useAppStore'
import { getGitHubConfig, saveGitHubConfig, readFromGitHub, writeToGitHub } from '../../services/githubService'

export default function SettingsModal() {
  const { project, updateProfile, toggleSettings } = useAppStore()
  const [activeTab, setActiveTab] = useState('empresa')

  // Profile Form state
  const [profileData, setProfileData] = useState({ ...project.profile })

  // GitHub Config state
  const [ghConfig, setGhConfig] = useState(getGitHubConfig())
  const [isTestingGh, setIsTestingGh] = useState(false)

  // Gemini API Key state
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('apexos_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '')

  const handleSaveProfile = (e) => {
    e.preventDefault()
    updateProfile({
      ...profileData,
      initialCapital: parseFloat(profileData.initialCapital) || 52000,
      projectionHorizonMonths: parseInt(profileData.projectionHorizonMonths) || 6,
    })
    toast.success('Perfil de la empresa actualizado')
    toggleSettings()
  }

  const handleSaveGitHub = async (e) => {
    e.preventDefault()
    saveGitHubConfig(ghConfig)
    setIsTestingGh(true)
    try {
      // Probar lectura
      const res = await readFromGitHub()
      toast.success('¡Conexión con GitHub exitosa! BBDD vinculada.')
    } catch (err) {
      toast.error('No se pudo verificar el repo. Revisa token y permisos.')
    } finally {
      setIsTestingGh(false)
    }
  }

  const handleSaveGemini = (e) => {
    e.preventDefault()
    localStorage.setItem('apexos_gemini_key', geminiKey)
    toast.success('API Key de SOFIA guardada correctamente')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-base text-w11-text">Configuración del Sistema (Apex OS)</h3>
          </div>
          <button
            onClick={toggleSettings}
            className="text-white/40 hover:text-white p-1 rounded-lg transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-white/10 px-6 gap-4 text-xs bg-[#181818]">
          {[
            { id: 'empresa', label: '🏢 Empresa' },
            { id: 'finanzas', label: '💰 Capital & Finanzas' },
            { id: 'github', label: '🐙 GitHub BBDD' },
            { id: 'sofia', label: '✨ IA SOFIA' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 font-semibold border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-w11-accent text-w11-accent'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* TAB 1: Empresa */}
          {activeTab === 'empresa' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-white/60 block mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={profileData.name}
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Lema / Propuesta de Valor</label>
                <input
                  type="text"
                  className="w11-input w-full"
                  value={profileData.tagline}
                  onChange={e => setProfileData({ ...profileData, tagline: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Ciudad &amp; País</label>
                  <input
                    type="text"
                    className="w11-input w-full"
                    value={profileData.city}
                    onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Sector / Industria</label>
                  <input
                    type="text"
                    className="w11-input w-full"
                    value={profileData.industry}
                    onChange={e => setProfileData({ ...profileData, industry: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={toggleSettings} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-accent">Guardar Cambios</button>
              </div>
            </form>
          )}

          {/* TAB 2: Capital & Finanzas */}
          {activeTab === 'finanzas' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Capital Semilla Inicial ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="w11-input w-full font-mono text-emerald-400 font-bold"
                    value={profileData.initialCapital}
                    onChange={e => setProfileData({ ...profileData, initialCapital: e.target.value })}
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">Auditado VELOX: $35,000 / Proyectado: $52,000</span>
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Símbolo de Moneda</label>
                  <input
                    type="text"
                    className="w11-input w-full font-mono"
                    value={profileData.currency}
                    onChange={e => setProfileData({ ...profileData, currency: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Mes de Inicio</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="w11-input w-full font-mono"
                    value={profileData.startMonth}
                    onChange={e => setProfileData({ ...profileData, startMonth: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Año de Inicio</label>
                  <input
                    type="number"
                    className="w11-input w-full font-mono"
                    value={profileData.startYear}
                    onChange={e => setProfileData({ ...profileData, startYear: parseInt(e.target.value) || 2026 })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={toggleSettings} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-accent">Guardar Cambios</button>
              </div>
            </form>
          )}

          {/* TAB 3: GitHub como BBDD */}
          {activeTab === 'github' && (
            <form onSubmit={handleSaveGitHub} className="space-y-4">
              <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-500/20 text-blue-300 space-y-1">
                <p className="font-semibold">🐙 Respaldo Automático en GitHub (Cero Pérdidas)</p>
                <p className="text-[11px] text-white/60">
                  Tus datos se guardan directamente en <code className="text-blue-300 font-mono">data/business_data.json</code> en tu repositorio. Cada cambio crea un commit seguro.
                </p>
              </div>

              <div>
                <label className="text-white/60 block mb-1">GitHub Personal Access Token (PAT)</label>
                <input
                  type="password"
                  className="w11-input w-full font-mono"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={ghConfig.token}
                  onChange={e => setGhConfig({ ...ghConfig, token: e.target.value })}
                />
                <span className="text-[10px] text-white/40 mt-1 block">Genera uno en: github.com/settings/tokens con permiso 'repo'</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Usuario / Organización</label>
                  <input
                    type="text"
                    className="w11-input w-full font-mono"
                    placeholder="yonaikermarcano"
                    value={ghConfig.owner}
                    onChange={e => setGhConfig({ ...ghConfig, owner: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Nombre del Repositorio</label>
                  <input
                    type="text"
                    className="w11-input w-full font-mono"
                    placeholder="apex-business-os"
                    value={ghConfig.repo}
                    onChange={e => setGhConfig({ ...ghConfig, repo: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="submit" disabled={isTestingGh} className="btn-accent flex items-center gap-1.5">
                  {isTestingGh ? 'Probando conexión...' : 'Probar & Vincular BBDD'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: IA SOFIA (Gemini) */}
          {activeTab === 'sofia' && (
            <form onSubmit={handleSaveGemini} className="space-y-4">
              <div className="bg-gradient-to-r from-purple-950/30 to-blue-950/30 p-3 rounded-xl border border-purple-500/20 text-purple-200 space-y-1">
                <p className="font-semibold">✨ Asistente Financiero SOFIA (Google Gemini)</p>
                <p className="text-[11px] text-white/60">
                  Consigue tu API Key gratuita en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-w11-accent underline">aistudio.google.com</a> para habilitar el Copilot en tiempo real.
                </p>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Gemini API Key</label>
                <input
                  type="password"
                  className="w11-input w-full font-mono"
                  placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="submit" className="btn-accent">
                  Guardar API Key
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
