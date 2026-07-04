import { $, el, render } from '../lib/utils.js'
import { apiClient } from '../lib/utils.js'

const ACTION_ICONS = {
  create: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  update: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  delete: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  login: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
}

const ACTION_COLORS = {
  create: 'text-green-600 bg-green-50',
  update: 'text-blue-600 bg-blue-50',
  delete: 'text-red-600 bg-red-50',
  login: 'text-purple-600 bg-purple-50',
}

export function renderActivity(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h2 class="page-title">Activity Log</h2>
        <p class="page-sub" id="activity-sub">Loading...</p>
      </div>
      <div class="flex gap-2">
        <button onclick="this.__reload()" class="btn-secondary text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Refresh
        </button>
        <button onclick="this.__clear()" class="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All
        </button>
      </div>
    </div>
    <div id="activity-list" class="flex-1 min-h-0 overflow-y-auto mt-3"></div>
    <div id="activity-confirm" class="hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40"></div>
  `

  let activities = []
  let total = 0
  let loading = true

  const listEl = $('activity-list')
  const subEl = $('activity-sub')

  async function load() {
    loading = true
    listEl.innerHTML = '<div class="space-y-2">' + Array.from({length: 8}).map(() =>
      '<div class="skeleton rounded-lg" style="height: 52px"></div>'
    ).join('') + '</div>'

    try {
      const data = await apiClient.get(`/activity?limit=50&offset=0`)
      activities = data?.results || []
      total = data?.total || 0
    } catch { activities = []; total = 0 }
    loading = false
    subEl.textContent = `${total} events recorded`
    renderList()
  }

  function renderList() {
    if (activities.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-200 mb-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p class="text-sm text-gray-400">No activity yet. Actions will appear here as you use the app.</p>
        </div>`
      return
    }
    listEl.innerHTML = '<div class="space-y-1" id="activity-items"></div>'
    const items = $('activity-items')
    activities.forEach(a => {
      const icon = ACTION_ICONS[a.action] || ACTION_ICONS.create
      const color = ACTION_COLORS[a.action] || 'text-gray-500 bg-gray-50'
      items.innerHTML += `
        <div class="card flex items-start gap-3 py-2.5 px-4">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}">${icon}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-pomp-navy">
              <span class="font-medium capitalize">${a.action}</span> ${a.entity_type.replace(/_/g, ' ')}
              ${a.entity_label ? `<span class="text-gray-500"> — ${a.entity_label}</span>` : ''}
            </p>
            <p class="text-[11px] text-gray-400 mt-0.5">${new Date(a.created_at).toLocaleString('en-ZA')}${a.actor ? `<span class="ml-2">by ${a.actor.slice(0, 12)}</span>` : ''}</p>
          </div>
        </div>`
    })
  }

  async function clearLog() {
    try {
      await apiClient.del('/activity')
      load()
    } catch {}
    $('activity-confirm').classList.add('hidden')
  }

  // Wire up buttons
  const refreshBtn = container.querySelector('[onclick*="reload"]')
  refreshBtn.__reload = load
  refreshBtn.removeAttribute('onclick')
  refreshBtn.addEventListener('click', load)

  const clearBtn = container.querySelector('[onclick*="clear"]')
  clearBtn.__clear = () => {
    const confirmEl = $('activity-confirm')
    confirmEl.classList.remove('hidden')
    confirmEl.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">Clear Activity Log</h3>
          <button onclick="this.closest('#activity-confirm').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-4">
          <div class="flex items-start gap-3 bg-red-50 rounded-lg p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p class="text-sm text-gray-700">Are you sure you want to delete all activity records? This cannot be undone.</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="this.closest('#activity-confirm').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onclick="this.closest('#activity-confirm').__confirmClear()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Clear All</button>
        </div>
      </div>`
    confirmEl.querySelector('[onclick*="confirmClear"]').__confirmClear = clearLog
    confirmEl.querySelector('[onclick*="confirmClear"]').removeAttribute('onclick')
    confirmEl.querySelectorAll('[onclick*="hidden"]').forEach(b => b.addEventListener('click', () => confirmEl.classList.add('hidden')))
  }
  clearBtn.removeAttribute('onclick')
  clearBtn.addEventListener('click', clearBtn.__clear)

  load()
}
