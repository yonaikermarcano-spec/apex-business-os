// Financial calculation engine for Apex Business OS

/** Aplica el multiplicador de escenario */
export function getScenarioMultiplier(scenario) {
  return scenario === 'pessimist' ? 0.75 : scenario === 'optimist' ? 1.33 : 1.0
}

/** Calcula ingresos mensuales para un revenue stream dado el mes */
export function getStreamRevenue(stream, month, scenarioMult = 1.0) {
  if (month < stream.activeFromMonth) return 0
  const units = stream.monthlyUnitsOverride?.[String(month)] ?? stream.initialUnits ?? 0
  return units * stream.pricePerUnit * scenarioMult
}

/** Calcula COGS de un stream dado el mes */
export function getStreamCogs(stream, directCosts, month, scenarioMult = 1.0) {
  if (month < stream.activeFromMonth) return 0
  const units = stream.monthlyUnitsOverride?.[String(month)] ?? stream.initialUnits ?? 0
  const linkedCogs = directCosts.filter(c => c.linkedStreamId === stream.id)
  return linkedCogs.reduce((sum, c) => sum + c.costPerUnit * units * scenarioMult, 0)
}

/** Calcula la nómina total para un mes */
export function getPayrollForMonth(employees, month) {
  return employees.reduce((sum, emp) => {
    if (emp.activeFromMonth > month) return sum
    if (emp.isOneTime && emp.endMonth && emp.endMonth < month) return sum
    return sum + emp.baseSalaryMonthly
  }, 0)
}

/** Calcula OPEX total para un mes */
export function getOpexForMonth(opexExpenses, month) {
  return opexExpenses.reduce((sum, expense) => {
    if (expense.activeFromMonth > month) return sum
    if (expense.monthlyAmountOverride?.[String(month)] !== undefined) {
      return sum + expense.monthlyAmountOverride[String(month)]
    }
    if (expense.frequency === 'one_time') return sum
    return sum + expense.monthlyCost
  }, 0)
}

/** Calcula CAPEX para un mes */
export function getCapexForMonth(capexInvestments, month) {
  return capexInvestments
    .filter(c => c.monthSpent === month)
    .reduce((sum, c) => sum + c.totalCost, 0)
}

/** Genera tabla P&L completa para todos los meses */
export function generatePnLTable(project, horizon, scenario = 'base') {
  const { revenueStreams, directCosts, employees, opexExpenses, capexInvestments } = project
  const scenarioMult = getScenarioMultiplier(scenario)
  const rows = []
  let cumulativeCash = project.profile.initialCapital

  for (let m = 1; m <= horizon; m++) {
    const revenue = revenueStreams.reduce((s, stream) => s + getStreamRevenue(stream, m, scenarioMult), 0)
    const cogs    = revenueStreams.reduce((s, stream) => s + getStreamCogs(stream, directCosts, m, scenarioMult), 0)
    const grossMargin = revenue - cogs
    const payroll = getPayrollForMonth(employees, m)
    const opex    = getOpexForMonth(opexExpenses, m)
    const ebitda  = grossMargin - payroll - opex
    const capex   = getCapexForMonth(capexInvestments, m)
    const netFlow = ebitda - capex
    cumulativeCash += netFlow

    rows.push({
      month: m,
      revenue, cogs, grossMargin, payroll, opex,
      operationalCost: payroll + opex,
      ebitda, capex, netFlow, cumulativeCash,
      ebitdaMarginPct: revenue > 0 ? (ebitda / revenue) * 100 : 0,
    })
  }

  return rows
}

/** Calcula el breakeven mensual requerido */
export function calculateBreakevenRevenue(project, month = 1) {
  const { employees, opexExpenses } = project
  const payroll = getPayrollForMonth(employees, month)
  const opex    = getOpexForMonth(opexExpenses, month)
  return payroll + opex
}

/** Calcula el breakeven de carreras por día */
export function calculateRidesBreakeven(project, options = {}) {
  const { employees, opexExpenses, revenueStreams, capexInvestments } = project
  const {
    month = 6,
    commissionPerRide = 3,
    includeParking = true,
    includeOnboarding = true,
    includeCapex = false,
    activeDrivers = 500,
  } = options

  const payroll = getPayrollForMonth(employees, month)
  const opex    = getOpexForMonth(opexExpenses, month)
  const capex   = includeCapex ? getCapexForMonth(capexInvestments, month) : 0

  // Otros ingresos que reducen la carga sobre las carreras
  let otherRevenue = 0
  if (includeParking) {
    const parkingStream = revenueStreams.find(r => r.id === 'stream-parking')
    if (parkingStream) otherRevenue += getStreamRevenue(parkingStream, month)
  }
  if (includeOnboarding) {
    const onboardStream = revenueStreams.find(r => r.id === 'stream-conductores')
    if (onboardStream) otherRevenue += getStreamRevenue(onboardStream, month)
  }

  const totalCosts = payroll + opex + capex
  const neededFromRides = Math.max(0, totalCosts - otherRevenue)
  const ridesPerMonth = neededFromRides / commissionPerRide
  const ridesPerDay   = ridesPerMonth / 30
  const ridesPerDriverPerDay = activeDrivers > 0 ? ridesPerDay / activeDrivers : 0

  return {
    totalCosts, otherRevenue, neededFromRides,
    ridesPerMonth: Math.ceil(ridesPerMonth),
    ridesPerDay:   Math.ceil(ridesPerDay),
    ridesPerDriverPerDay: +ridesPerDriverPerDay.toFixed(1),
    commissionPerRide,
    activeDrivers,
    payroll, opex,
  }
}

/** Calcula la Salud Financiera (score 0-100) */
export function calculateHealthScore(project, horizon = 6, scenario = 'base') {
  const rows = generatePnLTable(project, horizon, scenario)
  const lastRow = rows[rows.length - 1]
  const initialCapital = project.profile.initialCapital

  let score = 0

  // Runway (max 30 pts)
  const runwayMonths = rows.filter(r => r.cumulativeCash > 0).length
  score += Math.min(30, (runwayMonths / horizon) * 30)

  // Caja final positiva (max 20 pts)
  if (lastRow.cumulativeCash > 0) score += 20

  // % de capital consumido (max 20 pts)
  const consumed = initialCapital - lastRow.cumulativeCash
  const consumedPct = consumed / initialCapital
  score += Math.max(0, 20 - consumedPct * 20)

  // EBITDA positivo en algún mes (max 15 pts)
  const positiveMonths = rows.filter(r => r.ebitda > 0).length
  score += (positiveMonths / horizon) * 15

  // Revenue > 0 en algún mes (max 15 pts)
  const revenueMonths = rows.filter(r => r.revenue > 0).length
  score += (revenueMonths / horizon) * 15

  return Math.round(Math.min(100, Math.max(0, score)))
}

/** Formatea moneda */
export function fmt(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '$0'
  return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/** Formatea número */
export function fmtNum(value, decimals = 0) {
  if (isNaN(value)) return '0'
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Nombre del mes en español */
export function monthName(m, year = 2026) {
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${months[(m - 1) % 12]} ${year + Math.floor((m - 1) / 12)}`
}
