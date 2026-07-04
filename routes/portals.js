import { $, el, render } from '../lib/utils.js'

const STORAGE_KEY = 'pomp-portals'

const DEFAULT_PORTALS = [
  { type: 'Letting Agent', name: 'Kemprent Portal',    url: 'https://kemprent.co.za',    username: 'enthuse@kemprent.co.za', password: 'Enthuse2026!' },
  { type: 'Letting Agent', name: 'HuurKor Portal',     url: 'https://huurkor.co.za',     username: 'enthuse@huurkor.co.za', password: 'Trust2026!' },
  { type: 'Body Corp',     name: 'Trafalgar Portal',   url: 'https://trafalgar.co.za',   username: 'enthuse@trafalgar.co.za', password: 'OakdaleBC!' },
  { type: 'Municipal',     name: 'Municipal Portal',   url: 'https://www.eservices.gov.za', username: 'enthuse@municipal.co.za', password: 'Mun2026!' },
  { type: 'Bank',          name: 'Nedbank Business',   url: 'https://www.nedbank.co.za', username: 'enthuse@nedbank.co.za', password: 'BankPass2026!' },
]

function loadPortals() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_PORTALS }
  catch { return DEFAULT_PORTALS }
}

function savePortals(portals) { localStorage.setItem(STORAGE_KEY, JSON.stringify(portals)) }

export function renderPortals(container) {
  let portals = loadPortals()
  let visible = {}
  let copied = null
  let editingName = null
  let editForm = null
  let showAddForm = false

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex items-start justify-between shrink-0 mb-4">
        <div>
          <h2 class="page-title">Portals</h2>
          <p class="page-sub">External e-platforms with auto-login</p>
        </div>
        <button id="add-portal" class="btn-primary flex items-center gap-1 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Portal
        </button>
      </div>
      <div id="portal-list" class="flex-1 min-h-0 overflow-y-auto"></div>
    </div>`

  function rerender() {
    const list = $('portal-list')
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">'
    if (showAddForm) { html += renderAddCard(); showAddForm = false }
    portals.forEach(p => {
      if (editingName === p.name && editForm) html += renderEditCard(p)
      else html += renderViewCard(p)
    })
    html += '</div>'
    list.innerHTML = html
    wireEvents()
  }

  function renderViewCard(p) {
    const vis = visible[p.name] || false
    return `
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 uppercase tracking-wider">${escHtml(p.type)}</p>
            <p class="font-semibold text-pomp-navy truncate">${escHtml(p.name)}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 ml-2">
            <button data-edit="${p.name}" class="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
            </button>
            <a href="${escHtml(p.url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary flex items-center gap-1.5 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Open
            </a>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
            <span class="text-gray-500 text-xs">Username</span>
            <div class="flex items-center gap-2 min-w-0 max-w-[70%]">
              <span class="text-gray-800 text-xs font-mono truncate">${escHtml(p.username)}</span>
              <button data-copy="user-${p.name}" class="text-gray-400 hover:text-pomp-blue transition-colors shrink-0" title="Copy username">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
            <span class="text-gray-500 text-xs">Password</span>
            <div class="flex items-center gap-2">
              <span class="text-gray-800 text-xs font-mono">${vis ? escHtml(p.password) : '••••••••'}</span>
              <button data-toggle="${p.name}" class="text-gray-400 hover:text-pomp-blue transition-colors" title="${vis ? 'Hide' : 'Show'}">
                ${vis
                  ? '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
                  : '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'}
              </button>
              <button data-copy="pass-${p.name}" class="text-gray-400 hover:text-pomp-blue transition-colors" title="Copy password">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
        </div>
        ${copied === `user-${p.name}` ? '<p class="text-xs text-green-600 mt-2">Username copied!</p>' : ''}
        ${copied === `pass-${p.name}` ? '<p class="text-xs text-green-600 mt-2">Password copied!</p>' : ''}
      </div>`
  }

  function renderEditCard(p) {
    return `
      <div class="card border-2 border-pomp-blue/20">
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs font-semibold text-pomp-blue uppercase tracking-wider">Editing</p>
          <div class="flex items-center gap-1.5">
            <button id="edit-save" class="btn-primary flex items-center gap-1 text-xs px-2.5 py-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save
            </button>
            <button id="edit-cancel" class="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${['type', 'name', 'url', 'username', 'password'].map(f => `
            <div>
              <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">${f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input id="ef-${f}" value="${escHtml(editForm[f])}" class="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-pomp-blue outline-none">
            </div>`).join('')}
        </div>
      </div>`
  }

  function renderAddCard() {
    return `
      <div class="card border-2 border-green-400/30">
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs font-semibold text-green-600 uppercase tracking-wider">New Portal</p>
          <div class="flex items-center gap-1.5">
            <button id="add-save" class="btn-primary flex items-center gap-1 text-xs px-2.5 py-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Add</button>
            <button id="add-cancel" class="btn-secondary flex items-center gap-1 text-xs px-2 py-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${['type', 'name', 'url', 'username', 'password'].map(f => `
            <div>
              <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">${f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input id="af-${f}" class="w-full border border-pomp-blue rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-pomp-blue outline-none">
            </div>`).join('')}
        </div>
      </div>`
  }

  function wireEvents() {
    // View card events
    document.querySelectorAll('[data-toggle]').forEach(b => {
      b.addEventListener('click', () => {
        visible[b.dataset.toggle] = !visible[b.dataset.toggle]
        const p = portals.find(x => x.name === b.dataset.toggle)
        if (p) rerender()
      })
    })
    document.querySelectorAll('[data-copy]').forEach(b => {
      b.addEventListener('click', async () => {
        const key = b.dataset.copy
        const field = key.startsWith('user-') ? 'username' : 'password'
        const name = key.replace(/^(user|pass)-/, '')
        const p = portals.find(x => x.name === name)
        if (!p) return
        try { await navigator.clipboard.writeText(p[field]); copied = key; setTimeout(() => { copied = null; rerender() }, 2000); rerender() } catch {}
      })
    })
    document.querySelectorAll('[data-edit]').forEach(b => {
      b.addEventListener('click', () => {
        const p = portals.find(x => x.name === b.dataset.edit)
        if (!p) return
        editingName = p.name; editForm = { ...p }; rerender()
      })
    })
    // Edit card events
    const editSave = $('edit-save')
    if (editSave) editSave.addEventListener('click', () => {
      const updated = { type: $('ef-type').value, name: $('ef-name').value, url: $('ef-url').value, username: $('ef-username').value, password: $('ef-password').value }
      portals = portals.map(p => p.name === editingName ? updated : p)
      savePortals(portals)
      editingName = null; editForm = null; rerender()
    })
    const editCancel = $('edit-cancel')
    if (editCancel) editCancel.addEventListener('click', () => { editingName = null; editForm = null; rerender() })
    // Add card events
    const addSave = $('add-save')
    if (addSave) addSave.addEventListener('click', () => {
      const portal = { type: $('af-type').value, name: $('af-name').value, url: $('af-url').value, username: $('af-username').value, password: $('af-password').value }
      if (!portal.name.trim()) return
      portals.push(portal)
      savePortals(portals)
      showAddForm = false; rerender()
    })
    const addCancel = $('add-cancel')
    if (addCancel) addCancel.addEventListener('click', () => { showAddForm = false; rerender() })
  }

  $('add-portal').addEventListener('click', () => { showAddForm = true; rerender() })

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  rerender()
}
