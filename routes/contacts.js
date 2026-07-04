import { $, el, render } from '../lib/utils.js'
import { apiClient, exportCSV } from '../lib/utils.js'
import { getState } from '../lib/cache.js'

function contactCard(contact, propName, onEdit, onDelete) {
  const catColors = { emergency: 'text-red-500 bg-red-50', service_provider: 'text-orange-500 bg-orange-50', professional: 'text-blue-500 bg-blue-50' }
  const catIcons = { emergency: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`, service_provider: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`, professional: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>` }
  const cc = catColors[contact.category] || 'text-gray-500 bg-gray-50'
  const icon = catIcons[contact.category] || catIcons.emergency
  const subLabel = contact.subcategory || contact.category.replace(/_/g, ' ')
  return `
    <div class="card flex flex-col">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cc}">${icon}</div>
          <div class="min-w-0">
            <p class="font-semibold text-sm text-pomp-navy truncate">${escHtml(contact.name)}</p>
            <p class="text-xs text-gray-400 truncate">${propName ? `${escHtml(propName)} — ` : ''}${escHtml(subLabel)}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button data-edit="${contact.id}" class="text-gray-300 hover:text-pomp-blue transition-colors shrink-0 p-1" title="Edit contact">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button data-delete="${contact.id}" class="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1" title="Delete contact">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2 text-xs text-gray-600">
        ${contact.phone ? `<span class="flex items-center gap-1 truncate"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${contact.phone}" class="hover:text-pomp-blue truncate">${escHtml(contact.phone)}</a></span>` : ''}
        ${contact.email ? `<span class="flex items-center gap-1 truncate"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><a href="mailto:${contact.email}" class="hover:text-pomp-blue truncate">${escHtml(contact.email)}</a></span>` : ''}
      </div>
      ${contact.notes ? `<p class="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">${escHtml(contact.notes)}</p>` : ''}
    </div>`
}

function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

export function renderContacts(container) {
  const { properties } = getState()
  let contacts = []
  let filterProp = new URLSearchParams(window.location.search).get('property_id') || ''
  let filterCat = ''
  let showForm = false
  let editingId = null
  let form = { property_id: '', category: 'emergency', subcategory: '', name: '', phone: '', email: '', notes: '' }
  let page = 1
  const pageSize = 12

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="page-title">Property Contacts</h2>
          <p class="page-sub">Emergency, service and professional contacts per property</p>
        </div>
        <div class="flex gap-2">
          <button id="contacts-export" class="btn-secondary text-xs">Export CSV</button>
          <button id="contacts-add" class="btn-primary text-xs flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Contact
          </button>
        </div>
      </div>
      <div class="flex gap-2 mb-4 flex-wrap shrink-0">
        <select id="contacts-prop-filter" class="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-pomp-blue">
          <option value="">All Properties</option>
          ${properties.filter(p => p.name !== 'The Studio').map(p => `<option value="${p.id}"${filterProp === p.id ? ' selected' : ''}>${escHtml(p.name)}</option>`).join('')}
        </select>
        <select id="contacts-cat-filter" class="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-pomp-blue">
          <option value="">All Categories</option>
          <option value="emergency">Emergency</option>
          <option value="service_provider">Service Provider</option>
          <option value="professional">Professional</option>
        </select>
      </div>
      <div id="contacts-list" class="flex-1 min-h-0 overflow-y-auto"></div>
      <div id="contacts-pagination" class="shrink-0"></div>
    </div>
    <div id="contacts-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"></div>
    <div id="contacts-confirm" class="hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40"></div>
  `

  async function load() {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    if (filterCat) params.set('category', filterCat)
    try { contacts = await apiClient.get(`/property-contacts?${params}`) || [] } catch { contacts = [] }
    renderList()
  }

  function renderList() {
    const totalPages = Math.max(1, Math.ceil(contacts.length / pageSize))
    const start = (page - 1) * pageSize
    const pg = contacts.slice(start, start + pageSize)

    const list = $('contacts-list')
    if (pg.length === 0) {
      list.innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-16 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 mb-4 mx-auto"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/></svg><h3 class="font-heading font-semibold text-gray-400 text-base mb-1">No data</h3><p class="text-sm text-gray-400">No contacts found. Add one to get started.</p></div>'
    } else {
      list.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="contacts-grid"></div>'
      $('contacts-grid').innerHTML = pg.map(c => {
        const propName = properties.find(p => p.id === c.property_id)?.name || c.property_id
        return contactCard(c, propName)
      }).join('')
      // Wire edit/delete buttons
      list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editContact(contacts.find(c => c.id === b.dataset.edit))))
      list.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => showDeleteConfirm(b.dataset.delete)))
    }

    // Pagination
    $('contacts-pagination').innerHTML = contacts.length === 0 ? '' : `
      <div class="flex items-center justify-between text-xs text-gray-500 mt-3">
        <span>${(start+1).toLocaleString()}–${Math.min(start + pageSize, contacts.length).toLocaleString()} of ${contacts.length.toLocaleString()}</span>
        <div class="flex items-center gap-1">
          <button id="pg-prev" ${page <= 1 ? 'disabled' : ''} class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="px-2">Page ${page} of ${totalPages || 1}</span>
          <button id="pg-next" ${page >= totalPages ? 'disabled' : ''} class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>`
    const prev = $('pg-prev'); const next = $('pg-next')
    if (prev) prev.addEventListener('click', () => { if (page > 1) { page--; renderList() } })
    if (next) next.addEventListener('click', () => { if (page < totalPages) { page++; renderList() } })
  }

  function showFormModal() {
    const modal = $('contacts-modal')
    modal.classList.remove('hidden')
    const isEdit = !!editingId
    modal.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">${isEdit ? 'Edit Contact' : 'Add New Contact'}</h3>
          <button onclick="document.getElementById('contacts-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Property <span class="text-red-500">*</span></label>
            <select id="form-prop" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-pomp-blue">
              <option value="">Select property</option>
              ${properties.filter(p => p.name !== 'The Studio').map(p => `<option value="${p.id}"${form.property_id === p.id ? ' selected' : ''}>${escHtml(p.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="form-cat" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-pomp-blue">
              <option value="emergency"${form.category === 'emergency' ? ' selected' : ''}>Emergency</option>
              <option value="service_provider"${form.category === 'service_provider' ? ' selected' : ''}>Service Provider</option>
              <option value="professional"${form.category === 'professional' ? ' selected' : ''}>Professional</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <input id="form-subcat" value="${escHtml(form.subcategory)}" placeholder="e.g. Plumber, Electrician" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pomp-blue">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
            <input id="form-name" value="${escHtml(form.name)}" placeholder="Contact name" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pomp-blue" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input id="form-phone" value="${escHtml(form.phone)}" type="tel" placeholder="Phone number" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pomp-blue">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="form-email" value="${escHtml(form.email)}" type="email" placeholder="Email address" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pomp-blue">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="form-notes" rows="3" placeholder="Additional notes" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pomp-blue">${escHtml(form.notes)}</textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="document.getElementById('contacts-modal').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button id="form-save" class="px-4 py-2 text-sm font-medium text-white rounded-lg bg-pomp-blue hover:bg-pomp-navy">${isEdit ? 'Save Changes' : 'Save Contact'}</button>
        </div>
      </div>`

    $('form-save').addEventListener('click', saveContact)
  }

  function collectForm() {
    return {
      property_id: $('form-prop').value,
      category: $('form-cat').value,
      subcategory: $('form-subcat').value,
      name: $('form-name').value,
      phone: $('form-phone').value,
      email: $('form-email').value,
      notes: $('form-notes').value,
    }
  }

  async function saveContact() {
    const data = collectForm()
    if (!data.property_id || !data.name) return
    try {
      if (editingId) await apiClient.put(`/property-contacts/${editingId}`, data)
      else await apiClient.post('/property-contacts', data)
      $('contacts-modal').classList.add('hidden')
      editingId = null
      form = { property_id: '', category: 'emergency', subcategory: '', name: '', phone: '', email: '', notes: '' }
      load()
    } catch {}
  }

  function editContact(c) {
    if (!c) return
    editingId = c.id
    form = { property_id: c.property_id || '', category: c.category || 'emergency', subcategory: c.subcategory || '', name: c.name || '', phone: c.phone || '', email: c.email || '', notes: c.notes || '' }
    showFormModal()
  }

  function showDeleteConfirm(id) {
    const confirm = $('contacts-confirm')
    confirm.classList.remove('hidden')
    confirm.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">Delete Contact</h3>
          <button onclick="this.closest('#contacts-confirm').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-4">
          <div class="flex items-start gap-3 bg-red-50 rounded-lg p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p class="text-sm text-gray-700">Are you sure you want to delete this contact? This action cannot be undone.</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="this.closest('#contacts-confirm').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button id="confirm-del-btn" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>`
    $('confirm-del-btn').addEventListener('click', async () => {
      try { await apiClient.del(`/property-contacts/${id}`); $('contacts-confirm').classList.add('hidden'); load() } catch {}
    })
  }

  $('contacts-prop-filter').addEventListener('change', e => {
    filterProp = e.target.value; page = 1; load()
    const params = new URLSearchParams(window.location.search)
    if (filterProp) params.set('property_id', filterProp); else params.delete('property_id')
    window.history.replaceState({}, '', '?' + params.toString())
  })
  $('contacts-cat-filter').addEventListener('change', e => { filterCat = e.target.value; page = 1; load() })
  $('contacts-add').addEventListener('click', () => { editingId = null; form = { property_id: filterProp, category: 'emergency', subcategory: '', name: '', phone: '', email: '', notes: '' }; showFormModal() })
  $('contacts-export').addEventListener('click', () => exportCSV('contacts.csv', contacts, [{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'category', label: 'Category' }]))

  load()
}
