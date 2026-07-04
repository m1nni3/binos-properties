import { $, el, apiClient, formatRand } from '../lib/utils.js'
import { getState } from '../lib/cache.js'

const CATEGORIES = [
  { key: 'rentalIncome', sign: 1, label: 'Rental Income' },
  { key: 'levy', sign: -1, label: 'Levy' },
  { key: 'bondPayments', sign: -1, label: 'Bond Payment' },
  { key: 'commission', sign: -1, label: 'Commission' },
  { key: 'maintenance', sign: -1, label: 'Maintenance' },
  { key: 'municipal', sign: -1, label: 'Municipal' },
  { key: 'misc', sign: -1, label: 'Misc' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function renderFinances(container) {
  const { properties } = getState()
  let chartIncome = null
  let chartBudget = null
  let year = new Date().getFullYear()
  let filterProp = ''
  let budgets = {}
  let monthly = []
  let entries = []

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex items-center justify-between shrink-0 mb-3">
        <div>
          <h2 class="font-heading text-xl font-bold text-pomp-navy">Profit & Loss</h2>
          <p class="text-xs text-gray-400">Budget vs actual tracking</p>
        </div>
      </div>
      <div class="flex gap-2 mb-4 flex-wrap items-center shrink-0">
        <select id="pl-prop-filter" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">All Properties</option>
          ${properties.filter(p => p.name !== 'The Studio').map(p => `<option value="${p.id}">${escHtml(p.name)}</option>`).join('')}
        </select>
        <select id="pl-year-filter" class="border border-gray-300 rounded px-2 py-1.5 text-sm">
          ${[year-1, year, year+1].map(y => `<option value="${y}"${y===year?' selected':''}>${y}</option>`).join('')}
        </select>
      </div>
      <div class="kpi-row mb-4" id="pl-kpis"></div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div class="card p-4">
          <h3 class="font-heading font-semibold text-sm text-pomp-navy mb-3">Income vs Expenses</h3>
          <canvas id="chart-income" height="220"></canvas>
        </div>
        <div class="card p-4">
          <h3 class="font-heading font-semibold text-sm text-pomp-navy mb-3">Budget vs Actual</h3>
          <canvas id="chart-budget" height="220"></canvas>
        </div>
      </div>
      <div class="card mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-heading font-semibold text-sm text-pomp-navy">Budget Management</h3>
          <button id="pl-save-budget" class="btn-primary text-sm">Save Budget</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm" id="pl-budget-table">
            <thead><tr><th class="text-left py-2 px-2 text-gray-500 font-medium">Category</th><th class="text-right py-2 px-2 text-gray-500 font-medium">Annual Budget</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div class="card mb-4">
        <h3 class="font-heading font-semibold text-sm text-pomp-navy mb-3">Monthly Actuals</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm" id="pl-actuals-table">
            <thead><tr><th class="text-left py-2 px-2 text-gray-500 font-medium">Category</th>${MONTHS.map(m => `<th class="text-right py-2 px-2 text-gray-500 font-medium min-w-[76px]">${m}</th>`).join('')}</thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div class="card mb-4">
        <h3 class="font-heading font-semibold text-sm text-pomp-navy mb-3">Variance</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm" id="pl-variance-table">
            <thead><tr><th class="text-left py-2 px-2 text-gray-500 font-medium">Category</th><th class="text-right py-2 px-2 text-gray-500 font-medium">Budget</th><th class="text-right py-2 px-2 text-gray-500 font-medium">Actual</th><th class="text-right py-2 px-2 text-gray-500 font-medium">Variance</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div class="card mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-heading font-semibold text-sm text-pomp-navy">Entries</h3>
          <button id="pl-add-entry" class="btn-primary text-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Entry
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm" id="pl-entries-table">
            <thead><tr><th class="text-left py-2 px-2 text-gray-500 font-medium">Month</th><th class="text-left py-2 px-2 text-gray-500 font-medium">Category</th><th class="text-right py-2 px-2 text-gray-500 font-medium">Amount</th><th class="text-left py-2 px-2 text-gray-500 font-medium">Description</th><th class="text-left py-2 px-2 text-gray-500 font-medium">Deducted Expenses</th><th class="text-right py-2 px-2 text-gray-500 font-medium"></th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
    <div id="pl-entry-modal" class="hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40"></div>
  `

  async function load() {
    const params = new URLSearchParams({ year })
    if (filterProp) params.set('property_id', filterProp)
    try {
      const [budgetRes, monthlyRes, entriesRes] = await Promise.all([
        apiClient.get(`/pl?${params}`),
        apiClient.get(`/pl-monthly?${params}`),
        apiClient.get(`/pl-entries?${params}`),
      ])
      budgets = {}
      if (budgetRes?.budgets) for (const b of budgetRes.budgets) budgets[b.category] = b.budget
      monthly = Array.isArray(monthlyRes) ? monthlyRes : []
      entries = Array.isArray(entriesRes) ? entriesRes : []
    } catch (e) { budgets = {}; monthly = []; entries = [] }
    renderKpis()
    renderCharts()
    renderBudgetTable()
    renderActualsTable()
    renderVarianceTable()
    renderEntriesTable()
  }

  function renderKpis() {
    const incomeKeys = CATEGORIES.filter(c => c.sign > 0).map(c => c.key)
    const expenseKeys = CATEGORIES.filter(c => c.sign < 0).map(c => c.key)
    const totalIncome = monthly.filter(r => incomeKeys.includes(r.category)).reduce((s, r) => s + (r.actual || 0), 0)
    const totalExpenses = monthly.filter(r => expenseKeys.includes(r.category)).reduce((s, r) => s + (r.actual || 0), 0)
    const netProfit = totalIncome - totalExpenses
    const totalBudget = Object.values(budgets).reduce((s, v) => s + (v || 0), 0)
    $('pl-kpis').innerHTML = `
      <div class="kpi-card border-t-green-500">
        <p class="text-gray-500 text-xs uppercase">Total Income</p>
        <p class="text-xl font-bold text-green-600">${formatRand(totalIncome)}</p>
      </div>
      <div class="kpi-card border-t-red-500">
        <p class="text-gray-500 text-xs uppercase">Total Expenses</p>
        <p class="text-xl font-bold text-red-600">${formatRand(totalExpenses)}</p>
      </div>
      <div class="kpi-card border-t-pomp-blue">
        <p class="text-gray-500 text-xs uppercase">Net Profit</p>
        <p class="text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}">${formatRand(netProfit)}</p>
      </div>
      <div class="kpi-card border-t-purple-500">
        <p class="text-gray-500 text-xs uppercase">Total Budget</p>
        <p class="text-xl font-bold text-purple-600">${formatRand(totalBudget)}</p>
      </div>`
  }

  function getMonthlyByCategory(catKey) {
    return MONTHS.map((_, i) => {
      const m = i + 1
      return monthly.filter(r => r.category === catKey && r.month === m).reduce((s, r) => s + (r.actual || 0), 0)
    })
  }

  function renderCharts() {
    const incomeKeys = CATEGORIES.filter(c => c.sign > 0).map(c => c.key)
    const expenseKeys = CATEGORIES.filter(c => c.sign < 0).map(c => c.key)

    const incomeByMonth = MONTHS.map((_, i) => {
      const m = i + 1
      return monthly.filter(r => incomeKeys.includes(r.category) && r.month === m).reduce((s, r) => s + (r.actual || 0), 0)
    })
    const expensesByMonth = MONTHS.map((_, i) => {
      const m = i + 1
      return monthly.filter(r => expenseKeys.includes(r.category) && r.month === m).reduce((s, r) => s + (r.actual || 0), 0)
    })
    const netByMonth = incomeByMonth.map((inc, i) => inc - expensesByMonth[i])

    if (chartIncome) { chartIncome.destroy(); chartIncome = null }
    if (chartBudget) { chartBudget.destroy(); chartBudget = null }

    const ctx1 = document.getElementById('chart-income')?.getContext('2d')
    if (ctx1) {
      chartIncome = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: MONTHS,
          datasets: [
            { label: 'Income', data: incomeByMonth, backgroundColor: 'rgba(34,197,94,0.7)', borderColor: 'rgb(34,197,94)', borderWidth: 1, order: 2 },
            { label: 'Expenses', data: expensesByMonth, backgroundColor: 'rgba(239,68,68,0.7)', borderColor: 'rgb(239,68,68)', borderWidth: 1, order: 2 },
            { label: 'Net Profit', data: netByMonth, type: 'line', borderColor: 'rgb(59,130,246)', backgroundColor: 'rgba(59,130,246,0.1)', pointBackgroundColor: 'rgb(59,130,246)', pointRadius: 3, fill: true, tension: 0.3, borderWidth: 2, order: 1 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: v => formatRand(v), font: { size: 10 } } },
            x: { ticks: { font: { size: 10 } } },
          },
        },
      })
    }

    const ctx2 = document.getElementById('chart-budget')?.getContext('2d')
    if (ctx2) {
      const labels = CATEGORIES.map(c => c.label)
      const budgetVals = CATEGORIES.map(c => budgets[c.key] || 0)
      const actualVals = CATEGORIES.map(c => monthly.filter(r => r.category === c.key).reduce((s, r) => s + (r.actual || 0), 0))
      chartBudget = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Budget', data: budgetVals, backgroundColor: 'rgba(59,130,246,0.7)', borderColor: 'rgb(59,130,246)', borderWidth: 1 },
            { label: 'Actual', data: actualVals, backgroundColor: 'rgba(34,197,94,0.7)', borderColor: 'rgb(34,197,94)', borderWidth: 1 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: v => formatRand(v), font: { size: 10 } } },
            x: { ticks: { font: { size: 10 } } },
          },
        },
      })
    }
  }

  function renderBudgetTable() {
    const tbody = $('pl-budget-table')?.querySelector('tbody')
    if (!tbody) return
    tbody.innerHTML = CATEGORIES.map(c => `
      <tr>
        <td class="py-2 px-2 text-gray-700">${c.label}</td>
        <td class="py-2 px-2"><input type="number" class="pl-budget-input w-full text-right border border-gray-300 rounded px-2 py-1 text-sm" data-cat="${c.key}" value="${budgets[c.key] || ''}" placeholder="0"></td>
      </tr>`).join('')
  }

  async function saveBudget() {
    const inputs = document.querySelectorAll('.pl-budget-input')
    const payload = { year, property_id: filterProp || null, budgets: {} }
    inputs.forEach(inp => { payload.budgets[inp.dataset.cat] = parseFloat(inp.value) || 0 })
    try { await apiClient.post('/pl', payload); load() } catch {}
  }

  function renderActualsTable() {
    const tbody = $('pl-actuals-table')?.querySelector('tbody')
    if (!tbody) return
    tbody.innerHTML = CATEGORIES.map(c => {
      const vals = getMonthlyByCategory(c.key)
      return `<tr>
        <td class="py-2 px-2 text-gray-700 font-medium">${c.label}</td>
        ${vals.map((v, i) => {
          const monthIdx = i + 1
          const rec = monthly.find(r => r.category === c.key && r.month === monthIdx)
          return `<td class="py-1 px-1 text-right">
            <span class="pl-actual-cell cursor-pointer hover:bg-gray-100 rounded px-1 py-1 inline-block min-w-[60px] text-right text-sm" data-cat="${c.key}" data-month="${monthIdx}" data-id="${rec?.id || ''}">${v ? formatRand(v) : '-'}</span>
          </td>`
        }).join('')}
      </tr>`
    }).join('')

    tbody.querySelectorAll('.pl-actual-cell').forEach(cell => {
      cell.addEventListener('click', function () {
        if (this.querySelector('input')) return
        const cur = this.textContent.trim()
        const val = cur === '-' ? '' : cur.replace(/[^0-9.-]/g, '')
        this.innerHTML = `<input type="number" class="w-full border border-pomp-blue rounded px-1 py-0.5 text-right text-sm" value="${val}" style="min-width:60px">`
        const inp = this.querySelector('input')
        inp.focus()
        inp.select()
        const done = () => {
          const newVal = parseFloat(inp.value) || 0
          const cat = this.dataset.cat
          const month = parseInt(this.dataset.month)
          const id = this.dataset.id
          const saveReq = id
            ? apiClient.put(`/pl-monthly/${id}`, { actual: newVal })
            : apiClient.post('/pl-monthly', { year, property_id: filterProp || null, category: cat, month, actual: newVal })
          saveReq.then(() => load()).catch(() => {})
        }
        inp.addEventListener('blur', done)
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur() })
      })
    })
  }

  function renderVarianceTable() {
    const tbody = $('pl-variance-table')?.querySelector('tbody')
    if (!tbody) return
    tbody.innerHTML = CATEGORIES.map(c => {
      const budget = budgets[c.key] || 0
      const actual = monthly.filter(r => r.category === c.key).reduce((s, r) => s + (r.actual || 0), 0)
      const variance = budget - actual
      return `<tr>
        <td class="py-2 px-2 text-gray-700">${c.label}</td>
        <td class="py-2 px-2 text-right text-gray-700">${formatRand(budget)}</td>
        <td class="py-2 px-2 text-right text-gray-700">${formatRand(actual)}</td>
        <td class="py-2 px-2 text-right font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}">${formatRand(variance)}</td>
      </tr>`
    }).join('')
  }

  function renderEntriesTable() {
    const tbody = $('pl-entries-table')?.querySelector('tbody')
    if (!tbody) return
    if (!entries.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-400 text-sm">No entries yet.</td></tr>'
      return
    }
    tbody.innerHTML = entries.map(e => {
      const cat = CATEGORIES.find(c => c.key === e.category)
      const deducted = Array.isArray(e.deductedExpenses) ? e.deductedExpenses.map(d => CATEGORIES.find(c => c.key === d)?.label || d).join(', ') : ''
      return `<tr>
        <td class="py-2 px-2 text-gray-700">${MONTHS[(e.month || 1) - 1]}</td>
        <td class="py-2 px-2 text-gray-700">${escHtml(cat?.label || e.category)}</td>
        <td class="py-2 px-2 text-right ${cat?.sign > 0 ? 'text-green-600' : 'text-red-600'}">${cat?.sign > 0 ? '+' : '-'}${formatRand(e.amount || 0)}</td>
        <td class="py-2 px-2 text-gray-700">${escHtml(e.description || '')}</td>
        <td class="py-2 px-2 text-gray-500 text-xs">${escHtml(deducted)}</td>
        <td class="py-2 px-2 text-right">
          <button data-del="${e.id}" class="text-gray-300 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>`
    }).join('')
    tbody.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', () => {
        if (!confirm('Delete this entry?')) return
        apiClient.del(`/pl-entries/${b.dataset.del}`).then(() => load()).catch(() => {})
      })
    })
  }

  function showAddEntryModal() {
    const modal = $('pl-entry-modal')
    modal.classList.remove('hidden')
    const expenseCats = CATEGORIES.filter(c => c.sign < 0)
    modal.innerHTML = `
      <div class="bg-white rounded-card shadow-xl w-full max-w-lg">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="font-heading font-semibold text-pomp-navy">Add Entry</h3>
          <button onclick="this.closest('#pl-entry-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-4 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Month</label>
              <select id="pl-entry-month" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                ${MONTHS.map((m, i) => `<option value="${i+1}">${m}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Category</label>
              <select id="pl-entry-category" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                ${CATEGORIES.map(c => `<option value="${c.key}">${c.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Amount</label>
            <input id="pl-entry-amount" type="number" step="0.01" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="0.00">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Description</label>
            <input id="pl-entry-desc" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Description">
          </div>
          <div id="pl-entry-deducted">
            <label class="block text-xs text-gray-500 mb-1">Deducted Expenses (for Rental Income)</label>
            ${expenseCats.map(c => `
              <label class="flex items-center gap-2 text-sm mt-1"><input type="checkbox" class="pl-deducted-cb" value="${c.key}"> ${c.label}</label>
            `).join('')}
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 px-4 pb-4">
          <button onclick="this.closest('#pl-entry-modal').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button id="pl-entry-save" class="px-4 py-2 text-sm font-medium text-white bg-pomp-blue rounded-lg hover:bg-pomp-navy">Save Entry</button>
        </div>
      </div>`

    const catSelect = $('pl-entry-category')
    const deductedDiv = $('pl-entry-deducted')
    function toggleDeducted() { deductedDiv.style.display = catSelect.value === 'rentalIncome' ? 'block' : 'none' }
    toggleDeducted()
    catSelect.addEventListener('change', toggleDeducted)

    $('pl-entry-save').addEventListener('click', async () => {
      const month = parseInt($('pl-entry-month').value)
      const category = $('pl-entry-category').value
      const amount = parseFloat($('pl-entry-amount').value) || 0
      const description = $('pl-entry-desc').value
      const deductedExpenses = category === 'rentalIncome'
        ? Array.from(document.querySelectorAll('.pl-deducted-cb:checked')).map(cb => cb.value)
        : []
      try {
        await apiClient.post('/pl-entries', { year, property_id: filterProp || null, month, category, amount, description, deductedExpenses })
        modal.classList.add('hidden')
        load()
      } catch {}
    })
  }

  $('pl-prop-filter')?.addEventListener('change', e => { filterProp = e.target.value; load() })
  $('pl-year-filter')?.addEventListener('change', e => { year = parseInt(e.target.value); load() })
  $('pl-save-budget')?.addEventListener('click', saveBudget)
  $('pl-add-entry')?.addEventListener('click', showAddEntryModal)

  load()
}
