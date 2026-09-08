// src/components/modules/14_CalculadoraCarreras/index.jsx
import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { calculateRidesBreakeven, fmt } from '../../utils/financials'

export default function CalculadoraCarreras() {
  const { project } = useAppStore()

  // Dynamic parameters
  const [commissionPerRide, setCommissionPerRide] = useState(3)
  const [activeDrivers, setActiveDrivers] = useState(500)
  const [monthSelected, setMonthSelected] = useState(6)
  const [includeParking, setIncludeParking] = useState(true)
  const [includeOnboarding, setIncludeOnboarding] = useState(false)
  const [includeCapex, setIncludeCapex] = useState(false)

  // Calculation
  const result = useMemo(() => {
    return calculateRidesBreakeven(project, {
      month: monthSelected,
      commissionPerRide,
      activeDrivers,
      includeParking,
      includeOnboarding,
      includeCapex,
    })
  }, [project, monthSelected, commissionPerRide, activeDrivers, includeParking, includeOnboarding, includeCapex])

  // Heatmap table: commission vs drivers
  const driverOptions = [100, 250, 500, 750, 1000]
  const commissionOptions = [1.5, 2.0, 2.5, 3.0, 4.0]

  return (
    <div className="module-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏁</span>
            <h2 className="text-xl font-bold text-w11-text">Calculadora de Carreras para Breakeven Operativo</h2>
            <span className="chip-progress text-[10px] font-semibold px-2 py-0.5 rounded">Nuevo</span>
          </div>
          <p className="text-xs text-white/40">Simulación del volumen mínimo de viajes diarios para absorber nómina, servidores y costos fijos</p>
        </div>
      </div>

      {/* Hero KPI Card */}
      <div className="w11-card rounded-2xl p-6 border border-w11-accent/40 bg-gradient-to-br from-[#0078d4]/15 via-transparent to-transparent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          <div className="space-y-1 md:border-r border-white/10 md:pr-6">
            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Meta de Despacho Diario</span>
            <p className="text-4xl lg:text-5xl font-extrabold text-w11-accent font-mono">
              {result.ridesPerDay.toLocaleString()}
            </p>
            <p className="text-xs text-white/60">carreras / día en toda la ciudad para cubrir costos</p>
          </div>

          <div className="space-y-1 md:border-r border-white/10 md:pr-6">
            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Exigencia por Conductor</span>
            <p className="text-4xl lg:text-5xl font-extrabold text-emerald-400 font-mono">
              {result.ridesPerDriverPerDay}
            </p>
            <p className="text-xs text-white/60">carreras / conductor / día (con {activeDrivers} motos activas)</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold block">Facturación Mensual Requerida</span>
            <p className="text-2xl font-bold text-white font-mono">{fmt(result.neededFromRides)}</p>
            <p className="text-[11px] text-white/40">
              Total costos: {fmt(result.totalCosts)} · Otros ingresos: {fmt(result.otherRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sliders Card */}
        <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4 text-xs">
          <h3 className="text-sm font-semibold text-w11-text flex items-center gap-2">
            <span>⚙️</span> Variables de Despacho &amp; Comisión
          </h3>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-white/60">Comisión Promedio por Carrera ($):</span>
              <span className="font-bold text-w11-text font-mono">${commissionPerRide} USD</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              step={0.5}
              value={commissionPerRide}
              onChange={e => setCommissionPerRide(Number(e.target.value))}
              className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-white/60">Conductores Activos en Caracas:</span>
              <span className="font-bold text-w11-text font-mono">{activeDrivers} motos</span>
            </div>
            <input
              type="range"
              min={50}
              max={1500}
              step={25}
              value={activeDrivers}
              onChange={e => setActiveDrivers(Number(e.target.value))}
              className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-white/60">Mes de Referencia Operativo:</span>
              <span className="font-bold text-w11-text font-mono">Mes {monthSelected}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={monthSelected}
              onChange={e => setMonthSelected(Number(e.target.value))}
              className="w-full accent-[#0078d4] h-1.5 rounded cursor-pointer bg-white/10"
            />
          </div>
        </div>

        {/* Toggles & Breakdown */}
        <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4 text-xs">
          <h3 className="text-sm font-semibold text-w11-text flex items-center gap-2">
            <span>📊</span> Absorción de Costos &amp; Otros Ingresos
          </h3>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
              <div>
                <span className="font-medium text-w11-text block">Incluir Abono de Paradas ($10/mes)</span>
                <span className="text-[10px] text-white/40">Reduce la necesidad de carreras para el breakeven</span>
              </div>
              <input
                type="checkbox"
                checked={includeParking}
                onChange={e => setIncludeParking(e.target.checked)}
                className="w-4 h-4 accent-[#0078d4] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
              <div>
                <span className="font-medium text-w11-text block">Incluir Cobro de Inscripción ($10)</span>
                <span className="text-[10px] text-white/40">Aporte puntual por nuevo motorizado</span>
              </div>
              <input
                type="checkbox"
                checked={includeOnboarding}
                onChange={e => setIncludeOnboarding(e.target.checked)}
                className="w-4 h-4 accent-[#0078d4] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors">
              <div>
                <span className="font-medium text-w11-text block">Absorber Depreciación CAPEX</span>
                <span className="text-[10px] text-white/40">Incluye renovación de computadoras y teléfonos</span>
              </div>
              <input
                type="checkbox"
                checked={includeCapex}
                onChange={e => setIncludeCapex(e.target.checked)}
                className="w-4 h-4 accent-[#0078d4] rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Sensitivity Heatmap Matrix */}
      <div className="w11-card rounded-xl p-5 border border-white/5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-w11-text">
            Matriz de Sensibilidad: Carreras requeridas por conductor al día
          </h3>
          <p className="text-xs text-white/40">
            Evalúa la viabilidad según el tamaño de la flota (columnas) y la comisión cobrada (filas). Meta sana: &lt; 5 carreras/chofer/día.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w11-table w-full text-center text-xs min-w-[500px]">
            <thead>
              <tr className="text-white/40">
                <th className="py-2 px-3 text-left">Comisión \ Flota</th>
                {driverOptions.map(d => (
                  <th key={d} className="py-2 px-3">{d} Motos</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissionOptions.map(comm => (
                <tr key={comm} className="border-t border-white/5">
                  <td className="py-2.5 px-3 text-left font-bold font-mono text-white/80">${comm.toFixed(2)}</td>
                  {driverOptions.map(drivers => {
                    const temp = calculateRidesBreakeven(project, {
                      month: monthSelected,
                      commissionPerRide: comm,
                      activeDrivers: drivers,
                      includeParking,
                      includeOnboarding,
                      includeCapex,
                    })

                    const val = temp.ridesPerDriverPerDay
                    let colorCls = 'text-emerald-400 bg-emerald-950/20'
                    if (val > 8) colorCls = 'text-red-400 bg-red-950/20'
                    else if (val > 4) colorCls = 'text-amber-400 bg-amber-950/20'

                    return (
                      <td key={drivers} className="py-2.5 px-3 font-mono font-semibold">
                        <span className={`px-2 py-1 rounded ${colorCls}`}>
                          {val}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
