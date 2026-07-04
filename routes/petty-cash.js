import { $, el, render } from '../lib/utils.js'
import { apiClient, formatRand } from '../lib/utils.js'
import { getState } from '../lib/cache.js'

export function renderPettyCash(container) {
  const { properties } = getState()
  let data = null
  let filterProp = ''
  let showIncome = false, showExpense = false
  let incForm = { date: '', description: '', amount: '', category: '', notes: '' }
  let expForm = { date: '', description: '', amount: '', category: '', supplier: '', vat_inclusive: true, notes: '' }
  let confirmDelete = null

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex items-center justify-between shrink-0 mb-3">
        <div>
          <h2 class="font-heading text-xl font-bold text-pomp-navy">Petty Cash</h2>
          <p class="text-xs text-gray-400">Track income and expenses</p>
        </div>
      </div>
      <div class="kpi-row" id="pc-kpis"></div>
      <div class="flex gap-2 mb-4 flex-wrap items-center justify-between shrink-0">
        <select id="pc-filter" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          ${properties.filter(p => p.name !== 'The Studio').map(p => `<option value="${p.id}">${escHtml(p.name)}</option>`).join('')}
        </select>
        <div class="flex gap-2">
          <button id="pc-add-income" class="btn-primary text-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Income
          </button>
          <button id="pc-add-expense" class="btn-primary text-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Expense
          </button>
        </div>
      </div>
      <div id="pc-income-form" class="hidden"></div>
      <div id="pc-expense-form" class="hidden"></div>
      <div id="pc-entries" class="flex-1 min-h-0 overflow-y-auto space-y-1.5"></div>
    </div>
    <div id="pc-confirm" class="hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40"></div>
  `

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  async function load() {
    const params = new URLSearchParams()
    if (filterProp) params.set('property_id', filterProp)
    try { data = await apiClient.get(`/petty-cash?${params}`) } catch { data = null }
    renderKpis()
    renderEntries()
  }

  function renderKpis() {
    $('pc-kpis').innerHTML = `
      <div class="kpi-card border-t-green-500">
        <p class="text-gray-500 text-xs uppercase">Total Income</p>
        <p class="text-xl font-bold text-green-600">${formatRand(data?.totalIncome || 0)}</p>
      </div>
      <div class="kpi-card border-t-red-500">
        <p class="text-gray-500 text-xs uppercase">Total Expenses</p>
        <p class="text-xl font-bold text-red-600">${formatRand(data?.totalExpenses || 0)}</p>
      </div>
      <div class="kpi-card border-t-pomp-blue">
        <p class="text-gray-500 text-xs uppercase">Balance</p>
        <p class="text-xl font-bold ${(data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}">${formatRand(data?.balance || 0)}</p>
      </div>`
  }

  function renderEntries() {
    const all = [
      ...(data?.income || []).map(r => ({ ...r, type: 'income' })),
      ...(data?.expenses || []).map(r => ({ ...r, type: 'expense' })),
    ].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    const list = $('pc-entries')
    if (all.length === 0) {
      list.innerHTML = '<p class="text-sm text-gray-400 italic">No entries yet. Add income or expenses above.</p>'
      return
    }
    list.innerHTML = all.map(e => {
      const isInc = e.type === 'income'
      const propName = properties.find(p => p.id === e.property_id)?.name || ''
      const vat = isInc ? 0 : e.vat_inclusive ? e.amount * 15 / 115 : e.amount * 0.15
      return `
        <div class="card flex items-start justify-between py-2.5 ${isInc ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-400'}">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center ${isInc ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div>
              <p class="font-medium text-sm text-pomp-navy">${escHtml(e.description || '')}</p>
              <p class="text-xs text-gray-400">${e.date || ''}${propName ? ` · ${escHtml(propName)}` : ''}${e.category ? ` · ${escHtml(e.category)}` : ''}</p>
              ${!isInc && e.supplier ? `<p class="text-xs text-gray-400">Supplier: ${escHtml(e.supplier)}</p>` : ''}
              ${!isInc ? `<p class="text-xs text-gray-400">VAT: ${formatRand(vat)} | ${e.vat_inclusive ? 'Incl' : 'Excl'}</p>` : ''}
              ${e.notes ? `<p class="text-xs text-gray-400 mt-0.5">${escHtml(e.notes)}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm ${isInc ? 'text-green-600' : 'text-red-600'}">${isInc ? '+' : '-'}${formatRand(e.amount)}</span>
            <button data-del="${e.type}|${e.id}" class="text-gray-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>`
    }).join('')
    list.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', () => {
        const [type, id] = b.dataset.del.split('|')
        confirmDelete = { id, type }
        showConfirm()
      })
    })
  }

  function showConfirm() {
    const confirm = $('pc-confirm')
    confirm.classList.remove('hidden')
    confirm.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">Delete Entry</h3>
          <button onclick="this.closest('#pc-confirm').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-4"><div class="flex items-start gap-3 bg-red-50 rounded-lg p-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p class="text-sm text-gray-700">Are you sure you want to delete this entry? This action cannot be undone.</p>
        </div></div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="this.closest('#pc-confirm').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button id="pc-confirm-del" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>`
    $('pc-confirm-del').addEventListener('click', async () => {
      if (!confirmDelete) return
      try {
        if (confirmDelete.type === 'income') await apiClient.del(`/petty-cash/income/${confirmDelete.id}`)
        else await apiClient.del(`/petty-cash/expenses/${confirmDelete.id}`)
        $('pc-confirm').classList.add('hidden')
        confirmDelete = null
        load()
      } catch {}
    })
  }

  // Wire events
  $('pc-filter').addEventListener('change', e => { filterProp = e.target.value; load() })

  $('pc-add-income').addEventListener('click', () => {
    showIncome = !showIncome
    $('pc-income-form').classList.toggle('hidden', !showIncome)
    if (showIncome) {
      $('pc-income-form').innerHTML = `
        <div class="card mb-4 border-2 border-green-500/30">
          <h4 class="font-semibold text-sm text-green-600 mb-3">New Income</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input id="inc-date" type="date" value="${incForm.date}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="inc-desc" placeholder="Description" value="${escHtml(incForm.description)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="inc-amount" type="number" step="0.01" placeholder="Amount" value="${incForm.amount}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="inc-cat" placeholder="Category" value="${escHtml(incForm.category)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="inc-notes" placeholder="Notes" value="${escHtml(incForm.notes)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          </div>
          <div class="flex gap-2 mt-3">
            <button id="inc-save" class="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Save</button>
            <button id="inc-cancel" class="text-sm text-gray-500">Cancel</button>
          </div>
        </div>`
      $('inc-save').addEventListener('click', async () => {
        try {
          await apiClient.post('/petty-cash/income', { ...incForm, amount: parseFloat($('inc-amount').value) || 0, date: $('inc-date').value, description: $('inc-desc').value, category: $('inc-cat').value, notes: $('inc-notes').value })
          showIncome = false; $('pc-income-form').classList.add('hidden'); load()
        } catch {}
      })
      $('inc-cancel').addEventListener('click', () => { showIncome = false; $('pc-income-form').classList.add('hidden') })
    }
  })

  $('pc-add-expense').addEventListener('click', () => {
    showExpense = !showExpense
    $('pc-expense-form').classList.toggle('hidden', !showExpense)
    if (showExpense) {
      $('pc-expense-form').innerHTML = `
        <div class="card mb-4 border-2 border-red-500/30">
          <h4 class="font-semibold text-sm text-red-600 mb-3">New Expense</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input id="exp-date" type="date" value="${expForm.date}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="exp-desc" placeholder="Description" value="${escHtml(expForm.description)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="exp-amount" type="number" step="0.01" placeholder="Amount" value="${expForm.amount}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="exp-cat" placeholder="Category" value="${escHtml(expForm.category)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input id="exp-supplier" placeholder="Supplier" value="${escHtml(expForm.supplier)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="exp-vat" ${expForm.vat_inclusive ? 'checked' : ''}> VAT Inclusive</label>
            <input id="exp-notes" placeholder="Notes" value="${escHtml(expForm.notes)}" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          </div>
          <div class="flex gap-2 mt-3">
            <button id="exp-save" class="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700">Save</button>
            <button id="exp-cancel" class="text-sm text-gray-500">Cancel</button>
          </div>
        </div>`
      $('exp-save').addEventListener('click', async () => {
        try {
          await apiClient.post('/petty-cash/expenses', {
            date: $('exp-date').value, description: $('exp-desc').value,
            amount: parseFloat($('exp-amount').value) || 0, category: $('exp-cat').value,
            supplier: $('exp-supplier').value, vat_inclusive: $('exp-vat').checked, notes: $('exp-notes').value
          })
          showExpense = false; $('pc-expense-form').classList.add('hidden'); load()
        } catch {}
      })
      $('exp-cancel').addEventListener('click', () => { showExpense = false; $('pc-expense-form').classList.add('hidden') })
      $('exp-amount')?.addEventListener('input', () => {
        // VAT calc display handled by re-render on save for simplicity
      })
    }
  })

  load()
}
