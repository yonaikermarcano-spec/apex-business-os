// src/components/modules/13_CampañaPublicitaria/index.jsx
import React, { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import { fmt } from '../../utils/financials'

function KpiCard({ label, value, sub, accent = false }) {
  return (
    <div className={`w11-card rounded-xl p-4 flex flex-col gap-1 border ${accent ? 'border-[#0078d4]/30' : 'border-white/5'}`}>
      <p className="kpi-label text-xs">{label}</p>
      <p className={`kpi-value text-2xl font-bold ${accent ? 'text-[#0078d4]' : 'text-w11-text'}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

export default function CampañaPublicitaria() {
  const { project, addToList, updateInList, removeFromList } = useAppStore()
  const campaigns = project.marketingCampaigns || []

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    channel: 'meta_ads',
    budgetTotal: 500,
    startMonth: 4,
    durationMonths: 3,
    objective: 'conductores',
    expectedUnits: 150,
    notes: '',
  })

  // Live Simulator state
  const [simBudget, setSimBudget] = useState(600)
  const [cplEst, setCplEst] = useState(3.5) // $3.5 por conductor en Meta Ads

  // Metrics
  const totalMarketingBudget = useMemo(() => campaigns.reduce((s, c) => s + (c.budgetTotal || 0), 0), [campaigns])
  const totalExpectedConductors = useMemo(() => campaigns.filter(c => c.objective === 'conductores').reduce((s, c) => s + (c.expectedUnits || 0), 0), [campaigns])
  const avgCac = totalExpectedConductors > 0 ? (totalMarketingBudget / totalExpectedConductors).toFixed(1) : '0'

  // Chart Data
  const chartData = useMemo(() => {
    return campaigns.map(c => {
      const ltvEstimate = (c.expectedUnits || 0) * 10 // $10 inscripción
      return {
        name: c.name.length > 20 ? c.name.substring(0, 18) + '...' : c.name,
        'Inversión': c.budgetTotal,
        'Retorno Estimado': ltvEstimate,
      }
    })
  }, [campaigns])

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name: '',
      channel: 'meta_ads',
      budgetTotal: 500,
      startMonth: 4,
      durationMonths: 3,
      objective: 'conductores',
      expectedUnits: 150,
      notes: '',
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      budgetTotal: parseFloat(formData.budgetTotal) || 0,
      startMonth: parseInt(formData.startMonth) || 1,
      durationMonths: parseInt(formData.durationMonths) || 1,
      expectedUnits: parseInt(formData.expectedUnits) || 0,
    }

    if (editingId) {
      updateInList('marketingCampaigns', editingId, payload)
    } else {
      addToList('marketingCampaigns', {
        id: `camp-${Date.now()}`,
        ...payload,
      })
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta campaña?')) {
      removeFromList('marketingCampaigns', id)
    }
  }

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <h2 className="text-xl font-bold text-w11-text">Presupuesto &amp; ROI de Campañas Publicitarias</h2>
            <span className="chip-progress text-[10px] font-semibold px-2 py-0.5 rounded">Nuevo</span>
          </div>
          <p className="text-xs text-white/40">Planificador de adquisición, medición de CAC, retorno publicitario (ROAS) e integración con OPEX</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-accent text-xs flex items-center gap-1.5">
          <span>+</span> Añadir Campaña
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Inversión Total Marketing"
          value={fmt(totalMarketingBudget)}
          sub="Presupuesto asignado a campañas"
          accent
        />
        <KpiCard
          label="CAC Promedio Estimado"
          value={`$${avgCac}`}
          sub="Costo por conductor afiliado"
        />
        <KpiCard
          label="Conductores Esperados"
          value={totalExpectedConductors}
          sub="Objetivo de captación activa"
        />
        <KpiCard
          label="Payback Estimado"
          value="< 1 Mes"
          sub="Recuperación con cuota inicial ($10)"
        />
      </div>

      {/* Interactive Simulator Section */}
      <div className="w11-card rounded-2xl p-5 border border-w11-accent/20 bg-gradient-to-r from-blue-950/20 to-transparent space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🧮</span>
          <h3 className="text-sm font-bold text-w11-text">Simulador de Adquisición Digital en Tiempo Real</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-white/60">
                <span>Inversión en Pauta (Meta Ads / Instagram):</span>
                <span className="font-bold text-w11-text font-mono">${simBudget} USD</span>
              </div>
              <input
                type="range"
                min={100}
                max={3000}
                step={50}
                value={simBudget}
                onChange={e => setSimBudget(Number(e.target.value))}
                className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-white/60">
                <span>Costo por Lead Validado (CPL en Caracas):</span>
                <span className="font-bold text-w11-text font-mono">${cplEst} USD</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={8}
                step={0.5}
                value={cplEst}
                onChange={e => setCplEst(Number(e.target.value))}
                className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
              />
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-xl border border-white/10 flex items-center justify-around text-center">
            <div>
              <p className="text-[11px] text-white/40">Conductores Captados:</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                ~{Math.round(simBudget / cplEst)}
              </p>
              <p className="text-[10px] text-white/40 mt-1">Con verificación Didit</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-[11px] text-white/40">Ingreso por Afiliación:</p>
              <p className="text-2xl font-bold text-w11-accent font-mono">
                ${(Math.round(simBudget / cplEst) * 10).toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-400 mt-1">ROI Inmediato: +{Math.round(((Math.round(simBudget / cplEst) * 10 - simBudget) / simBudget) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table & Bar Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Table */}
        <div className="xl:col-span-3 w11-card rounded-xl p-5 border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-w11-text">Campañas Planificadas &amp; Estrategia de Medios</h3>

          <div className="overflow-x-auto">
            <table className="w11-table w-full text-xs min-w-[550px]">
              <thead>
                <tr className="text-white/40 uppercase tracking-wide">
                  <th className="py-2 px-2 text-left">Campaña</th>
                  <th className="py-2 px-2 text-left">Canal</th>
                  <th className="py-2 px-2 text-right">Presupuesto</th>
                  <th className="py-2 px-2 text-center">Mes Inicio</th>
                  <th className="py-2 px-2 text-right">Objetivo</th>
                  <th className="py-2 px-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-2 font-semibold text-w11-text">{c.name}</td>
                    <td className="py-2.5 px-2">
                      <span className="chip-progress text-[10px] px-2 py-0.5 rounded">
                        {c.channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-white/80">{fmt(c.budgetTotal)}</td>
                    <td className="py-2.5 px-2 text-center text-white/60">Mes {c.startMonth} ({c.durationMonths}m)</td>
                    <td className="py-2.5 px-2 text-right font-mono text-emerald-400">
                      {c.expectedUnits} {c.objective === 'conductores' ? 'motos' : 'pts'}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button onClick={() => handleDelete(c.id)} className="p-1 text-red-400 hover:text-red-300">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-white/40">Sin campañas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="xl:col-span-2 w11-card rounded-xl p-5 border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-w11-text">Inversión vs. Retorno por Campaña</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#202020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: '#aaa' }} />
              <Bar dataKey="Inversión" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Retorno Estimado" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal Añadir Campaña */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-w11-text">Nueva Campaña Publicitaria</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Nombre de la Campaña</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Activación Chupetas en Chacao"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Canal de Difusión</label>
                  <select
                    className="w11-input w-full"
                    value={formData.channel}
                    onChange={e => setFormData({ ...formData, channel: e.target.value })}
                  >
                    <option value="meta_ads">Meta Ads (FB/IG)</option>
                    <option value="ooh">Vía Pública (OOH / Chupetas)</option>
                    <option value="field_marketing">Promotoras en Calle</option>
                    <option value="whatsapp">WhatsApp Directo</option>
                    <option value="radio_tv">Radio / Medios</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Presupuesto ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="w11-input w-full font-mono"
                    value={formData.budgetTotal}
                    onChange={e => setFormData({ ...formData, budgetTotal: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Mes de Inicio</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="w11-input w-full font-mono"
                    value={formData.startMonth}
                    onChange={e => setFormData({ ...formData, startMonth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Duración (Meses)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="w11-input w-full font-mono"
                    value={formData.durationMonths}
                    onChange={e => setFormData({ ...formData, durationMonths: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Objetivo</label>
                  <select
                    className="w11-input w-full"
                    value={formData.objective}
                    onChange={e => setFormData({ ...formData, objective: e.target.value })}
                  >
                    <option value="conductores">Captación Choferes</option>
                    <option value="carreras">Volumen Carreras</option>
                    <option value="awareness">Branding / Presencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Unidades Esperadas</label>
                  <input
                    type="number"
                    min="0"
                    className="w11-input w-full font-mono"
                    value={formData.expectedUnits}
                    onChange={e => setFormData({ ...formData, expectedUnits: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Notas y Estrategia</label>
                <textarea
                  className="w11-input w-full h-16 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles sobre copies, segmentación..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent text-xs">
                  Guardar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
