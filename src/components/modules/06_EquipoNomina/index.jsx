// src/components/modules/06_EquipoNomina/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { fmt } from '../../utils/financials'

export default function EquipoNomina() {
  const { project, addToList, updateInList, removeFromList } = useAppStore()
  const employees = project.employees || []
  const departments = project.departments || []

  const [viewMode, setViewMode] = useState('organigrama') // 'organigrama' | 'cards' | 'desglose'
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'technology',
    type: 'full_time',
    baseSalaryMonthly: 500,
    activeFromMonth: 1,
    notes: '',
  })

  // KPIs
  const totalEmployees = employees.length
  const currentMonthlyPayroll = useMemo(() => {
    return employees
      .filter(e => !e.isOneTime)
      .reduce((s, e) => s + (e.baseSalaryMonthly || 0), 0)
  }, [employees])

  const totalPayroll6m = currentMonthlyPayroll * 6 // Aprox acumulado
  const avgSalary = totalEmployees > 0 ? Math.round(currentMonthlyPayroll / totalEmployees) : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    addToList('employees', {
      id: `emp-${Date.now()}`,
      ...formData,
      baseSalaryMonthly: parseFloat(formData.baseSalaryMonthly) || 0,
      activeFromMonth: parseInt(formData.activeFromMonth) || 1,
    })
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este puesto del equipo?')) {
      removeFromList('employees', id)
    }
  }

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="text-xl font-bold text-w11-text">Equipo &amp; Nómina Corporativa</h2>
          </div>
          <p className="text-xs text-white/40">Estructura organizacional, contratos, sueldos y organigrama funcional</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('organigrama')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'organigrama' ? 'bg-w11-accent text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              🌳 Organigrama
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'cards' ? 'bg-w11-accent text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              🪪 Tarjetas de Staff
            </button>
            <button
              onClick={() => setViewMode('desglose')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'desglose' ? 'bg-w11-accent text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              📊 Desglose por Dpto.
            </button>
          </div>

          <button onClick={() => setShowModal(true)} className="btn-accent text-xs flex items-center gap-1">
            <span>+</span> Añadir Puesto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Puestos Totales</p>
          <p className="kpi-value text-2xl font-bold text-w11-accent">{totalEmployees}</p>
          <p className="text-[10px] text-white/40 mt-1">Directores y operativos</p>
        </div>

        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Costo Nómina Mensual</p>
          <p className="kpi-value text-2xl font-bold text-white">{fmt(currentMonthlyPayroll)}</p>
          <p className="text-[10px] text-white/40 mt-1">Masa salarial activa</p>
        </div>

        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Proyección 6 Meses</p>
          <p className="kpi-value text-2xl font-bold text-amber-400">{fmt(totalPayroll6m)}</p>
          <p className="text-[10px] text-white/40 mt-1">Presupuesto inicial estimado</p>
        </div>

        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Promedio Salarial</p>
          <p className="kpi-value text-2xl font-bold text-emerald-400">{fmt(avgSalary)}</p>
          <p className="text-[10px] text-white/40 mt-1">Por colaborador al mes</p>
        </div>
      </div>

      {/* View 1: Organigrama Visual */}
      {viewMode === 'organigrama' && (
        <div className="w11-card rounded-2xl p-6 border border-white/5 space-y-6 overflow-x-auto">
          <div className="text-center">
            <span className="chip-todo text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
              Estructura Jerárquica &amp; Flujo Operativo
            </span>
          </div>

          {/* Level 0: Auditoría */}
          <div className="flex justify-center">
            <div className="w11-card p-4 rounded-xl border-2 border-purple-500/50 bg-purple-950/20 text-center w-72 shadow-lg">
              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">Nivel Supremo 0</span>
              <h3 className="font-bold text-sm text-white">AUDITORIA &amp; JUNTA DIRECTIVA</h3>
              <p className="text-[11px] text-white/50 mt-1">Órgano supremo de control interno y gobernanza</p>
            </div>
          </div>

          <div className="w-px h-6 bg-white/20 mx-auto" />

          {/* Level 1: 3 Direcciones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Dirección Tecnología */}
            <div className="space-y-4">
              <div className="w11-card p-4 rounded-xl border-2 border-blue-500/50 bg-blue-950/20 text-center shadow-lg">
                <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-bold">Dirección Nivel 1</span>
                <h4 className="font-bold text-sm text-white">DIRECCIÓN DE TECNOLOGÍA</h4>
                <p className="text-xs text-blue-300 font-semibold mt-1">Hector Samuel (CTO)</p>
                <p className="text-[10px] text-white/50">$1,000 / mes · Arquitectura y Apps</p>
              </div>

              {/* Sub-nodos Tecnología */}
              <div className="space-y-2 pl-4 border-l-2 border-blue-500/30 text-xs">
                {departments.filter(d => d.parentId === 'technology').map(sub => (
                  <div key={sub.id} className="bg-[#181818] p-2.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-w11-text block text-[11px]">{sub.name}</span>
                    <span className="text-[10px] text-white/40">{sub.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección Comercial */}
            <div className="space-y-4">
              <div className="w11-card p-4 rounded-xl border-2 border-amber-500/50 bg-amber-950/20 text-center shadow-lg">
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">Dirección Nivel 1</span>
                <h4 className="font-bold text-sm text-white">DIRECCIÓN COMERCIAL</h4>
                <p className="text-xs text-amber-300 font-semibold mt-1">Yonaiker Marcano (CMO)</p>
                <p className="text-[10px] text-white/50">$1,000 / mes · Alianzas y Mkt</p>
              </div>

              {/* Sub-nodos Comercial */}
              <div className="space-y-2 pl-4 border-l-2 border-amber-500/30 text-xs">
                {departments.filter(d => d.parentId === 'commercial').map(sub => (
                  <div key={sub.id} className="bg-[#181818] p-2.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-w11-text block text-[11px]">{sub.name}</span>
                    <span className="text-[10px] text-white/40">{sub.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección Flota */}
            <div className="space-y-4">
              <div className="w11-card p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-950/20 text-center shadow-lg">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Dirección Nivel 1</span>
                <h4 className="font-bold text-sm text-white">DIRECCIÓN INSTITUCIONAL</h4>
                <p className="text-xs text-emerald-300 font-semibold mt-1">Bladimir Garcia (Director Flota)</p>
                <p className="text-[10px] text-white/50">$1,000 / mes · Gremios y Paradas</p>
              </div>

              {/* Sub-nodos Flota */}
              <div className="space-y-2 pl-4 border-l-2 border-emerald-500/30 text-xs">
                {departments.filter(d => d.parentId === 'operations').map(sub => (
                  <div key={sub.id} className="bg-[#181818] p-2.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-w11-text block text-[11px]">{sub.name}</span>
                    <span className="text-[10px] text-white/40">{sub.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Tarjetas de Staff */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => {
            const isDirector = emp.type === 'director'
            const isOneTime = emp.isOneTime

            return (
              <div
                key={emp.id}
                className={`w11-card rounded-2xl p-5 border flex flex-col justify-between space-y-3 transition-all hover:border-white/20 ${
                  isDirector ? 'border-w11-accent/40 bg-gradient-to-b from-blue-950/10 to-transparent' : 'border-white/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isDirector ? 'chip-progress' : isOneTime ? 'chip-warning' : 'chip-todo'
                    }`}>
                      {emp.type}
                    </span>
                    <h4 className="font-bold text-base text-w11-text mt-2">{emp.name}</h4>
                    <p className="text-xs text-w11-accent font-medium">{emp.role}</p>
                  </div>
                  <button onClick={() => handleDelete(emp.id)} className="text-white/20 hover:text-red-400 p-1">
                    ✕
                  </button>
                </div>

                <p className="text-xs text-white/50 leading-relaxed">{emp.notes}</p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/40">Desde Mes {emp.activeFromMonth}</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ${emp.baseSalaryMonthly} <span className="text-[10px] font-normal text-white/40">/mes</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View 3: Desglose por Departamento */}
      {viewMode === 'desglose' && (
        <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-w11-text">Planilla Desglosada por Departamento</h3>

          <div className="overflow-x-auto">
            <table className="w11-table w-full text-xs min-w-[650px]">
              <thead>
                <tr className="text-white/40 uppercase tracking-wide">
                  <th className="py-2 px-3 text-left">Colaborador</th>
                  <th className="py-2 px-3 text-left">Cargo / Función</th>
                  <th className="py-2 px-3 text-left">Departamento</th>
                  <th className="py-2 px-3 text-left">Tipo Contrato</th>
                  <th className="py-2 px-3 text-center">Mes Inicio</th>
                  <th className="py-2 px-3 text-right">Sueldo Base ($)</th>
                  <th className="py-2 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-w11-text">{emp.name}</td>
                    <td className="py-3 px-3 text-white/70">{emp.role}</td>
                    <td className="py-3 px-3 text-w11-accent capitalize">{emp.department}</td>
                    <td className="py-3 px-3 text-white/50 capitalize">{emp.type}</td>
                    <td className="py-3 px-3 text-center text-white/60">Mes {emp.activeFromMonth}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      ${emp.baseSalaryMonthly}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => handleDelete(emp.id)} className="p-1 text-red-400 hover:text-red-300">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Puesto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-w11-text">Añadir Puesto al Equipo</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Nombre o Título</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Desarrollador Backend Senior"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Rol / Cargo</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Ej: Backend Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Departamento</label>
                  <select
                    className="w11-input w-full"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="technology">Tecnología</option>
                    <option value="commercial">Comercial</option>
                    <option value="operations">Operaciones &amp; Flota</option>
                    <option value="auditoria">Auditoría</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Tipo de Contrato</label>
                  <select
                    className="w11-input w-full"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="director">Director</option>
                    <option value="full_time">Tiempo Completo</option>
                    <option value="one_time">Pago Único (Servicio)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Sueldo Base ($/mes)</label>
                  <input
                    type="number"
                    min="0"
                    className="w11-input w-full font-mono"
                    value={formData.baseSalaryMonthly}
                    onChange={e => setFormData({ ...formData, baseSalaryMonthly: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Activo Desde (Mes)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="w11-input w-full font-mono"
                    value={formData.activeFromMonth}
                    onChange={e => setFormData({ ...formData, activeFromMonth: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Responsabilidades / Notas</label>
                <textarea
                  className="w11-input w-full h-16 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Funciones clave..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent text-xs">
                  Guardar Puesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
