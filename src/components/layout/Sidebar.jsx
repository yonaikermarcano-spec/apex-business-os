import React from 'react'
import { useAppStore } from '../../store/useAppStore'

// ── Navigation structure ───────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    title: 'Visión General',
    items: [
      { icon: '📊', label: 'Executive Dashboard',       module: 'dashboard'      },
      { icon: '📋', label: 'Reporte para Inversores',   module: 'inversores'     },
    ],
  },
  {
    title: 'Estructura de Costos & Plan',
    items: [
      { icon: '🎨', label: 'Modelo de Negocio',          module: 'modelo_negocio'  },
      { icon: '🗓️', label: 'Plan de Acción & Hitos',    module: 'plan_accion'     },
      { icon: '💡', label: 'Costo por Consumo',          module: 'costo_consumo'   },
      { icon: '👥', label: 'Equipo & Nómina',            module: 'equipo'          },
      { icon: '💸', label: 'Gastos Operativos & CAPEX',  module: 'gastos_capex'    },
      { icon: '🤝', label: 'Proveedores & Términos',     module: 'proveedores'     },
      { icon: '📢', label: 'Campaña Publicitaria',       module: 'campana',        badge: 'Nuevo', badgeType: 'new' },
    ],
  },
  {
    title: 'Análisis & Control',
    items: [
      { icon: '⚖️', label: 'Punto de Equilibrio & ROI', module: 'breakeven'       },
      { icon: '📈', label: 'Proyecciones P&L y Flujo',  module: 'proyecciones'    },
      { icon: '📅', label: 'Plan vs. Real (Seguimiento)',module: 'plan_vs_real'    },
      { icon: '🚨', label: 'Centro de Alertas & CFO',   module: 'alertas',        badge: '4', badgeType: 'danger' },
      { icon: '🏁', label: 'Calculadora de Carreras',   module: 'carreras',       badge: 'Nuevo', badgeType: 'new' },
    ],
  },
]

// ── Badge sub-component ────────────────────────────────────────────────────────
function Badge({ text, type }) {
  const cls =
    type === 'danger'
      ? 'bg-red-600 text-white'
      : 'bg-w11-accent/80 text-white'
  return (
    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${cls}`}>
      {text}
    </span>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { activeModule, setModule, project } = useAppStore()

  const companyName = project?.profile?.companyName ?? 'Movilidad Caracas'
  const city        = project?.profile?.city         ?? 'Caracas'
  const industry    = project?.profile?.industry      ?? 'Movilidad Urbana'

  return (
    <aside className="w-[220px] flex flex-col bg-w11-surface border-r border-white/8 h-full overflow-hidden shrink-0">

      {/* Project Card */}
      <div className="px-3 pt-3 pb-2 border-b border-white/8 shrink-0">
        <div className="bg-w11-card rounded-lg px-3 py-2.5">
          <p className="text-[13px] font-semibold text-w11-text truncate">{companyName}</p>
          <p className="text-[11px] text-w11-text/50 mt-0.5 truncate">{city} · {industry}</p>
        </div>

        {/* Pitch button */}
        <button
          onClick={() => setModule('inversores')}
          className="mt-2 w-full btn-accent text-[11px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1.5"
        >
          <span>🌐</span>
          <span>Web de Presentación</span>
          <span className="opacity-60 text-[10px]">[PITCH]</span>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        aria-label="Navegación principal"
      >
        {NAV_SECTIONS.map(section => (
          <div key={section.title} className="mb-1">
            {/* Section label */}
            <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-widest font-semibold text-w11-text/30 select-none">
              {section.title}
            </p>

            {/* Nav items */}
            {section.items.map(item => {
              const isActive = activeModule === item.module
              return (
                <button
                  key={item.module}
                  onClick={() => setModule(item.module)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative w-full flex items-center gap-2 px-3 py-1.5 text-left
                              transition-all duration-150
                              ${isActive
                                ? 'bg-white/8 text-w11-text'
                                : 'text-w11-text/60 hover:bg-white/5 hover:text-w11-text/90'
                              }`}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-w11-accent" />
                  )}

                  <span className="text-[14px] leading-none shrink-0 select-none">{item.icon}</span>
                  <span className="text-[12px] font-medium leading-tight flex-1 truncate">{item.label}</span>

                  {item.badge && <Badge text={item.badge} type={item.badgeType} />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/8 shrink-0">
        <p className="text-[10px] text-w11-text/20 text-center">Apex Business OS v1.0</p>
      </div>
    </aside>
  )
}
