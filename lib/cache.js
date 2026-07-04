import { apiClient } from './utils.js'

const cache = new Map()
const inflight = new Map()
const STALE_MS = 60000
const RETRY_MS = 3000

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > STALE_MS) return null
  return entry.data
}

function setCached(key, data) {
  cache.set(key, { data, fetchedAt: Date.now() })
}

export async function fetchWithCache(key, fetcher) {
  const cached = getCached(key)
  if (cached) return cached
  const existing = inflight.get(key)
  if (existing) return existing
  const promise = fetcher().then(data => {
    setCached(key, data)
    inflight.delete(key)
    return data
  }).catch(err => {
    inflight.delete(key)
    const entry = cache.get(key)
    if (entry && Date.now() - entry.fetchedAt < RETRY_MS) return entry.data
    throw err
  })
  inflight.set(key, promise)
  return promise
}

export function invalidateCache(key) {
  key ? cache.delete(key) : cache.clear()
}

let state = {
  dashboard: null,
  properties: [],
  listeners: new Set()
}

function notify() {
  for (const fn of state.listeners) fn(state)
}

export function subscribe(fn) {
  state.listeners.add(fn)
  return () => state.listeners.delete(fn)
}

export function getState() { return state }

export async function refreshDashboard() {
  try {
    const data = await fetchWithCache('/api/dashboard', () => apiClient.get('/dashboard'))
    state = { ...state, dashboard: data }
    notify()
  } catch (e) { console.error(e) }
}

export async function refreshProperties() {
  try {
    const data = await fetchWithCache('/api/properties', () => apiClient.get('/properties'))
    state = { ...state, properties: Array.isArray(data) ? data : [] }
    notify()
  } catch (e) { console.error(e) }
}

export function initCache() {
  refreshDashboard()
  refreshProperties()
}
