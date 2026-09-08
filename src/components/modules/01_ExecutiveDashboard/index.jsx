// 01_ExecutiveDashboard/index.jsx
// Dashboard Ejecutivo — Apex Business OS

import React, { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import {
  generatePnLTable,
  calculateBreakevenRevenue,
  calculateHealthScore,
  fmt,
  monthName,
} from '../../utils/financials'

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent = false, danger = false }) {
  return (
    <div
      className={`w11-card p-4 flex flex-col gap-1 ${
        danger  ? 'border border-red-500/30' :
        accent  ? 'border border-[#0078d4]/30' : ''
      }`}
    >
      <span className="kpi-label">{label}</span>
      <span className={`kpi-value ${danger ? 'text-red-400' : accent ? 'text-[#0078d4]' : ''}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-[#888] mt-1">{sub}</span>}
    </div>
  )
}

function MetricRow({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#888]">{label}</span>
      <span className="text-sm font-semibold text-[#e8e8e8]">
        {value}{' '}
        <span className="text-xs font-normal text-[#666]">{sub}</span>
      </span>
    </div>
  )
}

function HealthGauge({ score }) {
  const color =
    score >= 70 ? '#22c55e' :
    score >= 45 ? '#f59e0b' : '#ef4444'
  const label =
    score >= 70 ? 'Saludable' :
    score >= 45 ? 'En Observación' : 'Crítico'
  const R             = 40
  const circumference = 2 * Math.PI * R
  const offset        = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={R} stroke="#333" strokeWidth="10" fill="none" />
        <circle
          cx="50" cy="50" r={R}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-2xl font-bold leading-none" style={{ color }}>{score}</p>
        <p className="text-[11px] mt-0.5" style={{ color }}>{label}</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#202020] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#888] mb-1">{label}</p>
      <p className="text-[#0078d4] font-semibold">{fmt(payload[0]?.value)}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const project  = useAppStore(s => s.project)
  const horizon  = useAppStore(s => s.horizon)
  const scenario = useAppStore(s => s.scenario)

  const pnl = useMemo(
    () => generatePnLTable(project, horizon, scenario),
    [project, horizon, scenario],
  )

  // KPIs
  const initialCapital   = project.profile?.initialCapital ?? 51000
  const breakevenRevenue = useMemo(() => calculateBreakevenRevenue(project, 1), [project])
  const runwayMonths     = useMemo(() => pnl.filter(r => r.cumulativeCash > 0).length, [pnl])
  const roiYear2         = -199.2
  const healthScore      = useMemo(() => calculateHealthScore(project, horizon, scenario), [project, horizon, scenario])

  // Team
  const employees    = project.employees  || []
  const directors    = employees.filter(e => e.type === 'director')
  const totalPayroll = employees.reduce((s, e) => s + (e.baseSalaryMonthly || 0), 0)

  // CFO metrics
  const totalNomina = totalPayroll
  const totalOpex   = (project.opexExpenses      || []).reduce((s, e) => s + (e.monthlyCost || 0), 0)
  const totalCapex  = (project.capexInvestments  || []).reduce((s, e) => s + (e.totalCost   || 0), 0)

  // Chart
  const chartData = useMemo(
    () => pnl.map(r => ({
      name: monthName(r.month, project.profile?.startYear ?? 2026),
      caja: r.cumulativeCash,
    })),
    [pnl, project.profile?.startYear],
  )

  // Alert previews
  const alertPreviews = useMemo(() => {
    const alerts = []

    const deficitRow = pnl.find(r => r.cumulativeCash < 0)
    if (deficitRow) alerts.push({
      type:  'danger',
      title: 'Pico de Déficit de Caja Proyectado',
      desc:  `La caja cae a ${fmt(deficitRow.cumulativeCash)} en Mes ${deficitRow.month}`,
    })

    if (!pnl.some(r => r.ebitda > 0)) alerts.push({
      type:  'warning',
      title: 'Sin Punto de Equilibrio en el Horizonte',
      desc:  `No se proyecta EBITDA positivo en ${horizon} meses`,
    })

    // Margen bruto promedio < 10 %
    const avgRev  = pnl.reduce((s, r) => s + r.revenue, 0) / (pnl.length || 1)
    const avgCogs = pnl.reduce((s, r) => s + r.cogs,    0) / (pnl.length || 1)
    const margin  = avgRev > 0 ? ((avgRev - avgCogs) / avgRev) * 100 : 100
    if (margin < 10) alerts.push({
      type:  'warning',
      title: 'Margen Bruto Vulnerable',
      desc:  `Margen bruto promedio ${margin.toFixed(1)}% — por debajo del 10% mínimo`,
    })

    if (runwayMonths >= horizon) alerts.push({
      type:  'positive',
      title: 'Capital Suficiente para todo el Horizonte',
      desc:  `Runway de ${runwayMonths} meses sin déficit proyectado`,
    })

    return alerts.slice(0, 3)
  }, [pnl, horizon, runwayMonths])

  const borderColor = { danger: 'border-red-500', warning: 'border-yellow-400', positive: 'border-green-500' }
  const textColor   = { danger: 'text-red-400',   warning: 'text-yellow-400',   positive: 'text-green-400' }
  const badge       = { danger: '🔴 Crítico',      warning: '🟡 Advertencia',    positive: '🟢 Fortaleza'  }

  return (
    <div className="module-content space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#e8e8e8]">Dashboard Ejecutivo</h1>
        <p className="text-sm text-[#888]">
          {project.profile?.name} · {project.profile?.city}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Capital Semilla"
          value={fmt(initialCapital)}
          sub="Aporte inicial fundadores"
          accent
        />
        <KpiCard
          label="Punto de Equilibrio"
          value={fmt(breakevenRevenue)}
          sub="Ingresos mín. requeridos/mes"
        />
        <KpiCard
          label={`Runway (Caja)`}
          value={`${runwayMonths} mes${runwayMonths !== 1 ? 'es' : ''}`}
          sub={`De ${horizon} meses proyectados`}
          danger={runwayMonths < horizon}
        />
        <KpiCard
          label="ROI Año 2 (Proy.)"
          value={`${roiYear2}%`}
          sub="Retorno sobre capital invertido"
          danger
        />
      </div>

      {/* CFO + Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Diagnóstico CFO Virtual */}
        <div className="xl:col-span-2 w11-card p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-[#e8e8e8]">🤖 Diagnóstico CFO Virtual</h2>
          <div className="flex items-center gap-5">
            <HealthGauge score={healthScore} />
            <div className="flex-1 space-y-2.5">
              <MetricRow label="Nómina Total"    value={fmt(totalNomina)} sub="/mes" />
              <MetricRow label="OPEX Recurrente" value={fmt(totalOpex)}   sub="/mes" />
              <MetricRow label="CAPEX Total"     value={fmt(totalCapex)}  sub="inversión" />
              <MetricRow
                label="Burn Rate"
                value={fmt(totalNomina + totalOpex)}
                sub="/mes"
              />
            </div>
          </div>
          <p className="text-xs text-[#888] border-t border-white/10 pt-3 leading-relaxed">
            Score calculado con runway, capital consumido, meses con EBITDA positivo e ingresos
            activos durante {horizon} meses · escenario{' '}
            <span className="capitalize text-[#0078d4]">{scenario}</span>.
          </p>
        </div>

        {/* Cash Flow Chart */}
        <div className="xl:col-span-3 w11-card p-5">
          <h2 className="font-semibold text-[#e8e8e8] mb-4">📈 Caja Acumulada</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0078d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0078d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#888', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#888', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="caja"
                stroke="#0078d4"
                strokeWidth={2.5}
                fill="url(#cashGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0078d4', stroke: '#fff', strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas + Equipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Alert previews */}
        <div className="w11-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#e8e8e8]">⚡ Alertas — Top 3</h2>
            <span className="text-xs text-[#888]">Ver módulo completo →</span>
          </div>
          <div className="space-y-2">
            {alertPreviews.length === 0 && (
              <p className="text-sm text-[#888]">Sin alertas para el horizonte seleccionado.</p>
            )}
            {alertPreviews.map((a, i) => (
              <div
                key={i}
                className={`border-l-4 ${borderColor[a.type]} bg-white/5 rounded-r-lg px-3 py-2`}
              >
                <span className="text-xs font-medium">{badge[a.type]}</span>
                <p className={`text-sm font-semibold ${textColor[a.type]} mt-0.5`}>{a.title}</p>
                <p className="text-xs text-[#888]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team summary */}
        <div className="w11-card p-5">
          <h2 className="font-semibold text-[#e8e8e8] mb-3">👥 Resumen del Equipo</h2>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#0078d4]">{directors.length}</p>
              <p className="text-xs text-[#888]">Directores</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e8e8e8]">{employees.length}</p>
              <p className="text-xs text-[#888]">Headcount</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{fmt(totalPayroll)}</p>
              <p className="text-xs text-[#888]">Nómina/mes</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {directors.map(d => (
              <div
                key={d.id}
                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-[#0078d4] shrink-0" />
                <span className="text-sm text-[#e8e8e8] flex-1 truncate">{d.name}</span>
                <span className="text-xs text-[#888] truncate max-w-[140px]">{d.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
