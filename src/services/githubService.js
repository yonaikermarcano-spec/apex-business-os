// GitHub Service — Apex Business OS
// Lee y escribe business_data.json directamente en el repo de GitHub
// Usado como base de datos persistente sin servicios adicionales

const BASE_URL = 'https://api.github.com'

function getConfig() {
  return {
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo:  import.meta.env.VITE_GITHUB_REPO  || '',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
    filePath: 'data/business_data.json',
  }
}

function headers(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

/** Verifica si la config de GitHub está completa */
export function isGitHubConfigured() {
  const { token, owner, repo } = getConfig()
  return !!(token && owner && repo)
}

/** Guarda el config de GitHub en localStorage para uso dinámico */
export function saveGitHubConfig(config) {
  localStorage.setItem('apexos_github_config', JSON.stringify(config))
}

/** Obtiene config de GitHub combinando env + localStorage */
export function getGitHubConfig() {
  const env = getConfig()
  const saved = JSON.parse(localStorage.getItem('apexos_github_config') || '{}')
  return {
    token: saved.token || env.token,
    owner: saved.owner || env.owner,
    repo:  saved.repo  || env.repo,
    branch: saved.branch || env.branch || 'main',
    filePath: 'data/business_data.json',
  }
}

/** Obtiene el SHA del archivo actual (necesario para hacer PUT) */
async function getFileSha(config) {
  try {
    const res = await fetch(
      `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`,
      { headers: headers(config.token) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.sha || null
  } catch {
    return null
  }
}

/** Lee business_data.json desde GitHub */
export async function readFromGitHub() {
  const config = getGitHubConfig()
  if (!config.token || !config.owner || !config.repo) return null

  try {
    const res = await fetch(
      `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`,
      { headers: headers(config.token) }
    )
    if (!res.ok) return null

    const data = await res.json()
    const content = atob(data.content.replace(/\n/g, ''))
    return JSON.parse(content)
  } catch (err) {
    console.warn('[GitHub] Error leyendo datos:', err)
    return null
  }
}

/** Escribe/actualiza business_data.json en GitHub */
export async function writeToGitHub(projectData) {
  const config = getGitHubConfig()
  if (!config.token || !config.owner || !config.repo) {
    throw new Error('GitHub no configurado')
  }

  const sha = await getFileSha(config)
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(projectData, null, 2))))

  const body = {
    message: `BBDD sync: ${new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' })}`,
    content,
    branch: config.branch,
    ...(sha ? { sha } : {}),
  }

  const res = await fetch(
    `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${config.filePath}`,
    { method: 'PUT', headers: headers(config.token), body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Error guardando en GitHub')
  }

  return true
}
