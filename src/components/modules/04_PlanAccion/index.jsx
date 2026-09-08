// src/components/modules/04_PlanAccion/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { fmt } from '../../utils/financials'

export default function PlanAccion() {
  const { project, addToList, updateInList, removeFromList } = useAppStore()
  const items = project.actionPlanItems || []

  const [viewMode, setViewMode] = useState('fases') // 'fases' | 'kanban'
  const [filterDept, setFilterDept] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    phase: 'T1',
    status: 'todo',
    assignedTo: 'Yonaiker Marcano',
    department: 'commercial',
    targetMonth: 1,
    budgetAllocated: 1000,
    deliverable: '',
  })

  // KPIs
  const totalHitos = items.length
  const completedHitos = items.filter(i => i.status === 'completed').length
  const inProgressHitos = items.filter(i => i.status === 'in_progress').length
  const totalBudget = useMemo(() => items.reduce((s, i) => s + (i.budgetAllocated || 0), 0), [items])
  const progressPct = totalHitos > 0 ? Math.round((completedHitos / totalHitos) * 100) : 0

  // Filter
  const filteredItems = useMemo(() => {
    if (filterDept === 'all') return items
    return items.filter(i => i.department === filterDept)
  }, [items, filterDept])

  const handleStatusChange = (id, newStatus) => {
    updateInList('actionPlanItems', id, { status: newStatus })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addToList('actionPlanItems', {
      id: `ap-${Date.now()}`,
      ...formData,
      budgetAllocated: parseFloat(formData.budgetAllocated) || 0,
      targetMonth: parseInt(formData.targetMonth) || 1,
    })
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este hito?')) {
      removeFromList('actionPlanItems', id)
    }
  }

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <h2 className="text-xl font-bold text-w11-text">Plan de Acción &amp; Roadmap Estratégico</h2>
          </div>
          <p className="text-xs text-white/40">Cronograma de ejecución, hitos de entrega y asignación de presupuesto por fases</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('fases')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'fases' ? 'bg-w11-accent text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              📅 Por Fases
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'kanban' ? 'bg-w11-accent text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              📋 Tablero Kanban
            </button>
          </div>

          <button onClick={() => setShowModal(true)} className="btn-accent text-xs flex items-center gap-1">
            <span>+</span> Nuevo Hito
          </button>
        </div>
      </div>

      {/* KPIs & Progress Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Avance Global</p>
          <div className="flex items-baseline gap-2">
            <p className="kpi-value text-2xl font-bold text-w11-accent">{progressPct}%</p>
            <span className="text-xs text-white/40">({completedHitos}/{totalHitos} hitos)</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-w11-accent rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">En Ejecución</p>
          <p className="kpi-value text-2xl font-bold text-amber-400">{inProgressHitos}</p>
          <p className="text-[10px] text-white/40 mt-1">Hitos activos ahora</p>
        </div>

        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Presupuesto Asignado</p>
          <p className="kpi-value text-2xl font-bold text-white">{fmt(totalBudget)}</p>
          <p className="text-[10px] text-white/40 mt-1">Costos asociados a hitos</p>
        </div>

        <div className="w11-card rounded-xl p-4 flex flex-col gap-1 border border-white/5">
          <p className="kpi-label text-xs">Hito Crítico Siguiente</p>
          <p className="text-sm font-bold text-emerald-400 truncate mt-1">Lanzamiento Carreras</p>
          <p className="text-[10px] text-white/40">Mes 7 · Breakeven</p>
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/40">Filtrar por Dirección:</span>
        {[
          { id: 'all', label: 'Todas' },
          { id: 'technology', label: 'Tecnología' },
          { id: 'commercial', label: 'Comercial' },
          { id: 'operations', label: 'Flota & Operaciones' },
        ].map(d => (
          <button
            key={d.id}
            onClick={() => setFilterDept(d.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterDept === d.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* View: Por Fases */}
      {viewMode === 'fases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {['T1', 'T2', 'T3', 'T4'].map(phase => {
            const phaseItems = filteredItems.filter(i => i.phase === phase)
            const phaseTitles = {
              T1: 'Fase 1: Setup TI & Legal (M1-M3)',
              T2: 'Fase 2: 500 Motos & Salida (M4-M6)',
              T3: 'Fase 3: Carreras & Breakeven (M7-M9)',
              T4: 'Fase 4: Expansión Nacional (M10-M12)',
            }

            return (
              <div key={phase} className="w11-card rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="font-bold text-xs text-w11-text">{phaseTitles[phase]}</h3>
                  <span className="text-[10px] text-white/40 font-mono font-bold">{phaseItems.length}</span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {phaseItems.map(item => {
                    const isCompleted = item.status === 'completed'
                    const isInProgress = item.status === 'in_progress'

                    return (
                      <div
                        key={item.id}
                        className="bg-[#181818] p-3 rounded-xl border border-white/5 space-y-2 text-xs hover:border-white/20 transition-all"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-semibold text-w11-text text-[11px] leading-snug">{item.title}</h4>
                          <button onClick={() => handleDelete(item.id)} className="text-white/20 hover:text-red-400 p-0.5">
                            ✕
                          </button>
                        </div>

                        <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">{item.description}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                          <span className="text-white/40">👤 {item.assignedTo.split(' ')[0]}</span>
                          <span className="font-mono text-white/60">{fmt(item.budgetAllocated)}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item.id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/80"
                          >
                            <option value="todo">Por Hacer</option>
                            <option value="in_progress">En Proceso</option>
                            <option value="completed">Completado</option>
                          </select>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            isCompleted ? 'chip-completed' : isInProgress ? 'chip-progress' : 'chip-todo'
                          }`}>
                            Mes {item.targetMonth}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View: Kanban */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'todo', title: 'Por Hacer', cls: 'chip-todo' },
            { id: 'in_progress', title: 'En Proceso', cls: 'chip-progress' },
            { id: 'completed', title: 'Completado', cls: 'chip-completed' },
          ].map(col => {
            const colItems = filteredItems.filter(i => i.status === col.id)

            return (
              <div key={col.id} className="w11-card rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${col.cls}`}>{col.title}</span>
                    <span className="text-xs text-white/40 font-mono">({colItems.length})</span>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-[#181818] p-3 rounded-xl border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-mono text-white/40 uppercase">[{item.phase}] Mes {item.targetMonth}</span>
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/80"
                        >
                          <option value="todo">Por Hacer</option>
                          <option value="in_progress">En Proceso</option>
                          <option value="completed">Completado</option>
                        </select>
                      </div>

                      <h4 className="font-semibold text-w11-text text-xs leading-snug">{item.title}</h4>
                      <p className="text-white/50 text-[10px] leading-relaxed">{item.description}</p>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                        <span>👤 {item.assignedTo}</span>
                        <span className="font-mono font-bold text-white/70">{fmt(item.budgetAllocated)}</span>
                      </div>
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <p className="text-center text-white/30 text-xs py-8">Sin hitos en esta columna</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Nuevo Hito */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w11-card bg-[#202020] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-w11-text">Nuevo Hito de Roadmap</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Título del Hito</label>
                <input
                  type="text"
                  required
                  className="w11-input w-full"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Lanzamiento de la versión 1.0"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Descripción</label>
                <textarea
                  className="w11-input w-full h-16 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre entregables y objetivos..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Fase</label>
                  <select
                    className="w11-input w-full"
                    value={formData.phase}
                    onChange={e => setFormData({ ...formData, phase: e.target.value })}
                  >
                    <option value="T1">T1 (Meses 1-3)</option>
                    <option value="T2">T2 (Meses 4-6)</option>
                    <option value="T3">T3 (Meses 7-9)</option>
                    <option value="T4">T4 (Meses 10-12)</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Mes Objetivo</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="w11-input w-full font-mono"
                    value={formData.targetMonth}
                    onChange={e => setFormData({ ...formData, targetMonth: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/60 block mb-1">Responsable</label>
                  <input
                    type="text"
                    className="w11-input w-full"
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Presupuesto ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="w11-input w-full font-mono"
                    value={formData.budgetAllocated}
                    onChange={e => setFormData({ ...formData, budgetAllocated: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent text-xs">
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
