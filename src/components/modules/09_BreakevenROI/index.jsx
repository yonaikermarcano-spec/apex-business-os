// src/components/modules/09_BreakevenROI/index.jsx
import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import {
  generatePnLTable, calculateBreakevenRevenue, fmt, monthName,
} from '../../utils/financials'

/* ── Tooltip personalizado ─────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="acrylic rounded-lg p-3 text-xs border border-white/10 space-y-1">
      <p className="text-w11-text font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex gap-2">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="text-w11-text">${Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
      ))}
    </div>
  )
}

/* ── KPI Card ──────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent = false, danger = false }) {
  return (
    <div className={`w11-card rounded-xl p-4 flex flex-col gap-1 border
      ${danger ? 'border-red-500/30' : accent ? 'border-[#0078d4]/30' : 'border-white/5'}`}>
      <p className="kpi-label text-xs">{label}</p>
      <p className={`kpi-value text-2xl font-bold
        ${danger ? 'text-red-400' : accent ? 'text-[#0078d4]' : 'text-w11-text'}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────── */
export default function BreakevenROI() {
  const { project, horizon, scenario } = useAppStore()

  const [priceDelta,  setPriceDelta]  = useState(0)
  const [volumeDelta, setVolumeDelta] = useState(0)
  const [opexDelta,   setOpexDelta]   = useState(0)

  const rows = useMemo(
    () => generatePnLTable(project, Math.max(horizon, 24), scenario),
    [project, horizon, scenario]
  )

  const baseBreakeven   = useMemo(() => calculateBreakevenRevenue(project, 6), [project])
  const breakevenMonth  = useMemo(() => rows.find(r => r.ebitda >= 0)?.month ?? null, [rows])
  const totalInvestment = project.profile.initialCapital ?? 52000

  const year2Revenue = rows.slice(12, 24).reduce((s, r) => s + r.revenue, 0)
  const year2Costs   = rows.slice(12, 24).reduce((s, r) => s + r.operationalCost + r.capex, 0)
  const roiYear2Pct  = totalInvestment > 0
    ? (((year2Revenue - year2Costs) / totalInvestment) * 100).toFixed(1)
    : '0'

  const m6           = rows[5]
  const marginSafety = m6?.revenue > 0
    ? (((m6.revenue - baseBreakeven) / m6.revenue) * 100).toFixed(1)
    : '0'

  /* Simulator */
  const sim = useMemo(() => {
    const simRevenue   = (m6?.revenue    ?? 0) * (1 + priceDelta  / 100) * (1 + volumeDelta / 100)
    const simBreakeven = (m6?.payroll    ?? 0) + (m6?.opex ?? 0) * (1 + opexDelta / 100)
    return { simRevenue, simBreakeven, wentUp: simBreakeven > baseBreakeven }
  }, [priceDelta, volumeDelta, opexDelta, m6, baseBreakeven])

  /* Chart data */
  const chartData = useMemo(() =>
    rows.slice(0, Math.max(horizon, 12)).map(r => ({
      name: monthName(r.month),
      'Caja Acumulada': Math.round(r.cumulativeCash),
      'Ingresos':       Math.round(r.revenue),
      'Costos Totales': Math.round(r.operationalCost),
    }))
  , [rows, horizon])

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="module-content space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-w11-text">Punto de Equilibrio &amp; ROI</h2>
          <p className="text-xs text-white/40">Análisis de rentabilidad, breakeven y sensibilidad financiera</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${breakevenMonth ? 'chip-progress' : 'chip-danger'}`}>
          {breakevenMonth ? `Breakeven: Mes ${breakevenMonth}` : 'Sin Breakeven en horizonte'}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Ventas Requeridas (Breakeven)"      value={fmt(baseBreakeven)}                            sub="por mes — Nómina + OPEX"               accent />
        <KpiCard label="Margen de Seguridad"                value={`${marginSafety}%`}                           sub="(Ingresos − BE) / Ingresos — Mes 6"    danger={parseFloat(marginSafety) < 0} />
        <KpiCard label="Período de Recuperación (Payback)"  value={breakevenMonth ? `${breakevenMonth} meses` : 'N/A'} sub="Primer mes con EBITDA ≥ 0" />
        <KpiCard label="ROI Año 2"                          value={`${roiYear2Pct}%`}                            sub="(Utilidad Año 2 / Inversión Total)"    danger={parseFloat(roiYear2Pct) < 0} />
      </div>

      {/* Sensitivity Simulator */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold text-w11-text">🎛 Simulador de Sensibilidad</span>
          <span className="text-xs text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded">"What IF" en Tiempo Real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Variación en Precio de Venta', val: priceDelta, set: setPriceDelta, min: -50, max: 100 },
            { label: 'Variación en Volumen de Ventas', val: volumeDelta, set: setVolumeDelta, min: -50, max: 100 },
            { label: 'Variación en Gastos Fijos (OPEX/Nómina)', val: opexDelta, set: setOpexDelta, min: -30, max: 50 },
          ].map(({ label, val, set, min, max }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">{label}</span>
                <span className={`font-bold font-mono ${val === 0 ? 'text-white/60' : val > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  {val >= 0 ? '+' : ''}{val}%
                </span>
              </div>
              <input
                type="range" min={min} max={max} step={5} value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
              />
              <div className="flex justify-between text-[10px] text-white/30">
                <span>{min}%</span><span>0%</span><span>+{max}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-lg px-4 py-3 border text-sm flex flex-col sm:flex-row sm:items-center gap-2
          ${sim.wentUp ? 'border-orange-500/40 bg-orange-500/10' : 'border-[#0078d4]/30 bg-[#0078d4]/10'}`}>
          <span className="text-white/60 text-xs">Nuevo Punto de Equilibrio Simulado:</span>
          <span className="font-bold text-lg text-w11-text font-mono">{fmt(sim.simBreakeven)}/mes</span>
          <span className="text-white/40 text-xs">vs ingresos simulados: {fmt(sim.simRevenue)}/mes</span>
          {sim.wentUp && (
            <span className="ml-auto text-orange-400 text-xs font-semibold">
              ⚠️ El umbral de ventas subió. Se requiere más tracción comercial.
            </span>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Chart 1 – Curva Caja Acumulada */}
        <div className="w11-card rounded-xl p-5 border border-white/5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-w11-text">Curva de Caja Acumulada &amp; Valle de la Muerte</p>
            <p className="text-xs text-white/40">Runway — zona roja = capital en riesgo</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cajaPosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0078d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0078d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
              <ReferenceLine y={0} stroke="rgba(255,100,100,0.5)" strokeDasharray="4 3"
                label={{ value: 'BE', fill: '#f87171', fontSize: 9, position: 'insideTopRight' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Caja Acumulada" stroke="#0078d4" strokeWidth={2}
                fill="url(#cajaPosGrad)" dot={false} activeDot={{ r: 4, fill: '#0078d4' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 – Ingresos vs Costos */}
        <div className="w11-card rounded-xl p-5 border border-white/5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-w11-text">Cruce Ingresos vs. Costos Totales (EBITDA)</p>
            <p className="text-xs text-white/40">El cruce verde/naranja indica el punto de equilibrio operativo</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#aaa' }} />
              <Line type="monotone" dataKey="Ingresos"       stroke="#22c55e" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="Costos Totales" stroke="#f97316" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="Caja Acumulada" stroke="#0078d4" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly summary table */}
      <div className="w11-card rounded-xl p-4 border border-white/5 overflow-x-auto">
        <p className="text-sm font-semibold text-w11-text mb-3">Resumen Mensual — {Math.min(horizon, 12)} meses</p>
        <table className="w11-table w-full text-xs min-w-[640px]">
          <thead>
            <tr className="text-white/40 uppercase tracking-wide">
              {['Mes', 'Ingresos', 'Costos Fijos', 'EBITDA', 'Caja Acum.', 'Estado'].map(h => (
                <th key={h} className={`py-2 px-2 font-medium ${h === 'Mes' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, Math.min(horizon, 12)).map(r => (
              <tr key={r.month} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-2 px-2 text-white/60 font-mono text-left">{monthName(r.month)}</td>
                <td className="py-2 px-2 text-right text-green-400  font-mono">{fmt(r.revenue)}</td>
                <td className="py-2 px-2 text-right text-orange-400 font-mono">{fmt(r.operationalCost)}</td>
                <td className={`py-2 px-2 text-right font-mono font-bold ${r.ebitda >= 0 ? 'text-[#0078d4]' : 'text-red-400'}`}>
                  {r.ebitda < 0 ? '−' : ''}{fmt(Math.abs(r.ebitda))}
                </td>
                <td className={`py-2 px-2 text-right font-mono ${r.cumulativeCash >= 0 ? 'text-[#0078d4]' : 'text-red-400'}`}>
                  {r.cumulativeCash < 0 ? '−' : ''}{fmt(Math.abs(r.cumulativeCash))}
                </td>
                <td className="py-2 px-2 text-right">
                  {r.ebitda >= 0
                    ? <span className="chip-completed text-[10px] px-2 py-0.5 rounded">✓ Positivo</span>
                    : <span className="chip-danger   text-[10px] px-2 py-0.5 rounded">Quema</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
