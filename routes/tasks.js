import { $, el, render } from '../lib/utils.js'
import { apiClient, formatDate } from '../lib/utils.js'

export function renderTasks(container) {
  let items = []
  let filter = 'all'
  let editingId = null
  let form = { title: '', description: '', priority: 'medium', due_date: '' }
  let confirmDelete = null
  let selected = new Set()
  let confirmBulkDelete = false

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h2 class="font-heading text-xl font-bold text-pomp-navy">Tasks</h2>
          <p class="text-xs text-gray-400">Track what needs to get done</p>
        </div>
      </div>
      <div id="task-form" class="card my-3"></div>
      <div id="task-filters" class="flex gap-2 mb-3 shrink-0" role="tablist"></div>
      <div id="task-list" class="space-y-1.5"></div>
    </div>
    <div id="tasks-confirm" class="hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40"></div>
    <div id="tasks-bulk-confirm" class="hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40"></div>
  `

  async function load() {
    try { items = await apiClient.get(`/tasks?status=${filter}`) || [] } catch { items = [] }
    selected = new Set()
    renderForm()
    renderFilters()
    renderList()
  }

  function renderForm() {
    $('task-form').innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ABB9C" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <h4 class="font-semibold text-sm text-pomp-navy">${editingId ? 'Edit Task' : 'New Task'}</h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input id="task-title" placeholder="Task title" value="${escHtml(form.title)}" class="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-pomp-blue md:col-span-2">
        <select id="task-priority" class="border border-gray-300 rounded px-2 py-2 text-sm outline-none focus:border-pomp-blue">
          ${['low', 'medium', 'high'].map(p => `<option value="${p}"${form.priority === p ? ' selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input id="task-desc" placeholder="Description (optional)" value="${escHtml(form.description)}" class="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-pomp-blue md:col-span-2">
        <input id="task-due" type="date" value="${form.due_date}" class="border border-gray-300 rounded px-2 py-2 text-sm outline-none focus:border-pomp-blue">
      </div>
      <div class="flex gap-2">
        <button id="task-save" class="btn-primary text-sm">${editingId ? 'Update' : 'Add Task'}</button>
        ${editingId ? `<button id="task-cancel" class="btn-secondary text-sm">Cancel</button>` : ''}
      </div>`
    $('task-save').addEventListener('click', save)
    const cancel = $('task-cancel')
    if (cancel) cancel.addEventListener('click', () => { editingId = null; form = { title: '', description: '', priority: 'medium', due_date: '' }; renderForm() })
  }

  function renderFilters() {
    $('task-filters').innerHTML = ['all', 'pending', 'in_progress', 'done'].map(s => `
      <button data-filter="${s}" class="text-xs px-3 py-1.5 rounded-lg capitalize ${filter === s ? 'bg-pomp-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">${s === 'in_progress' ? 'In Progress' : s}</button>
    `).join('')
    $('task-filters').querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; load() }))
  }

  function renderList() {
    const list = $('task-list')
    const prioColors = { low: 'bg-gray-100 text-gray-600', medium: 'bg-orange-100 text-orange-700', high: 'bg-red-100 text-red-700' }

    // Bulk actions bar
    let html = ''
    if (selected.size > 0) {
      html += `
        <div class="flex items-center gap-2 px-3 py-2 bg-pomp-navy text-white text-xs rounded-lg mb-2">
          <span class="font-semibold">${selected.size} selected</span>
          <div class="flex-1"></div>
          <button id="bulk-delete" class="flex items-center gap-1 hover:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
          </button>
          <button id="clear-selection" class="flex items-center gap-1 hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Clear
          </button>
        </div>`
    }

    if (items.length === 0) {
      html += '<p class="text-sm text-gray-400 italic text-center py-8">No tasks yet.</p>'
    } else {
      html += items.map(item => {
        const checked = selected.has(item.id)
        return `
          <div class="card flex items-start justify-between py-2.5 ${item.status === 'done' ? 'opacity-60' : ''}">
            <div class="flex items-start gap-2 flex-1 min-w-0">
              <input type="checkbox" ${checked ? 'checked' : ''} data-check="${item.id}" class="mt-1.5 shrink-0 accent-pomp-navy">
              <button data-toggle="${item.id}" class="mt-0.5 shrink-0">
                ${item.status === 'done' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
                  : item.status === 'in_progress' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
                  : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'}
              </button>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-medium text-sm ${item.status === 'done' ? 'line-through text-gray-400' : 'text-pomp-navy'}">${escHtml(item.title)}</h4>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioColors[item.priority] || ''}">${item.priority}</span>
                  ${item.status === 'in_progress' ? '<span class="badge-blue text-[10px]">In Progress</span>' : ''}
                </div>
                ${item.description ? `<p class="text-xs text-gray-500 mt-0.5">${escHtml(item.description)}</p>` : ''}
                <p class="text-[11px] text-gray-400 mt-1">${formatDate(item.created_at)}${item.due_date ? ` · Due: ${item.due_date}` : ''}</p>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-2">
              <button data-edit="${item.id}" class="text-gray-300 hover:text-pomp-blue p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button data-delete="${item.id}" class="text-gray-300 hover:text-red-500 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>`
      }).join('')
    }

    list.innerHTML = html

    // Wire events
    list.querySelectorAll('[data-check]').forEach(b => b.addEventListener('change', () => {
      if (selected.has(b.dataset.check)) selected.delete(b.dataset.check)
      else selected.add(b.dataset.check)
      renderList()
    }))
    list.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', async () => {
      const item = items.find(i => i.id === b.dataset.toggle)
      if (!item) return
      const next = item.status === 'done' ? 'pending' : item.status === 'in_progress' ? 'done' : 'in_progress'
      try { await apiClient.put(`/tasks/${item.id}`, { status: next }); load() } catch {}
    }))
    list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const item = items.find(i => i.id === b.dataset.edit)
      if (!item) return
      editingId = item.id
      form = { title: item.title, description: item.description || '', priority: item.priority, due_date: item.due_date || '' }
      renderForm()
    }))
    list.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => {
      confirmDelete = b.dataset.delete
      showConfirm()
    }))

    const bulkDel = $('bulk-delete')
    if (bulkDel) bulkDel.addEventListener('click', () => { confirmBulkDelete = true; showBulkConfirm() })
    const clearSel = $('clear-selection')
    if (clearSel) clearSel.addEventListener('click', () => { selected = new Set(); renderList() })
  }

  async function save() {
    const title = $('task-title')?.value?.trim()
    if (!title) return
    const data = { title, description: $('task-desc')?.value || '', priority: $('task-priority')?.value || 'medium', due_date: $('task-due')?.value || '' }
    try {
      if (editingId) await apiClient.put(`/tasks/${editingId}`, data)
      else await apiClient.post('/tasks', data)
      editingId = null; form = { title: '', description: '', priority: 'medium', due_date: '' }
      load()
    } catch {}
  }

  function showConfirm() {
    const confirm = $('tasks-confirm')
    confirm.classList.remove('hidden')
    confirm.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">Delete Task</h3>
          <button onclick="this.closest('#tasks-confirm').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="p-4"><div class="flex items-start gap-3 bg-red-50 rounded-lg p-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p class="text-sm text-gray-700">Are you sure you want to delete this task? This action cannot be undone.</p>
        </div></div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="this.closest('#tasks-confirm').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button id="tasks-confirm-del" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>`
    $('tasks-confirm-del').addEventListener('click', async () => {
      try { await apiClient.del(`/tasks/${confirmDelete}`); $('tasks-confirm').classList.add('hidden'); confirmDelete = null; load() } catch {}
    })
  }

  function showBulkConfirm() {
    const confirm = $('tasks-bulk-confirm')
    confirm.classList.remove('hidden')
    confirm.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">Delete Tasks</h3>
          <button onclick="this.closest('#tasks-bulk-confirm').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="p-4"><div class="flex items-start gap-3 bg-red-50 rounded-lg p-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p class="text-sm text-gray-700">Are you sure you want to delete ${selected.size} tasks? This cannot be undone.</p>
        </div></div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="this.closest('#tasks-bulk-confirm').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button id="tasks-bulk-confirm-del" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete All</button>
        </div>
      </div>`
    $('tasks-bulk-confirm-del').addEventListener('click', async () => {
      try {
        await Promise.all(Array.from(selected).map(id => apiClient.del(`/tasks/${id}`)))
        $('tasks-bulk-confirm').classList.add('hidden'); confirmBulkDelete = false; load()
      } catch {}
    })
  }

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  load()
}
