import React, { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

const ALL_MODULES = [
  { icon: '📊', label: 'Dashboard',         module: 'dashboard'      },
  { icon: '📋', label: 'Inversores',         module: 'inversores'     },
  { icon: '🎨', label: 'Modelo Negocio',     module: 'modelo_negocio' },
  { icon: '🗓️', label: 'Plan de Acción',    module: 'plan_accion'    },
  { icon: '💡', label: 'Costo Consumo',      module: 'costo_consumo'  },
  { icon: '👥', label: 'Equipo',             module: 'equipo'         },
  { icon: '💸', label: 'Gastos & CAPEX',     module: 'gastos_capex'   },
  { icon: '🤝', label: 'Proveedores',        module: 'proveedores'    },
  { icon: '📢', label: 'Campaña',            module: 'campana'        },
  { icon: '⚖️', label: 'Breakeven & ROI',   module: 'breakeven'      },
  { icon: '📈', label: 'Proyecciones',       module: 'proyecciones'   },
  { icon: '📅', label: 'Plan vs. Real',      module: 'plan_vs_real'   },
  { icon: '🚨', label: 'Alertas & CFO',      module: 'alertas'        },
  { icon: '🏁', label: 'Carreras',           module: 'carreras'       },
]

export default function MobileTaskbar() {
  const { activeModule, setModule, toggleSofia, toggleSettings } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleModuleSelect(mod) {
    setModule(mod)
    setMenuOpen(false)
  }

  return (
    <>
      {/* ── Full-Screen Module Grid ─────────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Slide-up panel */}
          <div
            className="relative mt-auto bg-w11-surface border-t border-white/10 rounded-t-2xl
                        animate-[slideUp_0.25s_ease-out] pb-20 pt-4 px-4"
            style={{ animation: 'slideUp 0.25s ease-out' }}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

            <p className="text-[11px] uppercase tracking-widest text-w11-text/40 mb-3 text-center font-semibold">
              Módulos
            </p>

            {/* 4-column grid */}
            <div className="grid grid-cols-4 gap-2">
              {ALL_MODULES.map(item => {
                const isActive = activeModule === item.module
                return (
                  <button
                    key={item.module}
                    onClick={() => handleModuleSelect(item.module)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
                      ${isActive
                        ? 'bg-w11-accent/20 border border-w11-accent/40'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
                  >
                    <span className="text-2xl leading-none select-none">{item.icon}</span>
                    <span className={`text-[10px] font-medium text-center leading-tight
                      ${isActive ? 'text-w11-accent' : 'text-w11-text/70'}`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Taskbar ──────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-w11-surface/95 backdrop-blur border-t border-white/8
                      flex items-center justify-around px-4">
        {/* SOFIA */}
        <button
          onClick={toggleSofia}
          className="flex flex-col items-center gap-0.5 text-w11-text/60 hover:text-w11-text transition-colors"
        >
          <span className="text-xl leading-none">✨</span>
          <span className="text-[9px] font-medium">SOFIA</span>
        </button>

        {/* Back / active module shortcut */}
        <button
          onClick={() => setModule('dashboard')}
          className="flex flex-col items-center gap-0.5 text-w11-text/60 hover:text-w11-text transition-colors"
        >
          <span className="text-xl leading-none">📊</span>
          <span className="text-[9px] font-medium">Inicio</span>
        </button>

        {/* Windows Button — center */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg
                      transition-all duration-200 border-2
                      ${menuOpen
                        ? 'bg-w11-accent border-w11-accent scale-95'
                        : 'bg-w11-card border-white/10 hover:border-w11-accent/50 hover:bg-w11-accent/10'}`}
          style={{ marginTop: '-12px' }}
        >
          ⊞
        </button>

        {/* Alertas */}
        <button
          onClick={() => setModule('alertas')}
          className="flex flex-col items-center gap-0.5 text-w11-text/60 hover:text-w11-text transition-colors relative"
        >
          <span className="text-xl leading-none">🚨</span>
          <span className="absolute -top-0.5 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center">4</span>
          <span className="text-[9px] font-medium">Alertas</span>
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          className="flex flex-col items-center gap-0.5 text-w11-text/60 hover:text-w11-text transition-colors"
        >
          <span className="text-xl leading-none">⚙️</span>
          <span className="text-[9px] font-medium">Config.</span>
        </button>
      </div>

      {/* Slide-up keyframe */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
