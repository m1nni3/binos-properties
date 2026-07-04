import { $, el, render } from './lib/utils.js'
import { initCache, getState, subscribe } from './lib/cache.js'
import { renderProperties } from './routes/properties.js'
import { renderFinances } from './routes/finances.js'
import { renderContacts } from './routes/contacts.js'
import { renderPettyCash } from './routes/petty-cash.js'
import { renderDebrief } from './routes/debrief.js'
import { renderTasks } from './routes/tasks.js'
import { renderPortals } from './routes/portals.js'
import { renderActivity } from './routes/activity.js'
import { renderMaintenance } from './routes/maintenance.js'

const sections = [
  {
    label: 'Portfolio',
    items: [
      { name: 'Properties', path: '/properties', icon: 'building2', color: 'blue' },
      { name: 'Contacts',   path: '/contacts',   icon: 'phone', color: 'green' },
    ],
  },
  {
    label: 'Financials',
    items: [
      { name: 'P & L', path: '/finances', icon: 'chart', color: 'orange' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Maintenance', path: '/maintenance', icon: 'wrench', color: 'pink' },
      { name: 'Debrief', path: '/debrief', icon: 'message', color: 'purple' },
      { name: 'Tasks',   path: '/tasks',   icon: 'check', color: 'cyan' },
    ],
  },
  {
    label: 'Oversight',
    items: [
      { name: 'Petty Cash', path: '/petty-cash', icon: 'wallet', color: 'green' },
    ],
  },
  {
    label: 'Portals',
    items: [
      { name: 'Portals', path: '/portals', icon: 'globe', color: 'blue' },
    ],
  },
]

const ICONS = {
  building2: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
  message: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  wrench: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  spinner: `<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-binos-blue"></div>`,
}

let currentRoute = '/properties'
let sidebarOpen = false

function navigate(path) {
  currentRoute = path
  window.history.pushState({}, '', path)
  renderContent()
  if (sidebarOpen) { sidebarOpen = false; updateSidebar() }
}

function updateSidebar() {
  const sidebar = $('sidebar')
  if (!sidebar) return
  sidebar.className = sidebarOpen
    ? 'fixed lg:static z-50 lg:z-auto w-[240px] lg:w-[220px] bg-binos-navy flex flex-col transition-transform duration-300 translate-x-0'
    : 'fixed lg:static z-50 lg:z-auto w-[240px] lg:w-[220px] bg-binos-navy flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0'
}

function renderLayout() {
  const root = $('root')
  root.innerHTML = ''
  root.append(el('div', { className: 'flex h-screen overflow-hidden' },
    // Mobile overlay
    el('div', { id: 'sidebar-overlay', className: 'fixed inset-0 bg-black/40 z-40 lg:hidden hidden', onClick: () => { sidebarOpen = false; updateSidebar(); document.getElementById('sidebar-overlay').classList.add('hidden') } }),
    // Sidebar
    el('aside', { id: 'sidebar', className: 'fixed lg:static z-50 lg:z-auto w-[240px] lg:w-[220px] bg-binos-navy flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0' },
      // Logo
      el('div', { className: 'p-5 border-b border-white/10' },
        el('div', { className: 'flex items-center gap-3' },
          el('img', { src: '/favicon.png', alt: 'Binos', className: 'w-12 h-12 rounded-xl' }),
          el('div', null,
            el('h1', { className: 'text-white font-heading font-bold text-lg tracking-tight' }, 'Binos'),
            el('p', { className: 'text-white/50 text-xs' }, 'Property Management')
          )
        )
      ),
      // Navigation
      el('nav', { id: 'sidebar-nav', className: 'flex-1 overflow-y-auto p-3 space-y-1' }),
      // Footer
      el('div', { className: 'p-3 border-t border-white/10' },
        el('a', { href: '#', className: 'sidebar-link', onClick: (e) => { e.preventDefault(); /* settings */ } },
          ICONS.settings, el('span', null, 'Settings')
        )
      )
    ),
    // Main content
    el('main', { className: 'flex-1 flex flex-col overflow-hidden bg-binos-light' },
      // Top bar
      el('div', { className: 'bg-white border-b border-binos-border px-4 lg:px-6 py-3 flex items-center justify-between' },
        // Mobile menu
        el('button', { id: 'menu-btn', onClick: () => { sidebarOpen = true; updateSidebar(); document.getElementById('sidebar-overlay').classList.remove('hidden') }, className: 'lg:hidden text-binos-gray hover:text-binos-navy p-1' }, ICONS.menu),
        // Search
        el('div', { className: 'hidden lg:flex items-center gap-2 bg-binos-light rounded-lg px-4 py-2 w-96' },
          el('span', { className: 'text-binos-gray' }, ICONS.search),
          el('input', { type: 'text', placeholder: 'Search properties, tenants, invoices...', className: 'bg-transparent border-none outline-none text-sm w-full text-binos-navy placeholder-binos-gray' })
        ),
        // Right actions
        el('div', { className: 'flex items-center gap-3' },
          el('button', { className: 'relative text-binos-gray hover:text-binos-navy p-2' },
            ICONS.bell,
            el('span', { className: 'absolute -top-0.5 -right-0.5 w-4 h-4 bg-binos-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center' }, '3')
          ),
          el('button', { className: 'w-9 h-9 rounded-full bg-binos-navy text-white flex items-center justify-center' },
            ICONS.user
          )
        )
      ),
      // Page content
      el('div', { id: 'page-content', className: 'p-4 lg:p-6 flex-1 flex flex-col min-h-0 overflow-y-auto' })
    )
  ))

  // Build sidebar nav
  const nav = $('sidebar-nav')
  sections.forEach(section => {
    nav.append(
      el('div', { className: 'text-white/40 text-xs uppercase tracking-wider font-semibold px-3 py-2 mt-2' }, section.label),
      ...section.items.map(item =>
        el('a', {
          href: item.path,
          className: 'sidebar-link' + (currentRoute === item.path ? ' active' : ''),
          onClick: (e) => { e.preventDefault(); navigate(item.path) }
        },
          el('span', { className: `sidebar-icon sidebar-icon-${item.color}` }, ICONS[item.icon]),
          el('span', null, item.name)
        )
      )
    )
  })

  renderContent()
}

function renderContent() {
  const page = $('page-content')
  if (!page) return
  page.innerHTML = ''

  const renderer = {
    '/properties': renderProperties,
    '/contacts': renderContacts,
    '/finances': renderFinances,
    '/governance': renderGovernance,
    '/petty-cash': renderPettyCash,
    '/maintenance': renderMaintenance,
    '/debrief': renderDebrief,
    '/tasks': renderTasks,
    '/portals': renderPortals,
    '/activity': renderActivity,
  }[currentRoute] || renderGovernance

  renderer(page)

  // Update sidebar active state
  document.querySelectorAll('#sidebar-nav .sidebar-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === currentRoute)
  })
}

function renderGovernance(container) {
  container.innerHTML = `
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="page-title">Governance</h2>
        <p class="page-sub">Trust governance, meetings, and compliance</p>
      </div>
    </div>
    <div class="bg-white rounded-card shadow-card p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-slate-300 mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <h3 class="text-lg font-semibold text-slate-400 mb-2">Coming Soon</h3>
      <p class="text-sm text-slate-400">Meeting minutes, resolutions, and compliance tracking will appear here.</p>
    </div>
  `
}

// Init
window.addEventListener('popstate', () => {
  currentRoute = window.location.pathname
  renderContent()
})

initCache()
renderLayout()
