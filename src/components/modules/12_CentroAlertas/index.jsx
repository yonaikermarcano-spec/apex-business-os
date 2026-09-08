// src/components/modules/12_CentroAlertas/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { generatePnLTable, fmt } from '../../utils/financials'

function KpiCard({ label, value, sub, countColor }) {
  return (
    <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
      <p className="kpi-label text-xs">{label}</p>
      <p className={`kpi-value text-2xl font-bold ${countColor || 'text-w11-text'}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

export default function CentroAlertas() {
  const { project, horizon, scenario } = useAppStore()
  const [activeFilter, setActiveFilter] = useState('all')

  const pnlRows = useMemo(() => generatePnLTable(project, horizon, scenario), [project, horizon, scenario])
  const actualRecords = project.actualRecords || []

  // Dynamic alert generation engine
  const alerts = useMemo(() => {
    const list = []

    // 1. Valle de la muerte / Déficit de caja
    const negativeCashMonths = pnlRows.filter(r => r.cumulativeCash < 0)
    if (negativeCashMonths.length > 0) {
      const worstMonth = negativeCashMonths.reduce((min, r) => r.cumulativeCash < min.cumulativeCash ? r : min, negativeCashMonths[0])
      list.push({
        id: 'alt-cash-deficit',
        category: 'liquidity',
        level: 'critical',
        title: 'Pico de Déficit de Caja Proyectado (Valle de la Muerte)',
        description: `El flujo acumulado alcanza un saldo negativo de ${fmt(worstMonth.cumulativeCash)} en el Mes ${worstMonth.month}. Requiere una ronda de capital semilla inicial para no quebrar.`,
        impact: `Impacto en Mes ${worstMonth.month}`,
        recommendation: `Asegurar un aporte de capital semilla mínimo de ${fmt(Math.abs(worstMonth.cumulativeCash) + 5000)} antes de iniciar la Fase 2.`,
      })
    }

    // 2. Punto de Equilibrio no alcanzado
    const reachedBreakeven = pnlRows.some(r => r.ebitda > 0)
    if (!reachedBreakeven) {
      list.push({
        id: 'alt-breakeven-not-reached',
        category: 'breakeven',
        level: 'warning',
        title: 'No se alcanza el Punto de Equilibrio en el horizonte seleccionado',
        description: `Los ingresos no son suficientes para cubrir los costos fijos dentro de este período de ${horizon} meses.`,
        impact: `Horizonte ${horizon}m`,
        recommendation: 'Aumentar precios, acelerar adquisición de clientes o recortar gastos de nómina y OPEX.',
      })
    }

    // 3. Margen bruto vulnerable
    const avgRevenue = pnlRows.reduce((s, r) => s + r.revenue, 0) / (pnlRows.length || 1)
    const avgCogs = pnlRows.reduce((s, r) => s + r.cogs, 0) / (pnlRows.length || 1)
    const avgMarginPct = avgRevenue > 0 ? ((avgRevenue - avgCogs) / avgRevenue) * 100 : 0
    if (avgMarginPct < 15) {
      list.push({
        id: 'alt-vulnerable-margin',
        category: 'margin',
        level: 'warning',
        title: 'Margen Bruto Vulnerable',
        description: `El margen bruto promedio es de ${avgMarginPct.toFixed(1)}%, lo cual deja poco espacio para cubrir costos fijos.`,
        impact: 'Unit Economics',
        recommendation: 'Negociar costos con proveedores directos (KYC, mapas) o evaluar aumentar precios por servicio.',
      })
    }

    // 4. Desvíos en Plan vs. Real
    actualRecords.forEach(rec => {
      const planned = pnlRows.find(r => r.month === rec.month)
      if (planned && rec.realOpex > planned.opex * 1.25) {
        const diff = rec.realOpex - planned.opex
        const pct = Math.round((diff / (planned.opex || 1)) * 100)
        list.push({
          id: `alt-opex-deviation-${rec.month}`,
          category: 'variance',
          level: 'critical',
          title: `Desvío de Gasto Operativo en Mes ${rec.month} (${rec.monthName || 'Mes ' + rec.month})`,
          description: `El gasto real fue de ${fmt(rec.realOpex)} vs planificado ${fmt(planned.opex)} (+${pct}%).`,
          impact: `Impacto en Mes ${rec.month}`,
          recommendation: 'Auditar los comprobantes de egreso para contener la fuga de liquidez.',
        })
      }
    })

    return list
  }, [pnlRows, horizon, actualRecords])

  const criticalCount = alerts.filter(a => a.level === 'critical').length
  const warningCount = alerts.filter(a => a.level === 'warning').length
  const positiveCount = alerts.filter(a => a.level === 'positive').length

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'all') return true
    return a.category === activeFilter
  })

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🚨</span>
          <h2 className="text-xl font-bold text-w11-text">Centro de Alertas &amp; Diagnóstico Financiero (Virtual CFO)</h2>
        </div>
        <p className="text-xs text-white/40">Detección automática de riesgos de liquidez, márgenes vulnerables y oportunidades de optimización</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Señales Activas"
          value={`${alerts.length} alertas`}
          sub="Diagnóstico del sistema"
        />
        <KpiCard
          label="Riesgos Críticos (Peligro)"
          value={criticalCount}
          sub="Requieren financiamiento o ajuste urgente"
          countColor="text-red-400"
        />
        <KpiCard
          label="Advertencias / Margen"
          value={warningCount}
          sub="Monitoreo preventivo de costos"
          countColor="text-amber-400"
        />
        <KpiCard
          label="Fortalezas Consolidadas"
          value={positiveCount}
          sub="Hitos de rentabilidad alcanzados"
          countColor="text-emerald-400"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Todas las Alertas' },
          { id: 'liquidity', label: 'Liquidez & Capital' },
          { id: 'breakeven', label: 'Punto de Equilibrio' },
          { id: 'margin', label: 'Márgenes & COGS' },
          { id: 'variance', label: 'Desvíos Plan vs Real' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === tab.id
                ? 'bg-w11-accent text-white shadow'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isCritical = alert.level === 'critical'
          const isWarning = alert.level === 'warning'

          const borderCol = isCritical ? 'border-red-500/40 bg-red-950/20' : isWarning ? 'border-amber-500/40 bg-amber-950/20' : 'border-emerald-500/40 bg-emerald-950/20'
          const icon = isCritical ? '🔥' : isWarning ? '⚠️' : '✅'
          const titleCol = isCritical ? 'text-red-300' : isWarning ? 'text-amber-300' : 'text-emerald-300'

          return (
            <div
              key={alert.id}
              className={`w11-card rounded-xl p-4 border-l-4 ${borderCol} space-y-2 transition-all hover:bg-white/[0.02]`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <h4 className={`text-sm font-bold ${titleCol}`}>{alert.title}</h4>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  {alert.impact}
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed pl-6">
                {alert.description}
              </p>

              <div className="ml-6 mt-2 pt-2 border-t border-white/5 flex items-start gap-2 text-xs">
                <span className="text-white/40 font-semibold shrink-0">Recomendación del CFO:</span>
                <span className="text-w11-text font-medium">{alert.recommendation}</span>
              </div>
            </div>
          )
        })}

        {filteredAlerts.length === 0 && (
          <div className="w11-card rounded-xl p-8 text-center text-white/40">
            No se encontraron alertas en esta categoría.
          </div>
        )}
      </div>
    </div>
  )
}
