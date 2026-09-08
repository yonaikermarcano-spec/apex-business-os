import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from './store/useAppStore'

// Layout
import TopBar from './components/layout/TopBar'
import Sidebar from './components/layout/Sidebar'
import BottomBar from './components/layout/BottomBar'
import MobileTaskbar from './components/layout/MobileTaskbar'
import SnapLayout from './components/layout/SnapLayout'

// SOFIA Copilot
import SofiaPanel from './components/sofia/SofiaPanel'

// Settings Modal
import SettingsModal from './components/ui/SettingsModal'

// Modules
import ExecutiveDashboard    from './components/modules/01_ExecutiveDashboard'
import ReporteInversores     from './components/modules/02_ReporteInversores'
import ModeloNegocio         from './components/modules/03_ModeloNegocio'
import PlanAccion            from './components/modules/04_PlanAccion'
import CostoConsumo          from './components/modules/05_CostoConsumo'
import EquipoNomina          from './components/modules/06_EquipoNomina'
import GastosCapex           from './components/modules/07_GastosCapex'
import Proveedores           from './components/modules/08_Proveedores'
import BreakevenROI          from './components/modules/09_BreakevenROI'
import ProyeccionesP_L       from './components/modules/10_ProyeccionesP_L'
import PlanVsReal            from './components/modules/11_PlanVsReal'
import CentroAlertas         from './components/modules/12_CentroAlertas'
import CampañaPublicitaria   from './components/modules/13_CampañaPublicitaria'
import CalculadoraCarreras   from './components/modules/14_CalculadoraCarreras'

const MODULE_MAP = {
  dashboard:       ExecutiveDashboard,
  inversores:      ReporteInversores,
  modelo_negocio:  ModeloNegocio,
  plan_accion:     PlanAccion,
  costo_consumo:   CostoConsumo,
  equipo:          EquipoNomina,
  gastos_capex:    GastosCapex,
  proveedores:     Proveedores,
  breakeven:       BreakevenROI,
  proyecciones:    ProyeccionesP_L,
  plan_vs_real:    PlanVsReal,
  alertas:         CentroAlertas,
  campana:         CampañaPublicitaria,
  carreras:        CalculadoraCarreras,
}

export function ModuleRenderer({ moduleId }) {
  const Component = MODULE_MAP[moduleId] || ExecutiveDashboard
  return <Component />
}

export default function App() {
  const { activeModule, snapMode, sofiaOpen, settingsOpen, loadFromGitHub } = useAppStore()

  // Cargar datos desde GitHub al inicio
  useEffect(() => {
    loadFromGitHub()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-w11-bg text-w11-text overflow-hidden font-segoe">

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#2a2a2a', color: '#e8e8e8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' },
          success: { iconTheme: { primary: '#0078d4', secondary: '#e8e8e8' } },
        }}
      />

      {/* Top Bar */}
      <TopBar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar (desktop) */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {snapMode ? (
            <SnapLayout />
          ) : (
            <div className="flex-1 overflow-hidden">
              <ModuleRenderer moduleId={activeModule} />
            </div>
          )}

          {/* Bottom Bar */}
          <BottomBar />
        </main>
      </div>

      {/* Mobile Taskbar (only on mobile) */}
      <div className="md:hidden">
        <MobileTaskbar />
      </div>

      {/* SOFIA Copilot Panel */}
      {sofiaOpen && <SofiaPanel />}

      {/* Settings Modal */}
      {settingsOpen && <SettingsModal />}
    </div>
  )
}
