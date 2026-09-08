// src/components/modules/10_ProyeccionesP_L/index.jsx
import React, { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { useAppStore } from '../../store/useAppStore'
import { generatePnLTable, fmt, monthName } from '../../utils/financials'

export default function ProyeccionesP_L() {
  const { project, horizon, setHorizon, scenario, setScenario, toggleSettings } = useAppStore()

  const [viewMode, setViewMode] = useState('mensual') // 'mensual' | 'fases' | 'semestral' | 'anual'
  const [activeTabSub, setActiveTabSub] = useState('rondas') // 'rondas' | 'matriz'

  const pnlRows = useMemo(() => generatePnLTable(project, Math.max(horizon, 12), scenario), [project, horizon, scenario])

  // Exportar a Excel CSV
  const handleExportCSV = () => {
    const dataToExport = pnlRows.slice(0, horizon).map(r => ({
      'Período': monthName(r.month),
      'Ingresos ($)': r.revenue,
      'COGS ($)': r.cogs,
      'Margen Bruto ($)': r.grossMargin,
      'Nómina ($)': r.payroll,
      'OPEX ($)': r.opex,
      'EBITDA ($)': r.ebitda,
      'Margen EBITDA (%)': `${r.ebitdaMarginPct.toFixed(1)}%`,
      'CAPEX ($)': r.capex,
      'Total Egresos ($)': r.operationalCost + r.capex + r.cogs,
      'Flujo Neto ($)': r.netFlow,
      'Caja Acumulada ($)': r.cumulativeCash,
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Proyecciones_PyL')
    XLSX.writeFile(wb, `Proyecciones_${project.profile.id}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="module-content space-y-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h2 className="text-xl font-bold text-w11-text">Proyecciones Financieras Multianuales</h2>
          </div>
          <p className="text-xs text-white/40">Estado de Resultados y Flujo de Caja proyectado configurable de 6 meses a 5 años</p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
            {['mensual', 'fases', 'semestral', 'anual'].map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                  viewMode === m ? 'bg-w11-accent text-white shadow' : 'text-white/60 hover:text-white'
                }`}
              >
                {m === 'fases' ? 'Trimestral (Fases)' : m}
              </button>
            ))}
          </div>

          <button onClick={handleExportCSV} className="btn-subtle text-xs flex items-center gap-1">
            <span>📥</span> Descargar Excel
          </button>
        </div>
      </div>

      {/* Horizon & Scenario selectors */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-w11-card p-3 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-medium">Horizonte Temporal:</span>
          {[6, 12, 18, 24, 36, 48, 60].map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-2 py-1 rounded font-medium transition-all ${
                horizon === h ? 'bg-w11-accent text-white' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {h < 12 ? `${h} Meses` : `${h / 12} Años`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/40 font-medium">Escenario Activo:</span>
          {[
            { id: 'pessimist', label: 'Pesimista (-25%)' },
            { id: 'base', label: 'Base' },
            { id: 'optimist', label: 'Optimista (+35%)' },
          ].map(sc => (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                scenario === sc.id ? 'bg-w11-accent text-white' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dossier para Inversionistas Box */}
      <div className="w11-card rounded-2xl p-5 border border-w11-accent/30 bg-gradient-to-b from-[#0078d4]/10 to-transparent space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="chip-progress text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
              Dossier para Inversionistas
            </span>
            <h3 className="text-base font-bold text-w11-text mt-1">
              Estructura de Inversión por Fases &amp; Proyección Financiera
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSettings} className="btn-ghost text-xs">
              ❓ ¿Cómo explicar esto al inversionista?
            </button>
            <button onClick={toggleSettings} className="btn-accent text-xs">
              Ajustar Capital (${(project.profile.initialCapital || 52000).toLocaleString()})
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#181818]/80 p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] text-white/40">Inversión Total Requerida</p>
            <p className="text-xl font-bold text-w11-text font-mono">${(project.profile.initialCapital || 52000).toLocaleString()}</p>
            <p className="text-[10px] text-red-400 mt-1">Pico déficit: $51,130 (Mes 6)</p>
          </div>
          <div className="bg-[#181818]/80 p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] text-white/40">Desembolso Fase 1 (T1)</p>
            <p className="text-xl font-bold text-amber-400 font-mono">$18,500</p>
            <p className="text-[10px] text-white/40 mt-1">53% de la ronda · M1 a M3</p>
          </div>
          <div className="bg-[#181818]/80 p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] text-white/40">Desembolso Fase 2 (T2)</p>
            <p className="text-xl font-bold text-amber-400 font-mono">$16,500</p>
            <p className="text-[10px] text-white/40 mt-1">47% de la ronda · M4 a M6</p>
          </div>
          <div className="bg-[#181818]/80 p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] text-white/40">Punto de Equilibrio (T3)</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">Mes 7</p>
            <p className="text-[10px] text-white/40 mt-1">Desembolso T3 &amp; T4: $0 (Autofinanciado)</p>
          </div>
        </div>

        {/* Phase Cards Sub-nav */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveTabSub('rondas')}
            className={`px-3 py-1 rounded font-medium ${activeTabSub === 'rondas' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            📋 Rondas de Inversión por Fases (T1, T2, T3, T4)
          </button>
          <button
            onClick={() => setActiveTabSub('matriz')}
            className={`px-3 py-1 rounded font-medium ${activeTabSub === 'matriz' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            📊 Matriz Comparativa (Mensual, Trimestral, Semestral, Anual)
          </button>
        </div>

        {/* 4 Phase Blocks Grid */}
        {activeTabSub === 'rondas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
            {/* T1 */}
            <div className="bg-[#181818]/60 p-4 rounded-xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-semibold uppercase text-[10px]">Fase 1 (1er Trimestre - T1)</span>
                <span className="chip-todo text-[10px]">Pre-Operativo</span>
              </div>
              <h4 className="font-bold text-sm text-w11-text">Desarrollo de Software &amp; Setup TI</h4>
              <p className="text-white/40 text-[11px]">Mes 1 a Mes 3</p>
              <div className="pt-1">
                <span className="text-white/40 block text-[10px]">Capital del Inversionista:</span>
                <span className="font-bold text-sm text-amber-400 font-mono">$18,500</span>
              </div>
              <div className="space-y-1 text-white/60 text-[11px] pt-1 border-t border-white/5">
                <p>• Ingresos Proyectados: <span className="font-mono text-white">$0</span></p>
                <p>• Costos (OPEX+Nómina): <span className="font-mono text-white">$18,110</span></p>
                <p>• Flujo Neto Trimestre: <span className="font-mono text-red-400">$-21,860</span></p>
              </div>
              <div className="pt-2 text-[10px] text-white/50 space-y-1 border-t border-white/5">
                <span className="font-semibold text-white/70 block">Hitos de Entrega:</span>
                <p>✓ App Conductor &amp; Pasajero MVP listas</p>
                <p>✓ Infraestructura NGINX + VPS + Firebase</p>
                <p>✓ Registro Mercantil y blindaje legal</p>
              </div>
            </div>

            {/* T2 */}
            <div className="bg-[#181818]/60 p-4 rounded-xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-semibold uppercase text-[10px]">Fase 2 (2do Trimestre - T2)</span>
                <span className="chip-danger text-[10px]">Pico de Déficit</span>
              </div>
              <h4 className="font-bold text-sm text-w11-text">Onboarding 500 Motos &amp; Lanzamiento</h4>
              <p className="text-white/40 text-[11px]">Mes 4 a Mes 6</p>
              <div className="pt-1">
                <span className="text-white/40 block text-[10px]">Capital del Inversionista:</span>
                <span className="font-bold text-sm text-amber-400 font-mono">$16,500</span>
              </div>
              <div className="space-y-1 text-white/60 text-[11px] pt-1 border-t border-white/5">
                <p>• Ingresos Proyectados: <span className="font-mono text-white">$0</span></p>
                <p>• Costos (OPEX+Nómina): <span className="font-mono text-white">$29,045</span></p>
                <p>• Flujo Neto Trimestre: <span className="font-mono text-red-400">$-29,270</span></p>
              </div>
              <div className="pt-2 text-[10px] text-white/50 space-y-1 border-t border-white/5">
                <span className="font-semibold text-white/70 block">Hitos de Entrega:</span>
                <p>✓ 500 motorizados verificados con Didit</p>
                <p>✓ Dotación de chalecos oficiales y paradas</p>
                <p>✓ Pico de déficit alcanzado en Mes 6</p>
              </div>
            </div>

            {/* T3 */}
            <div className="bg-[#181818]/60 p-4 rounded-xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-semibold uppercase text-[10px]">Fase 3 (3er Trimestre - T3)</span>
                <span className="chip-completed text-[10px]">¡Autosuficiente! 🚀</span>
              </div>
              <h4 className="font-bold text-sm text-w11-text">Punto de Equilibrio (Breakeven)</h4>
              <p className="text-white/40 text-[11px]">Mes 7 a Mes 9</p>
              <div className="pt-1">
                <span className="text-white/40 block text-[10px]">Capital del Inversionista:</span>
                <span className="font-bold text-sm text-emerald-400 font-mono">$0 (Autofinanciado)</span>
              </div>
              <div className="space-y-1 text-white/60 text-[11px] pt-1 border-t border-white/5">
                <p>• Ingresos Proyectados: <span className="font-mono text-emerald-400">$36,000+</span></p>
                <p>• Costos Operativos: <span className="font-mono text-white">$28,000</span></p>
                <p>• Flujo Neto Trimestre: <span className="font-mono text-emerald-400">+$8,000</span></p>
              </div>
              <div className="pt-2 text-[10px] text-white/50 space-y-1 border-t border-white/5">
                <span className="font-semibold text-white/70 block">Hitos de Entrega:</span>
                <p>✓ Punto de equilibrio alcanzado en Mes 7</p>
                <p>✓ Monetización triple activa</p>
                <p>✓ Flujo de caja neto positivo</p>
              </div>
            </div>

            {/* T4 */}
            <div className="bg-[#181818]/60 p-4 rounded-xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-semibold uppercase text-[10px]">Fase 4 (4to Trimestre - T4)</span>
                <span className="chip-progress text-[10px]">Superávit Libre</span>
              </div>
              <h4 className="font-bold text-sm text-w11-text">Consolidación &amp; Expansión</h4>
              <p className="text-white/40 text-[11px]">Mes 10 a Mes 12</p>
              <div className="pt-1">
                <span className="text-white/40 block text-[10px]">Capital del Inversionista:</span>
                <span className="font-bold text-sm text-emerald-400 font-mono">$0 (Autofinanciado)</span>
              </div>
              <div className="space-y-1 text-white/60 text-[11px] pt-1 border-t border-white/5">
                <p>• Ingresos Proyectados: <span className="font-mono text-emerald-400">$45,000+</span></p>
                <p>• Costos Operativos: <span className="font-mono text-white">$29,500</span></p>
                <p>• Flujo Neto Trimestre: <span className="font-mono text-emerald-400">+$15,500</span></p>
              </div>
              <div className="pt-2 text-[10px] text-white/50 space-y-1 border-t border-white/5">
                <span className="font-semibold text-white/70 block">Hitos de Entrega:</span>
                <p>✓ Flota consolidada con 1,000+ conductores</p>
                <p>✓ Expansión hacia Valencia y Maracaibo</p>
                <p>✓ Preparación de dividendos</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main P&L Table */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-w11-text">
          Estado de Resultados Mensual — {horizon} Meses Proyectados
        </h3>

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-xs min-w-[950px]">
            <thead>
              <tr className="text-white/40 uppercase tracking-wide">
                <th className="py-2 px-2 text-left">Período</th>
                <th className="py-2 px-2 text-right">Ingresos ($)</th>
                <th className="py-2 px-2 text-right">COGS ($)</th>
                <th className="py-2 px-2 text-right">Margen Bruto</th>
                <th className="py-2 px-2 text-right">Nómina ($)</th>
                <th className="py-2 px-2 text-right">OPEX ($)</th>
                <th className="py-2 px-2 text-right">EBITDA ($)</th>
                <th className="py-2 px-2 text-right">Margen EBITDA</th>
                <th className="py-2 px-2 text-right">CAPEX</th>
                <th className="py-2 px-2 text-right">Total Egresos</th>
                <th className="py-2 px-2 text-right">Flujo Neto</th>
                <th className="py-2 px-2 text-right font-bold">Caja Acumulada</th>
              </tr>
            </thead>
            <tbody>
              {pnlRows.slice(0, horizon).map(row => {
                const isPositiveEbitda = row.ebitda >= 0
                const isPositiveCash = row.cumulativeCash >= 0

                return (
                  <tr key={row.month} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors font-mono">
                    <td className="py-2.5 px-2 text-left font-sans text-white/80 font-medium">
                      {monthName(row.month)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-400 font-semibold">{fmt(row.revenue)}</td>
                    <td className="py-2.5 px-2 text-right text-white/60">{fmt(row.cogs)}</td>
                    <td className="py-2.5 px-2 text-right text-white/80">{fmt(row.grossMargin)}</td>
                    <td className="py-2.5 px-2 text-right text-white/60">{fmt(row.payroll)}</td>
                    <td className="py-2.5 px-2 text-right text-white/60">{fmt(row.opex)}</td>
                    <td className={`py-2.5 px-2 text-right font-bold ${isPositiveEbitda ? 'text-blue-400' : 'text-red-400'}`}>
                      {row.ebitda < 0 ? '-' : ''}{fmt(Math.abs(row.ebitda))}
                    </td>
                    <td className="py-2.5 px-2 text-right text-white/60">{row.ebitdaMarginPct.toFixed(1)}%</td>
                    <td className="py-2.5 px-2 text-right text-white/60">{row.capex > 0 ? fmt(row.capex) : '-'}</td>
                    <td className="py-2.5 px-2 text-right text-white/80">{fmt(row.operationalCost + row.capex + row.cogs)}</td>
                    <td className={`py-2.5 px-2 text-right ${row.netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.netFlow < 0 ? '-' : ''}{fmt(Math.abs(row.netFlow))}
                    </td>
                    <td className={`py-2.5 px-2 text-right font-bold ${isPositiveCash ? 'text-blue-400' : 'text-red-400'}`}>
                      {row.cumulativeCash < 0 ? '-' : ''}{fmt(Math.abs(row.cumulativeCash))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
