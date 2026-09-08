// 07_GastosCapex/index.jsx
// Gastos Operativos & CAPEX — Apex Business OS

import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { getOpexForMonth, fmt } from '../../utils/financials'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPEX_CATS = {
  software_cloud:   { label: 'Software & Cloud',    cls: 'chip-progress' },
  marketing_ads:    { label: 'Marketing & Ads',      cls: 'chip-warning'  },
  rent:             { label: 'Alquiler',             cls: 'chip-todo'     },
  office:           { label: 'Oficina',              cls: 'chip-todo'     },
  legal_accounting: { label: 'Legal & Contabilidad', cls: 'chip-danger'   },
  utilities:        { label: 'Servicios',            cls: 'chip-completed'},
  other:            { label: 'Otro',                 cls: 'chip-todo'     },
}

const CAPEX_CATS = {
  hardware:  { label: 'Hardware',   cls: 'chip-progress' },
  software:  { label: 'Software',   cls: 'chip-todo'     },
  furniture: { label: 'Mobiliario', cls: 'chip-completed'},
  vehicle:   { label: 'Vehículo',   cls: 'chip-warning'  },
  other:     { label: 'Otro',       cls: 'chip-todo'     },
}

const FREQ = {
  monthly:  'Mensual',
  quarterly:'Trimestral',
  annual:   'Anual',
  one_time: 'Pago único',
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="w11-card p-4 flex flex-col gap-1">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub && <span className="text-xs text-[#888] mt-1">{sub}</span>}
    </div>
  )
}

// ─── OPEX Form ────────────────────────────────────────────────────────────────

const EMPTY_OPEX = {
  name: '', category: 'software_cloud', monthlyCost: '', frequency: 'monthly',
  activeFromMonth: 1, notes: '',
}

