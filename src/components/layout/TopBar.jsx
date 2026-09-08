import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppStore } from '../../store/useAppStore'
import { fmt } from '../../utils/financials'

// ── Sync Indicator ────────────────────────────────────────────────────────────
function SyncIndicator({ status }) {
  const map = {
    idle:    { dot: '🟢', label: 'Sincronizado',  cls: 'text-green-400' },
    synced:  { dot: '🟢', label: 'Sincronizado',  cls: 'text-green-400' },
    saving:  { dot: '🟡', label: 'Guardando...',  cls: 'text-yellow-400' },
    offline: { dot: '🔴', label: 'Offline',        cls: 'text-red-400' },
    error:   { dot: '🔴', label: 'Error sync',     cls: 'text-red-400' },
  }
  const { dot, label, cls } = map[status] || map.idle
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium ${cls} whitespace-nowrap`}>
      <span>{dot}</span>
      <span className="hidden lg:inline">{label}</span>
    </span>
  )
}

// ── Horizon Button ─────────────────────────────────────────────────────────────
function HorizonBtn({ label, months, current, onClick }) {
  const active = current === months
  return (
    <button
      onClick={() => onClick(months)}
      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all
        ${active
          ? 'bg-w11-accent text-white shadow-sm'
          : 'text-w11-text/60 hover:bg-white/8 hover:text-w11-text'}`}
    >
      {label}
    </button>
  )
}

