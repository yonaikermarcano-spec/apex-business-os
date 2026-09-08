import React, { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { generatePnLTable, calculateHealthScore } from '../../utils/financials'

export default function BottomBar() {
  const { project, horizon, scenario } = useAppStore()

  // Compute KPIs from the P&L table
  const { healthScore, runwayMonths, breakevenMonth } = useMemo(() => {
    if (!project) return { healthScore: 0, runwayMonths: 0, breakevenMonth: null }

    const rows = generatePnLTable(project, horizon, scenario)

    // Runway: consecutive months from month 1 where cash stays positive
    const runway = rows.filter(r => r.cumulativeCash > 0).length

    // Breakeven: first month where EBITDA turns positive
    const beRow = rows.find(r => r.ebitda > 0)

    // Health score (0–100)
    const score = calculateHealthScore(project, horizon, scenario)

    return {
      healthScore:    score,
      runwayMonths:   runway,
      breakevenMonth: beRow ? beRow.month : null,
    }
  }, [project, horizon, scenario])

  // Color tokens
  const scoreColor =
    healthScore >= 70 ? 'text-green-400 bg-green-900/40 border-green-700/40' :
    healthScore >= 40 ? 'text-yellow-400 bg-yellow-900/40 border-yellow-700/40' :
                        'text-red-400 bg-red-900/40 border-red-700/40'

  const barColor =
    healthScore >= 70 ? 'bg-green-500' :
    healthScore >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'

  const runwayColor =
    runwayMonths >= 6 ? 'text-green-400' :
    runwayMonths >= 3 ? 'text-yellow-400' :
                        'text-red-400'

  const horizonLabel =
    horizon >= 60 ? '5a' :
    horizon >= 36 ? '3a' :
    horizon >= 24 ? '2a' :
    horizon >= 12 ? '1a' : '6m'

  const scenarioLabel =
    scenario === 'pessimist' ? 'Pesimista' :
    scenario === 'optimist'  ? 'Optimista' : 'Base'

  const scenarioCls =
    scenario === 'pessimist' ? 'bg-red-900/40 text-red-400' :
    scenario === 'optimist'  ? 'bg-green-900/40 text-green-400' :
                               'bg-w11-accent/20 text-w11-accent'

  return (
    <footer className="h-8 bg-w11-surface border-t border-white/8 flex items-center px-3 gap-4 shrink-0 z-10">

      {/* Salud Financiera */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-w11-text/40 uppercase tracking-wider hidden sm:inline select-none">
          Salud Financiera
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${scoreColor}`}>
          {healthScore}/100
        </span>
        {/* Progress bar */}
        <div className="hidden sm:block w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      <div className="w-px h-4 bg-white/10 shrink-0" />

      {/* Runway */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-w11-text/40 hidden sm:inline select-none">Runway:</span>
        <span className={`text-[11px] font-semibold ${runwayColor}`}>
          {runwayMonths} {runwayMonths === 1 ? 'mes' : 'meses'}
        </span>
      </div>

      <div className="w-px h-4 bg-white/10 shrink-0" />

      {/* Breakeven */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-w11-text/40 hidden sm:inline select-none">Breakeven:</span>
        {breakevenMonth ? (
          <span className="text-[11px] font-semibold text-w11-accent">Mes {breakevenMonth}</span>
        ) : (
          <span className="text-[11px] font-semibold text-w11-text/35">No alcanzado</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Scenario pill */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] text-w11-text/30 uppercase tracking-wider select-none">Escenario</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${scenarioCls}`}>
          {scenarioLabel}
        </span>
      </div>

      {/* Horizon pill */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] text-w11-text/30 uppercase tracking-wider select-none">Horizonte</span>
        <span className="text-[10px] font-semibold text-w11-text/60">{horizonLabel}</span>
      </div>
    </footer>
  )
}
