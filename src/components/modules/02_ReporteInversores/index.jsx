// src/components/modules/02_ReporteInversores/index.jsx
import React, { useRef, useMemo } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useAppStore } from '../../store/useAppStore'
import { generatePnLTable, fmt, monthName } from '../../utils/financials'

export default function ReporteInversores() {
  const { project, horizon, scenario } = useAppStore()
  const reportRef = useRef(null)

  const pnlRows = useMemo(() => generatePnLTable(project, Math.min(horizon, 12), scenario), [project, horizon, scenario])

  const employees = project.employees || []
  const directors = employees.filter(e => e.type === 'director')

  // Generar PDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return
    try {
      const element = reportRef.current
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#181818' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Dossier_Inversion_${project.profile.id}.pdf`)
    } catch (err) {
      console.error('Error generando PDF:', err)
      window.print()
    }
  }

  return (
    <div className="module-content space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-xl font-bold text-w11-text">Reporte Ejecutivo para Inversores</h2>
          </div>
          <p className="text-xs text-white/40">Dossier financiero formal de la ronda de inversión pre-semilla</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="btn-ghost text-xs flex items-center gap-1">
            <span>🖨️</span> Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="btn-accent text-xs flex items-center gap-1">
            <span>📥</span> Descargar Dossier PDF
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div
        ref={reportRef}
        className="w11-card rounded-2xl p-8 border border-white/10 bg-[#1c1c1c] text-w11-text space-y-8 max-w-4xl mx-auto shadow-2xl"
      >
        {/* Header / Portada */}
        <div className="border-b border-white/10 pb-6 flex items-start justify-between">
          <div>
            <span className="chip-progress text-[11px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded">
              Confidencial · Dossier de Inversión
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-2 text-white">
              {project.profile.name}
            </h1>
            <p className="text-sm text-w11-accent font-medium mt-0.5">
              {project.profile.tagline}
            </p>
            <p className="text-xs text-white/40 mt-1">
              {project.profile.city} · Industria: {project.profile.industry}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/40 block">Fecha de Emisión:</span>
            <span className="text-xs font-mono text-white/70">{new Date().toLocaleDateString('es-VE')}</span>
            <span className="text-xs text-emerald-400 block font-semibold mt-2">Ronda Pre-Semilla</span>
          </div>
        </div>

        {/* 1. Tesis de Inversión */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
            <span>01</span> Resumen Ejecutivo &amp; Tesis de Negocio
          </h3>
          <p className="text-xs text-white/80 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <strong>{project.profile.name}</strong> es el primer ecosistema integral de movilidad y orden público vial en Caracas.
            A diferencia de las plataformas tradicionales de ride-hailing que solo despachan viajes, VELOX formaliza y monetiza las tres etapas de la vida del conductor:
            (1) <em>Afiliación y validación biométrica</em>, (2) <em>Red oficial de paradas y estacionamientos protegidos</em> ($10/mes de abono recurrente), y (3) <em>Despacho digital de carreras y encomiendas</em> ($3/viaje).
          </p>
        </div>

        {/* 2. Estructura de Capital */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
            <span>02</span> Ronda de Inversión Requerida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 block">Capital Total Solicitado</span>
              <span className="text-2xl font-black font-mono text-w11-accent">${(project.profile.initialCapital || 52000).toLocaleString()}</span>
              <span className="text-[10px] text-white/50 block">Cubre 100% hasta el Punto de Equilibrio</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 block">Desembolso T1 (Setup &amp; MVP)</span>
              <span className="text-2xl font-black font-mono text-amber-400">$18,500</span>
              <span className="text-[10px] text-white/50 block">53% de la ronda · Meses 1 a 3</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 block">Desembolso T2 (Lanzamiento)</span>
              <span className="text-2xl font-black font-mono text-amber-400">$16,500</span>
              <span className="text-[10px] text-white/50 block">47% de la ronda · Meses 4 a 6</span>
            </div>
          </div>
        </div>

        {/* 3. Equipo Directivo */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
            <span>03</span> Liderazgo &amp; Equipo Fundador
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {directors.map(dir => (
              <div key={dir.id} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1 text-xs">
                <p className="font-bold text-w11-text text-sm">{dir.name}</p>
                <p className="text-w11-accent font-medium text-[11px]">{dir.role}</p>
                <p className="text-white/50 text-[10px] pt-1">{dir.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Síntesis P&L Proyectada */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
            <span>04</span> Síntesis Financiera (Primeros 6 Meses)
          </h3>
          <div className="overflow-x-auto">
            <table className="w11-table w-full text-xs">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="py-2 text-left">Período</th>
                  <th className="py-2 text-right">Ingresos</th>
                  <th className="py-2 text-right">Nómina</th>
                  <th className="py-2 text-right">OPEX</th>
                  <th className="py-2 text-right">EBITDA</th>
                  <th className="py-2 text-right">Caja Acumulada</th>
                </tr>
              </thead>
              <tbody>
                {pnlRows.slice(0, 6).map(r => (
                  <tr key={r.month} className="border-b border-white/5 font-mono">
                    <td className="py-2 text-left text-white/80 font-sans">{monthName(r.month)}</td>
                    <td className="py-2 text-right text-emerald-400">{fmt(r.revenue)}</td>
                    <td className="py-2 text-right text-white/60">{fmt(r.payroll)}</td>
                    <td className="py-2 text-right text-white/60">{fmt(r.opex)}</td>
                    <td className={`py-2 text-right ${r.ebitda >= 0 ? 'text-blue-400 font-bold' : 'text-red-400'}`}>
                      {r.ebitda < 0 ? '-' : ''}{fmt(Math.abs(r.ebitda))}
                    </td>
                    <td className={`py-2 text-right font-bold ${r.cumulativeCash >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {r.cumulativeCash < 0 ? '-' : ''}{fmt(Math.abs(r.cumulativeCash))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40">
          <span>Generado por Apex Business OS · Windows 11 Enterprise Edition</span>
          <span>Página 1 de 1 · Caracas, Venezuela</span>
        </div>
      </div>
    </div>
  )
}
