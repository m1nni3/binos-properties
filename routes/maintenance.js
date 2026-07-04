import { $, el, render, apiClient, formatRand } from '../lib/utils.js'
import { getState } from '../lib/cache.js'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
]

export function renderMaintenance(container) {
  const { properties } = getState()
  let data = null
  let selectedItem = null
  let detailView = false
  let filterProp = ''
  let filterCategory = ''
  let currentPage = 1
  let uploading = false

  function escHtml(s) {
    if (!s) return ''
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="shrink-0 mb-4">
        <h2 class="font-heading text-xl font-bold text-pomp-navy">Maintenance Tracker</h2>
        <p class="text-xs text-gray-400">Track maintenance transactions and manage reports & images</p>
      </div>
      <div id="maintenance-content" class="flex-1 min-h-0 overflow-y-auto"></div>
    </div>
  `

  function renderList() {
    const content = $('maintenance-content')
    content.innerHTML = `
      <div class="flex gap-2 mb-4 flex-wrap items-center shrink-0">
        <select id="maint-prop-filter" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          ${properties.filter(p => p.name !== 'The Studio').map(p => 
            `<option value="${p.id}"${filterProp === p.id ? ' selected' : ''}>${escHtml(p.name)}</option>`
          ).join('')}
        </select>
        <select id="maint-cat-filter" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          ${CATEGORIES.map(c => `<option value="${c.value}"${filterCategory === c.value ? ' selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <div id="maint-entries" class="space-y-2"></div>
      <div id="maint-pagination" class="flex justify-center mt-4"></div>
    `
    loadEntries()
    wireEvents()
  }

  async function loadEntries() {
    try {
      const params = new URLSearchParams()
      if (filterProp) params.set('property_id', filterProp)
      if (filterCategory) params.set('status', filterCategory)
      params.set('page', currentPage.toString())
      params.set('pageSize', '50')
      
      data = await apiClient.get(`/maintenance?${params}`)
      renderEntries()
      renderPagination()
    } catch (err) {
      console.error('Failed to load maintenance entries:', err)
    }
  }

  function renderEntries() {
    const list = $('maint-entries')
    if (!data?.entries?.length) {
      list.innerHTML = `
        <div class="bg-white rounded-card shadow-[0_0.3rem_1rem_rgba(0,0,0,.06)] p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-300 mb-4">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-400 mb-2">No Maintenance Items</h3>
          <p class="text-sm text-gray-400">No transactions found matching your filters.</p>
        </div>`
      return
    }

    list.innerHTML = data.entries.map(entry => {
      const propName = entry.property_name || properties.find(p => p.id === entry.property_id)?.name || ''
      const amount = entry.debit > 0 ? entry.debit : entry.credit
      const isDebit = entry.debit > 0
      
      return `
        <div class="card hover:shadow-[0_0.5rem_1.5rem_rgba(0,0,0,.1)] transition-all cursor-pointer border-l-4 ${isDebit ? 'border-l-orange-400' : 'border-l-green-400'}" 
             data-entry-id="${entry.id}">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center ${isDebit ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="font-medium text-sm text-pomp-navy truncate max-w-md">${escHtml(entry.description || 'No description')}</p>
                <p class="text-xs text-gray-400 mt-0.5">${entry.date || ''}${propName ? ` · ${escHtml(propName)}` : ''}</p>
                ${entry.category ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mt-1">${escHtml(entry.category)}</span>` : ''}
              </div>
            </div>
            <div class="text-right shrink-0 ml-3">
              <span class="font-bold text-sm ${isDebit ? 'text-orange-600' : 'text-green-600'}">
                ${isDebit ? '-' : '+'}${formatRand(amount)}
              </span>
              ${entry.balance ? `<p class="text-xs text-gray-400 mt-0.5">Bal: ${formatRand(entry.balance)}</p>` : ''}
            </div>
          </div>
        </div>`
    }).join('')

    list.querySelectorAll('[data-entry-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.entryId
        openDetail(id)
      })
    })
  }

  function renderPagination() {
    const pag = $('maint-pagination')
    if (!data || data.totalPages <= 1) {
      pag.innerHTML = ''
      return
    }

    const pages = []
    for (let i = 1; i <= data.totalPages; i++) {
      if (i === 1 || i === data.totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }

    pag.innerHTML = `
      <div class="flex items-center gap-1">
        ${currentPage > 1 ? `<button id="prev-page" class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">← Prev</button>` : ''}
        ${pages.map(p => p === '...' 
          ? '<span class="px-2 py-1 text-sm text-gray-400">...</span>'
          : `<button class="page-btn px-3 py-1 text-sm border rounded ${p === currentPage ? 'bg-pomp-navy text-white' : 'border-gray-300 hover:bg-gray-50'}" data-page="${p}">${p}</button>`
        ).join('')}
        ${currentPage < data.totalPages ? `<button id="next-page" class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">Next →</button>` : ''}
      </div>`

    pag.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page)
        loadEntries()
      })
    })

    if ($('prev-page')) $('prev-page').addEventListener('click', () => { currentPage--; loadEntries() })
    if ($('next-page')) $('next-page').addEventListener('click', () => { currentPage++; loadEntries() })
  }

  async function openDetail(id) {
    try {
      selectedItem = await apiClient.get(`/maintenance/${id}`)
      detailView = true
      renderDetail()
    } catch (err) {
      console.error('Failed to load maintenance detail:', err)
    }
  }

  function renderDetail() {
    if (!selectedItem) return
    
    const content = $('maintenance-content')
    const propName = selectedItem.property_name || properties.find(p => p.id === selectedItem.property_id)?.name || ''
    const amount = selectedItem.debit > 0 ? selectedItem.debit : selectedItem.credit
    const isDebit = selectedItem.debit > 0

    content.innerHTML = `
      <div class="mb-4">
        <button id="back-btn" class="text-sm text-pomp-blue hover:underline flex items-center gap-1 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Maintenance List
        </button>
        <div class="bg-white rounded-card shadow-[0_0.3rem_1rem_rgba(0,0,0,.06)] p-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-heading text-lg font-bold text-pomp-navy">${escHtml(selectedItem.description || 'Maintenance Item')}</h3>
              <p class="text-sm text-gray-400 mt-1">${selectedItem.date || ''} · ${escHtml(propName)}</p>
            </div>
            <span class="font-bold text-lg ${isDebit ? 'text-orange-600' : 'text-green-600'}">
              ${isDebit ? '-' : '+'}${formatRand(amount)}
            </span>
          </div>
          ${selectedItem.category ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mt-2">${escHtml(selectedItem.category)}</span>` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-white rounded-card shadow-[0_0.3rem_1rem_rgba(0,0,0,.06)] p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-heading font-semibold text-sm text-pomp-navy">Images</h4>
            <button id="upload-image" class="text-sm text-pomp-blue hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Image
            </button>
          </div>
          <div id="images-grid" class="grid grid-cols-2 gap-2">
            ${renderImages(selectedItem.images || [])}
          </div>
        </div>

        <div class="bg-white rounded-card shadow-[0_0.3rem_1rem_rgba(0,0,0,.06)] p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-heading font-semibold text-sm text-pomp-navy">Invoices & Reports</h4>
            <button id="upload-invoice" class="text-sm text-pomp-blue hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Invoice
            </button>
          </div>
          <div id="invoices-grid" class="space-y-2">
            ${renderInvoices(selectedItem.invoices || [])}
          </div>
        </div>
      </div>

      <div class="mt-4 bg-white rounded-card shadow-[0_0.3rem_1rem_rgba(0,0,0,.06)] p-4">
        <h4 class="font-heading font-semibold text-sm text-pomp-navy mb-3">Transaction Details</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-gray-500">Date</p>
            <p class="font-medium">${selectedItem.date || '-'}</p>
          </div>
          <div>
            <p class="text-gray-500">Amount</p>
            <p class="font-medium ${isDebit ? 'text-orange-600' : 'text-green-600'}">${formatRand(amount)}</p>
          </div>
          <div>
            <p class="text-gray-500">Reference</p>
            <p class="font-medium">${selectedItem.reference || '-'}</p>
          </div>
          <div>
            <p class="text-gray-500">Balance</p>
            <p class="font-medium">${selectedItem.balance ? formatRand(selectedItem.balance) : '-'}</p>
          </div>
        </div>
      </div>

      <input type="file" id="image-input" accept="image/*" multiple class="hidden">
      <input type="file" id="invoice-input" accept=".pdf,image/*" class="hidden">
    `

    wireDetailEvents()
  }

  function renderImages(images) {
    if (!images.length) {
      return `
        <div class="col-span-2 text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-300 mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <p class="text-xs text-gray-400">No images uploaded</p>
        </div>`
    }

    return images.map(img => `
      <div class="relative group">
        <img src="" alt="" class="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80" 
             data-img-key="${img.key}" data-img-name="${img.key.split('/').pop()}">
        <button class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                data-delete-img="${img.key.split('/').pop()}">
          ×
        </button>
      </div>`).join('')
  }

  function renderInvoices(invoices) {
    if (!invoices.length) {
      return `
        <div class="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-300 mb-2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p class="text-xs text-gray-400">No invoices uploaded</p>
        </div>`
    }

    return invoices.map(inv => {
      const name = inv.key.split('/').pop()
      const isPdf = name.endsWith('.pdf')
      return `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded flex items-center justify-center ${isPdf ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isPdf 
                  ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'
                  : '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'}
              </svg>
            </div>
            <span class="text-sm truncate max-w-[150px]">${name}</span>
          </div>
          <button class="text-red-500 hover:text-red-700" data-delete-inv="${name}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>`
    }).join('')
  }

  function wireEvents() {
    const propFilter = $('maint-prop-filter')
    const catFilter = $('maint-cat-filter')
    
    if (propFilter) propFilter.addEventListener('change', e => { filterProp = e.target.value; currentPage = 1; loadEntries() })
    if (catFilter) catFilter.addEventListener('change', e => { filterCategory = e.target.value; currentPage = 1; loadEntries() })
  }

  function wireDetailEvents() {
    $('back-btn')?.addEventListener('click', () => {
      detailView = false
      selectedItem = null
      renderList()
    })

    $('upload-image')?.addEventListener('click', () => {
      $('image-input')?.click()
    })

    $('upload-invoice')?.addEventListener('click', () => {
      $('invoice-input')?.click()
    })

    $('image-input')?.addEventListener('change', async (e) => {
      const files = e.target.files
      if (!files?.length || !selectedItem) return
      
      uploading = true
      for (const file of files) {
        try {
          await apiClient.post(`/maintenance/${selectedItem.id}/images`, file)
        } catch (err) {
          console.error('Failed to upload image:', err)
        }
      }
      uploading = false
      openDetail(selectedItem.id)
    })

    $('invoice-input')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0]
      if (!file || !selectedItem) return
      
      uploading = true
      try {
        await apiClient.post(`/maintenance/${selectedItem.id}/invoices`, file)
      } catch (err) {
        console.error('Failed to upload invoice:', err)
      }
      uploading = false
      openDetail(selectedItem.id)
    })

    document.querySelectorAll('[data-delete-img]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const filename = btn.dataset.deleteImg
        if (!confirm(`Delete image ${filename}?`)) return
        try {
          await apiClient.del(`/maintenance/${selectedItem.id}/images/${filename}`)
          openDetail(selectedItem.id)
        } catch (err) {
          console.error('Failed to delete image:', err)
        }
      })
    })

    document.querySelectorAll('[data-delete-inv]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const filename = btn.dataset.deleteInv
        if (!confirm(`Delete invoice ${filename}?`)) return
        try {
          await apiClient.del(`/maintenance/${selectedItem.id}/invoices/${filename}`)
          openDetail(selectedItem.id)
        } catch (err) {
          console.error('Failed to delete invoice:', err)
        }
      })
    })
  }

  renderList()
}