function OpexForm({ initial = EMPTY_OPEX, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_OPEX, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, monthlyCost: parseFloat(form.monthlyCost) || 0, activeFromMonth: parseInt(form.activeFromMonth) || 1 })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="kpi-label mb-1 block">Concepto</label>
          <input className="w11-input w-full" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del gasto" required />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Categoría</label>
          <select className="w11-input w-full" value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(OPEX_CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="kpi-label mb-1 block">Frecuencia</label>
          <select className="w11-input w-full" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
            {Object.entries(FREQ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="kpi-label mb-1 block">Costo / Mes ($)</label>
          <input className="w11-input w-full" type="number" min="0" step="0.01" value={form.monthlyCost} onChange={e => set('monthlyCost', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Activo Desde (Mes)</label>
          <input className="w11-input w-full" type="number" min="1" max="60" value={form.activeFromMonth} onChange={e => set('activeFromMonth', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="kpi-label mb-1 block">Notas</label>
          <input className="w11-input w-full" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Descripción opcional" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-accent">Guardar</button>
      </div>
    </form>
  )
}

// ─── CAPEX Form ───────────────────────────────────────────────────────────────

const EMPTY_CAPEX = {
  name: '', category: 'hardware', totalCost: '', monthSpent: 1, depreciationMonths: 36, notes: '',
}

function CapexForm({ initial = EMPTY_CAPEX, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_CAPEX, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      totalCost:          parseFloat(form.totalCost)          || 0,
      monthSpent:         parseInt(form.monthSpent)           || 1,
      depreciationMonths: parseInt(form.depreciationMonths)   || 36,
    })
  }

  const deprecMonthly = form.totalCost && form.depreciationMonths
    ? (parseFloat(form.totalCost) / parseInt(form.depreciationMonths)).toFixed(2)
    : '0.00'

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="kpi-label mb-1 block">Activo / Equipo</label>
          <input className="w11-input w-full" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del activo" required />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Categoría</label>
          <select className="w11-input w-full" value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(CAPEX_CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="kpi-label mb-1 block">Mes de Desembolso</label>
          <input className="w11-input w-full" type="number" min="1" max="60" value={form.monthSpent} onChange={e => set('monthSpent', e.target.value)} />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Inversión Total ($)</label>
          <input className="w11-input w-full" type="number" min="0" step="0.01" value={form.totalCost} onChange={e => set('totalCost', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Plazo Depreciación (meses)</label>
          <input className="w11-input w-full" type="number" min="1" max="240" value={form.depreciationMonths} onChange={e => set('depreciationMonths', e.target.value)} />
        </div>
      </div>
      <div className="text-xs text-[#888]">
        Depreciación mensual calculada: <span className="text-[#e8e8e8] font-semibold">${deprecMonthly}</span>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-accent">Guardar</button>
      </div>
    </form>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GastosCapex() {
  const project        = useAppStore(s => s.project)
  const addToList      = useAppStore(s => s.addToList)
  const updateInList   = useAppStore(s => s.updateInList)
  const removeFromList = useAppStore(s => s.removeFromList)

  const opexExpenses    = project.opexExpenses    || []
  const capexInvestments = project.capexInvestments || []

  const [showOpexForm,  setShowOpexForm]  = useState(false)
  const [showCapexForm, setShowCapexForm] = useState(false)
  const [editOpexId,    setEditOpexId]    = useState(null)
  const [editCapexId,   setEditCapexId]   = useState(null)

  // KPIs
  const totalOpex   = useMemo(() => opexExpenses.reduce((s, e) => s + (e.monthlyCost || 0), 0),    [opexExpenses])
  const totalCapex  = useMemo(() => capexInvestments.reduce((s, e) => s + (e.totalCost || 0), 0),  [capexInvestments])
  const fixedCostMensual = useMemo(() => getOpexForMonth(opexExpenses, 1), [opexExpenses])

  // OPEX handlers
  const handleAddOpex = data => {
    addToList('opexExpenses', { ...data, id: generateId('opex') })
    setShowOpexForm(false)
  }
  const handleEditOpex = (id, data) => {
    updateInList('opexExpenses', id, data)
    setEditOpexId(null)
  }
  const handleDeleteOpex = id => {
    if (window.confirm('¿Eliminar este gasto operativo?')) removeFromList('opexExpenses', id)
  }

  // CAPEX handlers
  const handleAddCapex = data => {
    addToList('capexInvestments', { ...data, id: generateId('capex') })
    setShowCapexForm(false)
  }
  const handleEditCapex = (id, data) => {
    updateInList('capexInvestments', id, data)
    setEditCapexId(null)
  }
  const handleDeleteCapex = id => {
    if (window.confirm('¿Eliminar esta inversión CAPEX?')) removeFromList('capexInvestments', id)
  }

  return (
    <div className="module-content space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#e8e8e8]">Gastos Operativos & CAPEX</h1>
        <p className="text-sm text-[#888]">Control de egresos recurrentes e inversiones en activos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Total OPEX Recurrente" value={fmt(totalOpex)} sub="suma base mensual" />
        <KpiCard label="CAPEX Total"            value={fmt(totalCapex)} sub="inversión en activos" />
        <KpiCard label="Costo Fijo Mes 1"       value={fmt(fixedCostMensual)} sub="OPEX activo en mes 1" />
      </div>

      {/* ── OPEX Table ── */}
      <div className="w11-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#e8e8e8]">💸 Gastos Operativos (OPEX)</h2>
          <button
            className="btn-accent text-sm"
            onClick={() => { setShowOpexForm(true); setEditOpexId(null) }}
          >
            + Añadir Gasto
          </button>
        </div>

        {showOpexForm && (
          <OpexForm onSave={handleAddOpex} onCancel={() => setShowOpexForm(false)} />
        )}

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Concepto</th>
                <th className="text-left">Categoría</th>
                <th className="text-left">Frecuencia</th>
                <th className="text-left">Activo Desde</th>
                <th className="text-right">Costo/Mes</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {opexExpenses.map(exp => (
                <React.Fragment key={exp.id}>
                  <tr>
                    <td className="font-medium text-[#e8e8e8]">{exp.name}</td>
                    <td>
                      <span className={OPEX_CATS[exp.category]?.cls ?? 'chip-todo'}>
                        {OPEX_CATS[exp.category]?.label ?? exp.category}
                      </span>
                    </td>
                    <td className="text-[#888]">{FREQ[exp.frequency] ?? exp.frequency}</td>
                    <td className="text-[#888]">Mes {exp.activeFromMonth}</td>
                    <td className="text-right font-semibold">{fmt(exp.monthlyCost)}</td>
                    <td className="text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          className="btn-subtle text-xs"
                          onClick={() => setEditOpexId(editOpexId === exp.id ? null : exp.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-subtle text-xs text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteOpex(exp.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editOpexId === exp.id && (
                    <tr key={`${exp.id}-edit`}>
                      <td colSpan={6} className="p-0">
                        <div className="p-2">
                          <OpexForm
                            initial={exp}
                            onSave={data => handleEditOpex(exp.id, data)}
                            onCancel={() => setEditOpexId(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {opexExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-[#888] py-6">
                    Sin gastos operativos registrados.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={4} className="text-right text-xs text-[#888] font-medium pt-2">
                  Total Base Mensual
                </td>
                <td className="text-right font-bold text-[#e8e8e8] pt-2">{fmt(totalOpex)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── CAPEX Table ── */}
      <div className="w11-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#e8e8e8]">🏗️ Inversiones CAPEX</h2>
          <button
            className="btn-accent text-sm"
            onClick={() => { setShowCapexForm(true); setEditCapexId(null) }}
          >
            + Añadir Activo
          </button>
        </div>

        {showCapexForm && (
          <CapexForm onSave={handleAddCapex} onCancel={() => setShowCapexForm(false)} />
        )}

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Activo / Equipo</th>
                <th className="text-left">Categoría</th>
                <th className="text-center">Mes Desembolso</th>
                <th className="text-center">Plazo Depreciación</th>
                <th className="text-right">Inversión Total</th>
                <th className="text-right">Deprec. Mensual</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {capexInvestments.map(cap => {
                const deprecMonthly = cap.depreciationMonths > 0
                  ? cap.totalCost / cap.depreciationMonths
                  : 0
                return (
                  <React.Fragment key={cap.id}>
                    <tr>
                      <td className="font-medium text-[#e8e8e8]">{cap.name}</td>
                      <td>
                        <span className={CAPEX_CATS[cap.category]?.cls ?? 'chip-todo'}>
                          {CAPEX_CATS[cap.category]?.label ?? cap.category}
                        </span>
                      </td>
                      <td className="text-center text-[#888]">Mes {cap.monthSpent}</td>
                      <td className="text-center text-[#888]">{cap.depreciationMonths} meses</td>
                      <td className="text-right font-semibold">{fmt(cap.totalCost)}</td>
                      <td className="text-right text-[#888]">{fmt(deprecMonthly, 2)}</td>
                      <td className="text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            className="btn-subtle text-xs"
                            onClick={() => setEditCapexId(editCapexId === cap.id ? null : cap.id)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-subtle text-xs text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteCapex(cap.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editCapexId === cap.id && (
                      <tr key={`${cap.id}-edit`}>
                        <td colSpan={7} className="p-0">
                          <div className="p-2">
                            <CapexForm
                              initial={cap}
                              onSave={data => handleEditCapex(cap.id, data)}
                              onCancel={() => setEditCapexId(null)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {capexInvestments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-[#888] py-6">
                    Sin inversiones CAPEX registradas.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={4} className="text-right text-xs text-[#888] font-medium pt-2">
                  Total CAPEX
                </td>
                <td className="text-right font-bold text-[#e8e8e8] pt-2">{fmt(totalCapex)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
