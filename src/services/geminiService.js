// Gemini Service — SOFIA Virtual CFO Copilot
// Conecta con la API de Google Gemini para el asistente de inteligencia financiera

import { GoogleGenAI } from '@google/genai'

let ai = null

function getClient() {
  if (ai) return ai
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) return null
  ai = new GoogleGenAI({ apiKey: key })
  return ai
}

/** Genera el contexto del negocio para SOFIA */
function buildBusinessContext(project) {
  if (!project) return ''
  const { profile, employees, opexExpenses, capexInvestments, revenueStreams, actionPlanItems } = project

  const totalPayroll = (employees || [])
    .filter(e => !e.isOneTime)
    .reduce((s, e) => s + e.baseSalaryMonthly, 0)

  const totalOpexMonthly = (opexExpenses || [])
    .filter(e => e.frequency === 'monthly')
    .reduce((s, e) => s + e.monthlyCost, 0)

  const totalCapex = (capexInvestments || [])
    .reduce((s, c) => s + c.totalCost, 0)

  return `
Eres SOFIA, la asistente financiera virtual de ${profile?.name || 'la empresa'}.
Tu función es actuar como Virtual CFO (Directora Financiera Virtual) para el equipo fundador.

CONTEXTO DEL NEGOCIO:
- Empresa: ${profile?.name} — ${profile?.tagline}
- Ciudad: ${profile?.city}
- Capital Semilla: $${profile?.initialCapital?.toLocaleString()}
- Horizonte: ${profile?.projectionHorizonMonths} meses
- Escenario activo: ${profile?.activeScenario}

EQUIPO (${(employees || []).length} puestos):
${(employees || []).map(e => `  - ${e.name}: ${e.role} @ $${e.baseSalaryMonthly}/mes`).join('\n')}
- Nómina mensual total: $${totalPayroll.toLocaleString()}

COSTOS OPERATIVOS MENSUALES (OPEX):
${(opexExpenses || []).filter(e => e.frequency === 'monthly').map(e => `  - ${e.name}: $${e.monthlyCost}/mes`).join('\n')}
- OPEX mensual aproximado: $${totalOpexMonthly.toLocaleString()}

INVERSIÓN INICIAL (CAPEX): $${totalCapex.toLocaleString()}

FUENTES DE INGRESOS:
${(revenueStreams || []).map(r => `  - ${r.name}: $${r.pricePerUnit} x unidad (desde Mes ${r.activeFromMonth})`).join('\n')}

HITOS DEL ROADMAP:
${(actionPlanItems || []).map(h => `  - [${h.phase}] ${h.title} — ${h.status}`).join('\n')}

Responde siempre en español. Sé concisa, directa y usa los datos reales del negocio.
Cuando hagas cálculos, muéstralos paso a paso. Usa emojis estratégicamente para hacer el texto más legible.
Si el usuario pide redactar algo (email, resumen ejecutivo, etc.), hazlo en formato profesional venezolano.
  `.trim()
}

/** Envía un mensaje al chat de SOFIA con historial de conversación */
export async function chatWithSofia(userMessage, history = [], projectData = null) {
  const client = getClient()
  if (!client) {
    return { error: true, text: 'Configura tu VITE_GEMINI_API_KEY para activar a SOFIA.' }
  }

  try {
    const systemInstruction = buildBusinessContext(projectData)

    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ]

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    })

    return { error: false, text: response.text }
  } catch (err) {
    console.error('[SOFIA] Error:', err)
    return { error: true, text: `Error al consultar a SOFIA: ${err.message}` }
  }
}

export function isGeminiConfigured() {
  return !!import.meta.env.VITE_GEMINI_API_KEY
}
