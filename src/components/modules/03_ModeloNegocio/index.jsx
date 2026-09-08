// src/components/modules/03_ModeloNegocio/index.jsx
import React, { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

export default function ModeloNegocio() {
  const { project } = useAppStore()
  const blocks = project.businessModelBlocks || []
  const connections = project.businessModelConnections || []

  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Todos los Bloques' },
    { id: 'needs', label: 'Necesidades Insatisfechas' },
    { id: 'core', label: 'Núcleo Operativo & Monetización' },
    { id: 'marketing', label: 'Canales & Publicidad' },
    { id: 'coverage', label: 'Despliegue Territorial' },
  ]

  const filteredBlocks = blocks.filter(b => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'core') return b.category.startsWith('core')
    return b.category === activeCategory
  })

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h2 className="text-xl font-bold text-w11-text">Modelo de Negocio &amp; Arquitectura de Valor</h2>
          </div>
          <p className="text-xs text-white/40">Ecosistema interconectado de solución urbana, flotas, monetización y cobertura</p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === c.id ? 'bg-w11-accent text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Core Banner */}
      <div className="w11-card rounded-2xl p-6 border-2 border-slate-700 bg-gradient-to-r from-slate-900/60 to-[#202020] text-center space-y-2">
        <span className="chip-todo text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full">
          Propuesta de Valor Central
        </span>
        <h3 className="text-2xl font-black tracking-wider text-white">ORDEN PUBLICO VIAL</h3>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
          "MÁS SOLUCIÓN MENOS PROBLEMAS"
        </p>
        <p className="text-xs text-white/60 max-w-xl mx-auto pt-1">
          Organización integral del tránsito, formalización de paradas autorizadas y convivencia ciudadana en la Gran Caracas.
        </p>
      </div>

      {/* Interactive Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBlocks.map(block => {
          let borderCol = 'border-white/10'
          let badgeBg = 'chip-todo'

          if (block.color === 'blue') { borderCol = 'border-blue-500/40 bg-blue-950/15'; badgeBg = 'chip-progress' }
          else if (block.color === 'emerald') { borderCol = 'border-emerald-500/40 bg-emerald-950/15'; badgeBg = 'chip-completed' }
          else if (block.color === 'amber') { borderCol = 'border-amber-500/40 bg-amber-950/15'; badgeBg = 'chip-warning' }
          else if (block.color === 'purple') { borderCol = 'border-purple-500/40 bg-purple-950/15'; badgeBg = 'chip-progress' }
          else if (block.color === 'cyan') { borderCol = 'border-cyan-500/40 bg-cyan-950/15'; badgeBg = 'chip-completed' }
          else if (block.color === 'indigo') { borderCol = 'border-indigo-500/40 bg-indigo-950/15'; badgeBg = 'chip-progress' }

          return (
            <div
              key={block.id}
              className={`w11-card rounded-2xl p-5 border flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01] hover:border-white/30 ${borderCol}`}
            >
              <div>
                <div className="flex justify-between items-start gap-1">
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${badgeBg}`}>
                    {block.subtitle}
                  </span>
                  {block.priceEstimated && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                      ${block.priceEstimated}
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-base text-w11-text mt-2">{block.title}</h4>
                <p className="text-xs text-white/60 leading-relaxed mt-1.5">{block.description}</p>
              </div>

              {block.targetAudience && (
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                  <span>Público / Target:</span>
                  <span className="font-semibold text-white/70">{block.targetAudience}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Value Flow Connections Box */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-3">
        <h3 className="text-sm font-semibold text-w11-text flex items-center gap-2">
          <span>🔗</span> Conexiones de Valor del Ecosistema
        </h3>
        <p className="text-xs text-white/40">Relaciones estratégicas entre necesidades, infraestructura y monetización</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {connections.map(conn => {
            const fromBlock = blocks.find(b => b.id === conn.fromId)
            const toBlock = blocks.find(b => b.id === conn.toId)

            return (
              <div
                key={conn.id}
                className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="truncate">
                  <span className="font-semibold text-w11-text block truncate">{fromBlock?.title || conn.fromId}</span>
                  <span className="text-[10px] text-w11-accent font-medium">➔ {toBlock?.title || conn.toId}</span>
                </div>
                <span className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded text-white/60 shrink-0">
                  {conn.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
