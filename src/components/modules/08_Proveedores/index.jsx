// src/components/modules/08_Proveedores/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'

function KpiCard({ label, value, sub, accent = false }) {
  return (
    <div className={`w11-card rounded-xl p-4 flex flex-col gap-1 border ${accent ? 'border-[#0078d4]/30' : 'border-white/5'}`}>
      <p className="kpi-label text-xs">{label}</p>
      <p className={`kpi-value text-2xl font-bold ${accent ? 'text-[#0078d4]' : 'text-w11-text'}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

export default function Proveedores() {
  const { project, addToList, updateInList, removeFromList } = useAppStore()
  const vendors = project.vendors || []

  const [showModal, setShowModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    paymentTermsDays: 15,
    contact: '',
    notes: '',
  })

  // KPIs
  const totalVendors = vendors.length
  const avgDpc = useMemo(() => {
    if (!vendors.length) return 0
    const totalDays = vendors.reduce((sum, v) => sum + (v.paymentTermsDays || 0), 0)
    return Math.round(totalDays / vendors.length)
  }, [vendors])

  const liquidityAdvantage = avgDpc > 10 ? 'Favorable' : avgDpc > 0 ? 'Moderada' : 'Contado'

  const handleOpenAdd = () => {
    setEditingVendor(null)
    setFormData({
      name: '',
      category: 'Infraestructura Cloud & Maps',
      paymentTermsDays: 15,
      contact: '',
      notes: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (v) => {
    setEditingVendor(v.id)
    setFormData({
      name: v.name,
      category: v.category,
      paymentTermsDays: v.paymentTermsDays,
      contact: v.contact || '',
      notes: v.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingVendor) {
      updateInList('vendors', editingVendor, formData)
    } else {
      addToList('vendors', {
        id: `ven-${Date.now()}`,
        ...formData,
      })
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      removeFromList('vendors', id)
    }
  }

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <h2 className="text-xl font-bold text-w11-text">Proveedores &amp; Condiciones de Pago (Capital de Trabajo)</h2>
          </div>
          <p className="text-xs text-white/40">Directorio de aliados clave, condiciones de crédito comercial (DPO) e impacto en el flujo de caja</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-accent text-xs flex items-center gap-1.5">
          <span>+</span> Añadir Proveedor
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard
          label="Proveedores Homologados"
          value={`${totalVendors} aliados`}
          sub="Empresas y servicios clave"
          accent
        />
        <KpiCard
          label="DPO Promedio (Plazo de Crédito)"
          value={`${avgDpc} días`}
          sub="Días promedio que la empresa tarda en pagar"
        />
        <KpiCard
          label="Ventaja de Liquidez"
          value={liquidityAdvantage}
          sub="Permite cobrar a clientes antes de liquidar a proveedores"
        />
      </div>

      {/* Table */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-w11-text">Directorio de Proveedores y Acuerdos de Crédito</h3>
          <p className="text-xs text-white/40">Condiciones comerciales pactadas para optimizar el capital de trabajo</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-xs min-w-[700px]">
            <thead>
              <tr className="text-white/40 uppercase tracking-wide">
                <th className="py-2 px-3 text-left">Proveedor</th>
                <th className="py-2 px-3 text-left">Categoría</th>
                <th className="py-2 px-3 text-left">Plazo de Pago (DPO)</th>
                <th className="py-2 px-3 text-left">Contacto / Portal</th>
                <th className="py-2 px-3 text-left">Notas de Negociación</th>
                <th className="py-2 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => {
                let badgeCls = 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                if (v.paymentTermsDays === 0) badgeCls = 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                else if (v.paymentTermsDays >= 30) badgeCls = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'

                return (
                  <tr key={v.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-w11-text">{v.name}</td>
                    <td className="py-3 px-3 text-white/60">{v.category}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badgeCls}`}>
                        {v.paymentTermsDays === 0 ? 'Contado (0 días)' : `${v.paymentTermsDays} días crédito`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white/60 font-mono text-[11px]">{v.contact}</td>
                    <td className="py-3 px-3 text-white/40 text-[11px] max-w-xs truncate">{v.notes}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleOpenEdit(v)} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="Editar">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40">
                    No hay proveedores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Añadir/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-base font-bold text-w11-text">
              {editingVendor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-white/60 block mb-1">Nombre del Proveedor</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Google Cloud Platform"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Categoría</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Infraestructura Cloud, Seguridad, etc."
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Plazo de Pago (Días)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  className="w11-input w-full"
                  value={formData.paymentTermsDays}
                  onChange={e => setFormData({ ...formData, paymentTermsDays: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Contacto / Portal</label>
                <input
                  type="text"
                  className="w11-input w-full"
                  value={formData.contact}
                  onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="ejemplo@proveedor.com o url"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Notas de Negociación</label>
                <textarea
                  className="w11-input w-full h-20 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Condiciones pactadas, descuentos, método de cobro..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent text-xs">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
