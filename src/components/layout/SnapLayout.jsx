import React from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ModuleRenderer } from '../../App'

const MODULE_OPTIONS = [
  { value: 'dashboard',      label: '📊 Executive Dashboard'        },
  { value: 'inversores',     label: '📋 Reporte para Inversores'    },
  { value: 'modelo_negocio', label: '🎨 Modelo de Negocio'          },
  { value: 'plan_accion',    label: '🗓️ Plan de Acción & Hitos'    },
  { value: 'costo_consumo',  label: '💡 Costo por Consumo'          },
  { value: 'equipo',         label: '👥 Equipo & Nómina'            },
  { value: 'gastos_capex',   label: '💸 Gastos Operativos & CAPEX'  },
  { value: 'proveedores',    label: '🤝 Proveedores & Términos'     },
  { value: 'campana',        label: '📢 Campaña Publicitaria'       },
  { value: 'breakeven',      label: '⚖️ Punto de Equilibrio & ROI' },
  { value: 'proyecciones',   label: '📈 Proyecciones P&L y Flujo'  },
  { value: 'plan_vs_real',   label: '📅 Plan vs. Real'              },
  { value: 'alertas',        label: '🚨 Centro de Alertas & CFO'   },
  { value: 'carreras',       label: '🏁 Calculadora de Carreras'    },
]

function PanelHeader({ side, value, onChange }) {
  const label = side === 'left' ? 'Panel Izquierdo' : 'Panel Derecho'
  return (
    <div className="flex items-center gap-2 px-3 h-9 bg-w11-card border-b border-white/8 shrink-0">
      <span className="text-[10px] text-w11-text/30 uppercase tracking-wider font-semibold">{label}</span>
      <select
        value={value}
        onChange={e => onChange(side, e.target.value)}
        className="ml-auto w11-input text-[11px] h-6 py-0 px-2 rounded"
      >
        {MODULE_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export default function SnapLayout() {
  const { snapLeft, snapRight, setSnapModule, toggleSnap } = useAppStore()

  return (
    <div className="relative flex h-full w-full overflow-hidden">

      {/* Left Panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <PanelHeader side="left" value={snapLeft} onChange={setSnapModule} />
        <div className="flex-1 overflow-auto">
          <ModuleRenderer moduleId={snapLeft} />
        </div>
      </div>

      {/* 4px Divider */}
      <div className="w-1 bg-w11-bg shrink-0 flex items-center justify-center group cursor-col-resize">
        <div className="w-0.5 h-8 bg-white/10 rounded-full group-hover:bg-w11-accent/60 transition-colors" />
      </div>

      {/* Right Panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <PanelHeader side="right" value={snapRight} onChange={setSnapModule} />
        <div className="flex-1 overflow-auto">
          <ModuleRenderer moduleId={snapRight} />
        </div>
      </div>

      {/* Exit Snap button */}
      <button
        onClick={toggleSnap}
        title="Salir de Snap Assist"
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-w11-card border border-white/10
                   text-[10px] font-semibold text-w11-text/60 hover:text-w11-text hover:border-white/25
                   px-3 py-1 rounded-full shadow-lg transition-all"
      >
        ✕ Salir de Snap
      </button>
    </div>
  )
}
