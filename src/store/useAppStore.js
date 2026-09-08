// Zustand Store — Apex Business OS
// Estado global con persistencia en IndexedDB + auto-sync a GitHub

import { create } from 'zustand'
import { defaultProject } from '../data/defaultProject'
import { readFromGitHub, writeToGitHub, isGitHubConfigured } from '../services/githubService'

// --- IndexedDB helpers (localStorage fallback) ---
const STORAGE_KEY = 'apexos_project_v1'

function saveLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// --- Debounce helper ---
let syncTimer = null
function debouncedSync(fn, ms = 2000) {
  clearTimeout(syncTimer)
  syncTimer = setTimeout(fn, ms)
}

// --- Store ---
export const useAppStore = create((set, get) => ({
  // Data
  project: loadLocal() || defaultProject,
  syncStatus: 'idle',      // 'idle' | 'saving' | 'synced' | 'offline' | 'error'
  lastSynced: null,

  // UI State
  activeModule: 'dashboard',
  activeTab: null,
  snapMode: false,
  snapLeft: 'dashboard',
  snapRight: 'breakeven',
  sofiaOpen: false,
  settingsOpen: false,
  horizon: 6,              // months: 6, 12, 18, 24, 36, 48, 60
  scenario: 'base',        // 'pessimist' | 'base' | 'optimist'
  sofiaHistory: JSON.parse(localStorage.getItem('apexos_sofia_history') || '[]'),

  // ─── Actions ──────────────────────────────────────────────────────

  /** Navega a un módulo */
  setModule: (module) => set({ activeModule: module }),

  /** Abre/cierra SOFIA */
  toggleSofia: () => set(s => ({ sofiaOpen: !s.sofiaOpen })),

  /** Abre/cierra Configuración */
  toggleSettings: () => set(s => ({ settingsOpen: !s.settingsOpen })),

  /** Cambia escenario financiero */
  setScenario: (scenario) => {
    set(s => ({ scenario, project: { ...s.project, profile: { ...s.project.profile, activeScenario: scenario } } }))
    get()._triggerSync()
  },

  /** Cambia horizonte de proyección */
  setHorizon: (months) => {
    set(s => ({ horizon: months, project: { ...s.project, profile: { ...s.project.profile, projectionHorizonMonths: months } } }))
    get()._triggerSync()
  },

  /** Activa/desactiva Snap Assist */
  toggleSnap: () => set(s => ({ snapMode: !s.snapMode })),
  setSnapModule: (side, module) => set(side === 'left' ? { snapLeft: module } : { snapRight: module }),

  /** Actualiza el perfil del proyecto */
  updateProfile: (updates) => {
    set(s => ({ project: { ...s.project, profile: { ...s.project.profile, ...updates } } }))
    get()._triggerSync()
  },

  /** Actualiza cualquier array del proyecto (employees, opex, etc.) */
  updateList: (key, items) => {
    set(s => ({ project: { ...s.project, [key]: items } }))
    get()._triggerSync()
  },

  /** Agrega un item a un array del proyecto */
  addToList: (key, item) => {
    set(s => ({ project: { ...s.project, [key]: [...(s.project[key] || []), item] } }))
    get()._triggerSync()
  },

  /** Actualiza un item específico en un array */
  updateInList: (key, id, updates) => {
    set(s => ({
      project: {
        ...s.project,
        [key]: (s.project[key] || []).map(item => item.id === id ? { ...item, ...updates } : item)
      }
    }))
    get()._triggerSync()
  },

  /** Elimina un item de un array */
  removeFromList: (key, id) => {
    set(s => ({
      project: {
        ...s.project,
        [key]: (s.project[key] || []).filter(item => item.id !== id)
      }
    }))
    get()._triggerSync()
  },

  /** Importa un proyecto completo desde JSON */
  importProject: (data) => {
    set({ project: data })
    saveLocal(data)
    get()._triggerSync()
  },

  /** Restaura al proyecto por defecto (VELOX) */
  restoreDefault: () => {
    set({ project: defaultProject })
    saveLocal(defaultProject)
    get()._triggerSync()
  },

  /** Guarda historial de SOFIA */
  addSofiaMessage: (msg) => {
    set(s => {
      const updated = [...s.sofiaHistory, msg]
      localStorage.setItem('apexos_sofia_history', JSON.stringify(updated.slice(-100)))
      return { sofiaHistory: updated }
    })
  },

  clearSofiaHistory: () => {
    localStorage.removeItem('apexos_sofia_history')
    set({ sofiaHistory: [] })
  },

  /** Carga datos desde GitHub al inicio */
  loadFromGitHub: async () => {
    if (!isGitHubConfigured()) return
    set({ syncStatus: 'saving' })
    try {
      const data = await readFromGitHub()
      if (data) {
        set({ project: data, syncStatus: 'synced', lastSynced: new Date() })
        saveLocal(data)
      } else {
        set({ syncStatus: 'offline' })
      }
    } catch {
      set({ syncStatus: 'offline' })
    }
  },

  /** Guardado manual forzado a GitHub */
  forceSyncToGitHub: async () => {
    const { project } = get()
    set({ syncStatus: 'saving' })
    try {
      await writeToGitHub(project)
      set({ syncStatus: 'synced', lastSynced: new Date() })
    } catch (err) {
      set({ syncStatus: 'error' })
      console.error('[Sync] Error:', err)
      throw err
    }
  },

  /** Trigger interno de sync con debounce */
  _triggerSync: () => {
    const { project } = get()
    // Guardar local siempre al instante
    saveLocal(project)
    // Sync a GitHub con debounce de 2 segundos
    if (isGitHubConfigured()) {
      set({ syncStatus: 'saving' })
      debouncedSync(async () => {
        try {
          await writeToGitHub(project)
          set({ syncStatus: 'synced', lastSynced: new Date() })
        } catch {
          set({ syncStatus: 'offline' })
        }
      }, 2000)
    }
  },
}))
