export function $(id) { return document.getElementById(id) }

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v)
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v)
    else if (k === 'htmlContent') e.innerHTML = v
    else if (k === 'textContent') e.textContent = v
    else e.setAttribute(k, v)
  }
  for (const c of children) { if (c != null) e.append(typeof c === 'string' ? document.createTextNode(c) : c) }
  return e
}

export function render(container, content) {
  if (typeof container === 'string') container = $(container)
  container.innerHTML = ''
  if (typeof content === 'string') container.innerHTML = content
  else container.append(content)
  return container
}

const API_BASE = '/api'

async function api(path, opts) {
  const code = sessionStorage.getItem('pomp_auth')?.trim()
  const headers = { 'Content-Type': 'application/json' }
  if (code) headers['Authorization'] = `Bearer ${code}`
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...opts?.headers } })
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return null
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

export const apiClient = {
  get: (path) => api(path),
  post: (path, data) => api(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => api(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: (path) => api(path, { method: 'DELETE' }),
}

export function formatRand(amount) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(Math.ceil(amount))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function exportCSV(filename, rows, columns) {
  if (!rows.length) return
  const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }))
  const esc = (v) => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [
    cols.map(c => esc(c.label)).join(','),
    ...rows.map(r => cols.map(c => esc(r[c.key])).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
