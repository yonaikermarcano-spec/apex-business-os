// src/components/modules/11_PlanVsReal/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { generatePnLTable, fmt, monthName } from '../../utils/financials'

export default function PlanVsReal() {
  const { project, horizon, scenario, updateInList, addToList } = useAppStore()
  const actualRecords = project.actualRecords || []

  // Default to Month 1 (Enero)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)

  // Calculate planned table
  const pnlRows = useMemo(() => generatePnLTable(project, horizon, scenario), [project, horizon, scenario])
  const plannedMonth = pnlRows.find(r => r.month === selectedMonth) || {
    revenue: 0,
    cogs: 0,
    payroll: 0,
    opex: 0,
    capex: 0,
    netFlow: 0,
  }

  // Find actual record for selected month
  const actualRecord = actualRecords.find(r => r.month === selectedMonth) || {
    realRevenue: 0,
    realCogs: 0,
    realPayroll: 0,
    realOpex: 0,
    realCapex: 0,
    notes: '',
  }

  // Form state
  const [formData, setFormData] = useState({ ...actualRecord })

  const handleOpenEdit = () => {
    setFormData({ ...actualRecord })
    setShowEditModal(true)
  }

  const handleSaveActual = (e) => {
    e.preventDefault()
    const existing = actualRecords.find(r => r.month === selectedMonth)
    const recordPayload = {
      month: selectedMonth,
      year: 2026,
      monthName: monthName(selectedMonth).split(' ')[0],
      realRevenue: parseFloat(formData.realRevenue) || 0,
      realCogs: parseFloat(formData.realCogs) || 0,
      realPayroll: parseFloat(formData.realPayroll) || 0,
      realOpex: parseFloat(formData.realOpex) || 0,
      realCapex: parseFloat(formData.realCapex) || 0,
      notes: formData.notes || '',
    }

    if (existing) {
      updateInList('actualRecords', existing.month, recordPayload)
    } else {
      addToList('actualRecords', recordPayload)
    }
    setShowEditModal(false)
  }

  // Build comparison rows
  const comparisonLines = useMemo(() => {
    const lines = [
      {
        name: 'Ingresos Totales',
        planned: plannedMonth.revenue,
        actual: actualRecord.realRevenue,
        isIncome: true,
      },
      {
        name: 'Costo Directo (COGS)',
        planned: plannedMonth.cogs,
        actual: actualRecord.realCogs,
        isIncome: false,
      },
      {
        name: 'Nómina & Cargas',
        planned: plannedMonth.payroll,
        actual: actualRecord.realPayroll,
        isIncome: false,
      },
      {
        name: 'Gastos Operativos (OPEX)',
        planned: plannedMonth.opex,
        actual: actualRecord.realOpex,
        isIncome: false,
      },
      {
        name: 'Inversión Activos (CAPEX)',
        planned: plannedMonth.capex,
        actual: actualRecord.realCapex,
        isIncome: false,
      },
      {
        name: 'Resultado Neto (P&L)',
        planned: plannedMonth.netFlow,
        actual: (actualRecord.realRevenue - actualRecord.realCogs - actualRecord.realPayroll - actualRecord.realOpex - actualRecord.realCapex),
        isIncome: true,
        isTotal: true,
      },
    ]

    return lines.map(line => {
      const diff = line.actual - line.planned
      let pct = 0
      if (line.planned !== 0) {
        pct = (diff / Math.abs(line.planned)) * 100
      } else if (line.actual !== 0) {
        pct = line.actual > 0 ? 100 : -100
      }

      // Status determination
      let status = 'En Meta'
      let statusColor = 'chip-completed'

      if (line.isIncome) {
        if (pct < -20) { status = 'Alerta'; statusColor = 'chip-danger' }
        else if (pct < -5) { status = 'Desvío'; statusColor = 'chip-warning' }
      } else {
        // Expenses: higher actual is worse
        if (pct > 20) { status = 'Desvío'; statusColor = 'chip-danger' }
        else if (pct > 5) { status = 'Alerta'; statusColor = 'chip-warning' }
      }

      return {
        ...line,
        diff,
        pct: pct.toFixed(1),
        status,
        statusColor,
      }
    })
  }, [plannedMonth, actualRecord])

  const monthsList = Array.from({ length: horizon }, (_, i) => i + 1)

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="text-xl font-bold text-w11-text">Control de Gestión: Plan vs. Real (Variance Analysis)</h2>
          </div>
          <p className="text-xs text-white/40">Compara tus presupuestos iniciales con la ejecución real del negocio en marcha para detectar desvíos</p>
        </div>
        <button onClick={handleOpenEdit} className="btn-accent text-xs flex items-center gap-1.5">
          <span>✏️</span> Registrar Datos Reales
        </button>
      </div>

      {/* Month Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {monthsList.map(m => {
          const hasData = actualRecords.some(r => r.month === m && (r.realPayroll > 0 || r.realOpex > 0 || r.realRevenue > 0))
          const isSelected = selectedMonth === m
          const name = monthName(m).split(' ')[0]

          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                isSelected
                  ? 'bg-w11-accent text-white border-w11-accent shadow-md'
                  : 'bg-w11-card text-white/70 border-white/5 hover:bg-white/5'
              }`}
            >
              <span>{name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : hasData ? 'text-blue-400' : 'text-white/30'
              }`}>
                {hasData ? '✓ Datos reales' : 'Solo plan'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Comparison Table Card */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-w11-text">
              Comparativa de Ejecución: {monthName(selectedMonth)} (Mes {selectedMonth})
            </h3>
            <p className="text-xs text-white/40">Desviación cuantitativa y evaluación de desempeño con semáforos de control</p>
          </div>
          <button onClick={handleOpenEdit} className="text-xs text-w11-accent hover:underline flex items-center gap-1">
            <span>✏️</span> Editar Cifras Reales
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-xs min-w-[650px]">
            <thead>
              <tr className="text-white/40 uppercase tracking-wide">
                <th className="py-2 px-3 text-left">Línea Financiera</th>
                <th className="py-2 px-3 text-right">Planificado ($)</th>
                <th className="py-2 px-3 text-right">Real Ejecutado ($)</th>
                <th className="py-2 px-3 text-right">Variación ($)</th>
                <th className="py-2 px-3 text-right">Variación (%)</th>
                <th className="py-2 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {comparisonLines.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors ${
                    row.isTotal ? 'bg-white/[0.03] font-bold' : ''
                  }`}
                >
                  <td className={`py-3 px-3 ${row.isTotal ? 'text-w11-text' : 'text-white/80'}`}>{row.name}</td>
                  <td className="py-3 px-3 text-right font-mono text-white/70">{fmt(row.planned)}</td>
                  <td className="py-3 px-3 text-right font-mono text-w11-text font-semibold">{fmt(row.actual)}</td>
                  <td className={`py-3 px-3 text-right font-mono font-medium ${
                    row.diff > 0 ? (row.isIncome ? 'text-emerald-400' : 'text-amber-400') : row.diff < 0 ? (row.isIncome ? 'text-red-400' : 'text-emerald-400') : 'text-white/50'
                  }`}>
                    {row.diff > 0 ? `+${fmt(row.diff)}` : row.diff < 0 ? `-${fmt(Math.abs(row.diff))}` : '$0'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-white/60">
                    {row.pct > 0 ? `+${row.pct}%` : `${row.pct}%`}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`${row.statusColor} px-2 py-0.5 rounded text-[11px] font-medium`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Month notes */}
        <div className="pt-3 border-t border-white/5 text-xs">
          <span className="text-white/40 block mb-1 font-semibold">Notas de la Ejecución Real:</span>
          <p className="text-white/70 italic bg-white/[0.02] p-3 rounded-lg border border-white/5">
            {actualRecord.notes || 'No hay notas registradas para este mes de ejecución.'}
          </p>
        </div>
      </div>

      {/* Modal Editar Cifras Reales */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-w11-text">
              Registrar Datos Reales — {monthName(selectedMonth)}
            </h3>
            <form onSubmit={handleSaveActual} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Ingresos Reales ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w11-input w-full font-mono"
                  value={formData.realRevenue}
                  onChange={e => setFormData({ ...formData, realRevenue: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Costo Directo / COGS Real ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w11-input w-full font-mono"
                  value={formData.realCogs}
                  onChange={e => setFormData({ ...formData, realCogs: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Nómina Real Ejecutada ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w11-input w-full font-mono"
                  value={formData.realPayroll}
                  onChange={e => setFormData({ ...formData, realPayroll: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Gastos Operativos (OPEX) Reales ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w11-input w-full font-mono"
                  value={formData.realOpex}
                  onChange={e => setFormData({ ...formData, realOpex: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Inversión Activos (CAPEX) Real ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w11-input w-full font-mono"
                  value={formData.realCapex}
                  onChange={e => setFormData({ ...formData, realCapex: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Notas / Justificación de Desvíos</label>
                <textarea
                  className="w11-input w-full h-20 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles sobre gastos extraordinarios, retrasos o hitos alcanzados..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent text-xs">
                  Guardar Cifras
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
