// src/components/modules/05_CostoConsumo/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { fmt } from '../../utils/financials'

export default function CostoConsumo() {
  const { project, addToList, updateInList, removeFromList } = useAppStore()
  const directCosts = project.directCosts || []
  const revenueStreams = project.revenueStreams || []

  // Pricing calculator state
  const [selectedCostIndex, setSelectedCostIndex] = useState(0)
  const [targetGrossMargin, setTargetGrossMargin] = useState(70) // 70%
  const [gatewayFeePct, setGatewayFeePct] = useState(3) // 3%
  const [customCostUnit, setCustomCostUnit] = useState(0.20)

  // Modal for new direct cost
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'api_cloud',
    costPerUnit: 0.05,
    unitName: 'transacción',
    notes: '',
  })

  // Selected cost calculation
  const activeUnitCost = directCosts[selectedCostIndex]?.costPerUnit ?? customCostUnit

  // Suggested price formula: Cost / (1 - Margin% - Fee%)
  const suggestedPrice = useMemo(() => {
    const denominator = 1 - (targetGrossMargin / 100) - (gatewayFeePct / 100)
    if (denominator <= 0) return 0
    return +(activeUnitCost / denominator).toFixed(2)
  }, [activeUnitCost, targetGrossMargin, gatewayFeePct])

  const handleSubmit = (e) => {
    e.preventDefault()
    addToList('directCosts', {
      id: `cogs-${Date.now()}`,
      ...formData,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
    })
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este costo directo?')) {
      removeFromList('directCosts', id)
    }
  }

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h2 className="text-xl font-bold text-w11-text">Costo por Consumo (COGS) &amp; Pricing Óptimo</h2>
          </div>
          <p className="text-xs text-white/40">Estructura de costos unitarios de tecnología, APIs en la nube y simulador de fijación de precios</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-accent text-xs flex items-center gap-1.5">
          <span>+</span> Añadir Insumo / API
        </button>
      </div>

      {/* Pricing Calculator Hero Card */}
      <div className="w11-card rounded-2xl p-6 border border-w11-accent/30 bg-gradient-to-r from-blue-950/20 via-[#202020] to-transparent space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧮</span>
            <h3 className="text-sm font-bold text-w11-text">Calculadora de Precio Sugerido (Unit Economics)</h3>
          </div>
          <span className="chip-completed text-[10px] px-2 py-0.5 rounded font-semibold">Tiempo Real</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            <div>
              <label className="text-white/60 block mb-1">Insumo / API de Referencia:</label>
              <select
                value={selectedCostIndex}
                onChange={e => setSelectedCostIndex(Number(e.target.value))}
                className="w11-input w-full"
              >
                {directCosts.map((c, i) => (
                  <option key={c.id} value={i}>
                    {c.name} (${c.costPerUnit} / {c.unitName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/60">Margen Bruto Objetivo:</span>
                <span className="font-bold text-emerald-400 font-mono">{targetGrossMargin}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={targetGrossMargin}
                onChange={e => setTargetGrossMargin(Number(e.target.value))}
                className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/60">Comisión Pasarela de Pagos / Recargas:</span>
                <span className="font-bold text-amber-400 font-mono">{gatewayFeePct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={1}
                value={gatewayFeePct}
                onChange={e => setGatewayFeePct(Number(e.target.value))}
                className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
              />
            </div>
          </div>

          {/* Result box */}
          <div className="bg-[#181818] p-5 rounded-2xl border border-white/10 text-center space-y-2">
            <span className="text-xs text-white/40 uppercase tracking-wide font-semibold block">Precio Mínimo Sugerido</span>
            <p className="text-4xl font-extrabold text-emerald-400 font-mono">${suggestedPrice} USD</p>
            <p className="text-[11px] text-white/50">
              Costo directo: ${activeUnitCost} · Ganancia bruta: ${(suggestedPrice * (targetGrossMargin / 100)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* COGS Catalog Table */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-w11-text">Catálogo de Costos Unitarios (APIs &amp; Operaciones)</h3>

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-xs min-w-[650px]">
            <thead>
              <tr className="text-white/40 uppercase tracking-wide">
                <th className="py-2 px-3 text-left">Concepto</th>
                <th className="py-2 px-3 text-left">Categoría</th>
                <th className="py-2 px-3 text-right">Costo Unitario</th>
                <th className="py-2 px-3 text-left">Unidad de Medida</th>
                <th className="py-2 px-3 text-left">Detalles y Uso</th>
                <th className="py-2 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {directCosts.map(item => (
                <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-semibold text-w11-text">{item.name}</td>
                  <td className="py-3 px-3">
                    <span className="chip-progress text-[10px] px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                    ${item.costPerUnit.toFixed(3)}
                  </td>
                  <td className="py-3 px-3 text-white/70">por {item.unitName}</td>
                  <td className="py-3 px-3 text-white/40 text-[11px] max-w-xs truncate">{item.notes}</td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => handleDelete(item.id)} className="p-1 text-red-400 hover:text-red-300">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Revenue Streams pricing comparison */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-w11-text">Tarifas Actuales de Venta en VELOX Caracas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {revenueStreams.map(stream => (
            <div key={stream.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 uppercase block font-semibold">{stream.category}</span>
              <p className="font-bold text-sm text-w11-text">{stream.name}</p>
              <p className="text-2xl font-black text-w11-accent font-mono pt-1">${stream.pricePerUnit} USD</p>
              <p className="text-[10px] text-white/50 pt-1">{stream.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nuevo Insumo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-w11-text">Añadir Costo Directo</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Nombre del Insumo / Servicio</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Twilio SMS Verificación"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Costo por Unidad ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    className="w11-input w-full font-mono"
                    value={formData.costPerUnit}
                    onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    className="w11-input w-full"
                    value={formData.unitName}
                    onChange={e => setFormData({ ...formData, unitName: e.target.value })}
                    placeholder="carrera, consulta..."
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Notas y Descripción</label>
                <textarea
                  className="w11-input w-full h-16 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Proveedor, cálculo de costo..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent text-xs">
                  Guardar Costo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