// ── Scenario Button ────────────────────────────────────────────────────────────
function ScenarioBtn({ label, value, current, onClick }) {
  const active = current === value
  const colors = {
    pessimist: active ? 'bg-red-700/80 text-red-100'   : 'text-red-400/70 hover:bg-red-900/30',
    base:      active ? 'bg-w11-accent text-white'       : 'text-w11-text/60 hover:bg-white/8 hover:text-w11-text',
    optimist:  active ? 'bg-green-700/80 text-green-100' : 'text-green-400/70 hover:bg-green-900/30',
  }
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${colors[value]}`}
    >
      {label}
    </button>
  )
}

// ── Main TopBar ────────────────────────────────────────────────────────────────
export default function TopBar() {
  const {
    project, syncStatus,
    horizon, scenario,
    setHorizon, setScenario,
    toggleSofia, toggleSettings, toggleSnap,
    importProject, restoreDefault, forceSyncToGitHub,
  } = useAppStore()

  const fileInputRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const projectName    = project?.profile?.companyName ?? 'Movilidad Caracas'
  const initialCapital = project?.profile?.initialCapital ?? 51000

  // ── Export JSON ──────────────────────────────────────────────────────────────
  function handleExportJSON() {
    try {
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('JSON exportado correctamente')
    } catch {
      toast.error('Error al exportar JSON')
    }
  }

  // ── Export Excel / CSV ────────────────────────────────────────────────────────
  async function handleExportExcel() {
    try {
      const XLSX = await import('xlsx').catch(() => null)
      if (!XLSX) {
        // Fallback: CSV
        const rows = [
          ['Nombre', 'Descripción', 'Precio/Unidad', 'Unidades/Mes'],
          ...(project.revenueStreams || []).map(s =>
            [s.name, s.description || '', s.pricePerUnit, s.initialUnits]),
        ]
        const csv  = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `${projectName.replace(/\s+/g, '_')}_ingresos.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CSV exportado correctamente')
        return
      }
      const wb = XLSX.utils.book_new()

      // Sheet 1: Revenue Streams
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Stream', 'Descripción', 'Precio/Unidad', 'Unidades/Mes', 'Activo desde mes'],
        ...(project.revenueStreams || []).map(s =>
          [s.name, s.description || '', s.pricePerUnit, s.initialUnits, s.activeFromMonth]),
      ]), 'Ingresos')

      // Sheet 2: Employees
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Nombre', 'Cargo', 'Salario Mensual', 'Activo desde mes'],
        ...(project.employees || []).map(e =>
          [e.name, e.role, e.baseSalaryMonthly, e.activeFromMonth]),
      ]), 'Equipo')

      // Sheet 3: OPEX
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Concepto', 'Costo Mensual', 'Frecuencia', 'Activo desde mes'],
        ...(project.opexExpenses || []).map(o =>
          [o.name, o.monthlyCost, o.frequency, o.activeFromMonth]),
      ]), 'OPEX')

      XLSX.writeFile(wb, `${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Excel exportado correctamente')
    } catch (err) {
      toast.error('Error al exportar Excel')
      console.error(err)
    }
  }

  // ── Import JSON ───────────────────────────────────────────────────────────────
  function handleImportClick() { fileInputRef.current?.click() }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        importProject(data)
        toast.success(`Proyecto "${data?.profile?.companyName || file.name}" importado`)
      } catch {
        toast.error('Archivo JSON inválido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Restore VELOX ────────────────────────────────────────────────────────────
  function handleRestore() {
    if (window.confirm('¿Restaurar el proyecto demo VELOX? Se perderán los cambios no guardados.')) {
      restoreDefault()
      toast.success('Proyecto VELOX restaurado')
    }
  }

  // ── GitHub Sync ───────────────────────────────────────────────────────────────
  async function handleGitHubSync() {
    toast.loading('Sincronizando con GitHub...', { id: 'gh-sync' })
    try {
      await forceSyncToGitHub()
      toast.success('¡Guardado en GitHub!', { id: 'gh-sync' })
    } catch {
      toast.error('Error al sincronizar. Verifica la configuración.', { id: 'gh-sync' })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <header className="acrylic border-b border-white/8 z-40 shrink-0">
      {/* Hidden file input for JSON import */}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

      {/* ── Desktop Bar ──────────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center h-12 px-3 gap-2">

        {/* Logo + Title + Project chip */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg leading-none select-none">⬛</span>
          <span className="font-semibold text-[13px] text-w11-text whitespace-nowrap">Apex Business OS</span>
          <span className="px-2 py-0.5 rounded-full bg-w11-accent/20 text-w11-accent text-[11px] font-medium border border-w11-accent/30 whitespace-nowrap">
            {projectName}
          </span>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

        {/* Toolbar actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleRestore}     className="btn-subtle text-[12px] px-2 py-1 h-7">Restaurar VELOX</button>
          <button onClick={handleImportClick} className="btn-subtle text-[12px] px-2 py-1 h-7">Importar</button>
          <button onClick={handleExportJSON}  className="btn-subtle text-[12px] px-2 py-1 h-7">Guardar JSON</button>
          <button onClick={handleExportExcel} className="btn-subtle text-[12px] px-2 py-1 h-7">Excel / CSV</button>
          <button onClick={handleGitHubSync}  className="btn-subtle text-[12px] px-2 py-1 h-7 flex items-center gap-1">
            <span>☁</span> BBDD GitHub
          </button>
        </div>

        <div className="flex-1" />

        {/* Horizon selector */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded px-1 py-0.5 shrink-0">
          <span className="text-[10px] text-w11-text/40 mr-1 font-medium tracking-wide">HORIZONTE</span>
          {[
            { label: '6m', months: 6  },
            { label: '1a', months: 12 },
            { label: '2a', months: 24 },
            { label: '3a', months: 36 },
            { label: '5a', months: 60 },
          ].map(h => <HorizonBtn key={h.months} {...h} current={horizon} onClick={setHorizon} />)}
        </div>

        {/* Scenario selector */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded px-1 py-0.5 shrink-0">
          <span className="text-[10px] text-w11-text/40 mr-1 font-medium tracking-wide">ESCENARIO</span>
          <ScenarioBtn label="Pesimista" value="pessimist" current={scenario} onClick={setScenario} />
          <ScenarioBtn label="Base"      value="base"      current={scenario} onClick={setScenario} />
          <ScenarioBtn label="Optimista" value="optimist"  current={scenario} onClick={setScenario} />
        </div>

        <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

        {/* Capital semilla */}
        <div className="flex flex-col items-end shrink-0 min-w-[80px]">
          <span className="text-[9px] text-w11-text/40 uppercase tracking-wider leading-none">Capital Semilla</span>
          <span className="text-[13px] font-bold text-w11-accent leading-tight">{fmt(initialCapital)}</span>
        </div>

        {/* Sync indicator */}
        <SyncIndicator status={syncStatus} />

        {/* Snap Assist */}
        <button
          onClick={toggleSnap}
          title="Snap Assist — vista doble"
          className="btn-ghost w-8 h-8 flex items-center justify-center text-base rounded"
        >
          ⊞
        </button>

        {/* SOFIA */}
        <button
          onClick={toggleSofia}
          className="btn-accent h-8 px-3 text-[12px] font-semibold flex items-center gap-1 rounded-lg"
        >
          <span>✨</span> SOFIA
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          title="Configuración"
          className="btn-ghost w-8 h-8 flex items-center justify-center text-base rounded"
        >
          ⚙️
        </button>
      </div>

      {/* ── Mobile Bar ───────────────────────────────────────────────────────── */}
      <div className="flex md:hidden items-center h-11 px-3 gap-2">
        <span className="text-base leading-none select-none">⬛</span>
        <span className="font-semibold text-[13px] text-w11-text flex-1 truncate">Apex Business OS</span>
        <SyncIndicator status={syncStatus} />
        <button
          onClick={toggleSofia}
          className="btn-accent h-7 px-2 text-[11px] font-semibold flex items-center gap-1 rounded-lg"
        >
          <span>✨</span> SOFIA
        </button>
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="btn-ghost w-8 h-8 flex items-center justify-center text-lg rounded"
        >
          ☰
        </button>
      </div>

      {/* ── Mobile Dropdown ───────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-w11-surface border-t border-white/8 px-3 py-3 flex flex-col gap-2">
          {/* Horizon */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-w11-text/40 w-20 uppercase">Horizonte:</span>
            {[{ label: '6m', months: 6 }, { label: '1a', months: 12 }, { label: '2a', months: 24 }, { label: '3a', months: 36 }, { label: '5a', months: 60 }].map(h => (
              <HorizonBtn key={h.months} {...h} current={horizon} onClick={m => { setHorizon(m); setMobileMenuOpen(false) }} />
            ))}
          </div>
          {/* Scenario */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-w11-text/40 w-20 uppercase">Escenario:</span>
            <ScenarioBtn label="Pesimista" value="pessimist" current={scenario} onClick={v => { setScenario(v); setMobileMenuOpen(false) }} />
            <ScenarioBtn label="Base"      value="base"      current={scenario} onClick={v => { setScenario(v); setMobileMenuOpen(false) }} />
            <ScenarioBtn label="Optimista" value="optimist"  current={scenario} onClick={v => { setScenario(v); setMobileMenuOpen(false) }} />
          </div>
          {/* Actions */}
          <div className="flex flex-wrap gap-1 pt-1 border-t border-white/8">
            <button onClick={() => { handleImportClick(); setMobileMenuOpen(false) }}  className="btn-subtle text-[11px] px-2 py-1">Importar</button>
            <button onClick={() => { handleExportJSON(); setMobileMenuOpen(false) }}    className="btn-subtle text-[11px] px-2 py-1">Guardar JSON</button>
            <button onClick={() => { handleExportExcel(); setMobileMenuOpen(false) }}   className="btn-subtle text-[11px] px-2 py-1">Excel / CSV</button>
            <button onClick={() => { handleGitHubSync(); setMobileMenuOpen(false) }}    className="btn-subtle text-[11px] px-2 py-1">☁ GitHub</button>
            <button onClick={() => { handleRestore(); setMobileMenuOpen(false) }}       className="btn-subtle text-[11px] px-2 py-1">Restaurar VELOX</button>
            <button onClick={() => { toggleSettings(); setMobileMenuOpen(false) }}      className="btn-subtle text-[11px] px-2 py-1">⚙ Configuración</button>
          </div>
        </div>
      )}
    </header>
  )
}
