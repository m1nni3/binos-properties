import { $, el, render } from '../lib/utils.js'
import { getState, subscribe } from '../lib/cache.js'

const DEFAULT_COLOR = { from: 'from-gray-600', to: 'to-gray-800', hex: '#525666' }
const PROP_COLORS = {
  Oakdale:  { from: 'from-[#1E88FF]', to: 'to-[#7A2CFF]', hex: '#1E88FF' },
  Malindi:  { from: 'from-[#43D000]', to: 'to-[#1E88FF]', hex: '#43D000' },
  Indaba:   { from: 'from-[#7A2CFF]', to: 'to-[#FF2D95]', hex: '#7A2CFF' },
  Villeroy: { from: 'from-[#FF8A00]', to: 'to-[#FF2D95]', hex: '#FF8A00' },
}

const SCHEME_MAP = {
  Oakdale:  { agent: 'Trafalgar',     province: 'Western Cape' },
  Malindi:  { agent: 'Kemprent',      province: 'Gauteng'      },
  Indaba:   { agent: 'HuurKor Admin', province: 'Gauteng'      },
  Villeroy: { agent: 'Trafalgar',     province: 'Gauteng'      },
}

// Property detail tabs configuration
const PROPERTY_DETAIL_TABS = [
  'Overview',
  'Lease Details',
  'Maintenance',
  'Documents',
  'Gallery',
  'Images',
  'Insurance',
  'Utilities',
  'Taxes',
  'Bonds',
  'Planning',
  'Schedule',
  'Emergency'  // Fixed typo
]

// Property sections data for each tab
const PROPERTY_SECTIONS = {
  'Overview': [
    { key: 'scheme_name', label: 'Scheme', format: 'text' },
    { key: 'suburb', label: 'Suburb', format: 'text' },
    { key: 'address', label: 'Address', format: 'text' },
    { key: 'owner_name', label: 'Owner', format: 'text' },
    { key: 'managing_agent_name', label: 'Managing Agent', format: 'text' },
    { key: 'size_sqm', label: 'Size (m²)', format: 'number' },
    { key: 'bedrooms', label: 'Bedrooms', format: 'number' },
  ],
  'Lease Details': [
    { key: 'rent_start_date', label: 'Rent Start Date', format: 'date' },
    { key: 'rent_end_date', label: 'Rent End Date', format: 'date' },
    { key: 'monthly_rent', label: 'Monthly Rent', format: 'currency' },
    { key: 'rental_deposit', label: 'Rental Deposit', format: 'currency' },
    { key: 'leasing_agent', label: 'Leasing Agent', format: 'text' },
    { key: 'lease_type', label: 'Lease Type', format: 'text' },
  ],
  'Maintenance': [
    { key: 'maintenance_status', label: 'Status', format: 'text' },
    { key: 'last_maintenance_date', label: 'Last Maintenance', format: 'date' },
    { key: 'next_maintenance_due', label: 'Next Due', format: 'date' },
    { key: 'maintenance_provider', label: 'Provider', format: 'text' },
    { key: 'warranty_expiry', label: 'Warranty Expiry', format: 'date' },
  ],
  'Documents': [
    { key: 'lease_document', label: 'Lease Agreement', format: 'text' },
    { key: 'ids_copy', label: 'IDS Copy', format: 'text' },
    { key: 'property_insurance', label: 'Property Insurance', format: 'text' },
    { key: 'additional_docs', label: 'Additional Docs', format: 'text' },
  ],
  'Gallery': [
    { key: 'gallery_images', label: 'Gallery Images', format: 'text' },
    { key: 'virtual_tour_link', label: 'Virtual Tour', format: 'text' },
    { key: 'floor_plan', label: 'Floor Plan', format: 'text' },
  ],
  'Images': [
    { key: 'exterior_images', label: 'Exterior Images', format: 'text' },
    { key: 'interior_images', label: 'Interior Images', format: 'text' },
    { key: '360_view_link', label: '360° View', format: 'text' },
  ],
  'Insurance': [
    { key: 'building_insurance', label: 'Building Insurance', format: 'text' },
    { key: 'contents_insurance', label: 'Contents Insurance', format: 'text' },
    { key: 'liability_insurance', label: 'Liability Insurance', format: 'text' },
    { key: 'insurance_provider', label: 'Provider', format: 'text' },
  ],
  'Utilities': [
    { key: 'water_supplier', label: 'Water Supplier', format: 'text' },
    { key: 'electricity_provider', label: 'Electricity Provider', format: 'text' },
    { key: 'gas_provider', label: 'Gas Provider', format: 'text' },
    { key: 'internet_provider', label: 'Internet Provider', format: 'text' },
  ],
  'Taxes': [
    { key: 'property_tax', label: 'Property Tax', format: 'currency' },
    { key: 'vatt_status', label: 'VAT Status', format: 'text' },
    { key: 'tax_clearance', label: 'Tax Clearance', format: 'date' },
    { key: 'tax_assessment_year', label: 'Assessment Year', format: 'text' },
  ],
  'Bonds': [
    { key: 'bond_details', label: 'Bond Details', format: 'text' },
    { key: 'bond_bank', label: 'Bank', format: 'text' },
    { key: 'bond_monthly_payment', label: 'Monthly Payment', format: 'currency' },
    { key: 'bond_term', label: 'Term', format: 'text' },
  ],
  'Planning': [
    { key: 'development_plan', label: 'Development Plan', format: 'text' },
    { key: 'zoning_classification', label: 'Zoning', format: 'text' },
    { key: 'permits_required', label: 'Permits', format: 'boolean' },
    { key: 'planning_status', label: 'Planning Status', format: 'text' },
  ],
  'Schedule': [
    { key: 'maintenance_schedule', label: 'Maintenance Schedule', format: 'text' },
    { key: 'inspection_schedule', label: 'Inspection Schedule', format: 'text' },
    { key: 'appointment_slots', label: 'Available Slots', format: 'text' },
  ],
  'Emergency': [
    { key: 'emergency_contact', label: 'Emergency Contact', format: 'text' },
    { key: 'medical_emergency_contact', label: 'Medical Contact', format: 'text' },
    { key: 'police_emergency_contact', label: 'Police Contact', format: 'text' },
  ],
}

// Contact filters by tab
const TAB_CONTACT_FILTERS = {
  'Overview': null,
  'Lease Details': null,
  'Maintenance': c => c.category === 'maintenance' || c.subcategory === 'maintenance',
  'Documents': c => c.category === 'document' || c.subcategory === 'document',
  'Gallery': c => c.category === 'gallery' || c.subcategory === 'gallery',
  'Images': c => c.category === 'image' || c.subcategory === 'image',
  'Emergency': c => c.category === 'emergency',
  'Insurance': c => c.category === 'insurance' || c.subcategory === 'insurance',
  'Utilities': c => c.category === 'utility' || c.subcategory === 'utility',
  'Taxes': c => c.category === 'tax' || c.subcategory === 'tax',
  'Bonds': c => c.category === 'bond' || c.subcategory === 'bond',
  'Planning': c => c.category === 'planning' || c.subcategory === 'planning',
  'Schedule': null,
}

// R2 image paths
const R2_IMAGES = 'https://pub-d66179a93f094dd788fadc511338b676.r2.dev'
const R2_GALLERY = 'https://pub-d973b33a485c4c33b4da9c059732fda8.r2.dev'
const propThumb = (id) => `${R2_IMAGES}/${id}/thumb.jpg`
const propBanner = (id) => `${R2_IMAGES}/${id}/banner.jpg`
const galleryImg = (pid, f) => `${R2_GALLERY}/${pid}/gallery/${f}`
const PLACEHOLDER_CARD = '/placeholder-card.svg'
const PLACEHOLDER_BANNER = '/placeholder-banner.svg'

function propColor(name) { return (name && PROP_COLORS[name]) || DEFAULT_COLOR }

export function renderProperties(container) {
  let selected = null
  let detail = null
  let slideLoading = false
  let detailView = false
  let tab = 'Overview'
  let editing = false
  let editForm = {}
  let saving = false
  let propId = null
  let propContacts = []
  let showAddModal = false

  // Subscribe to cache updates to refresh properties list
  const unsubscribe = subscribe((state) => {
    if (state.properties && state.properties.length !== properties.length) {
      renderPropertyGrid()
    }
  })

  function escHtml(s) {
    if (!s) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // Get properties from cache
  const { properties } = getState()

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="shrink-0 mb-4 flex items-end justify-between">
        <div>
          <h2 class="page-title">Properties</h2>
          <p class="page-sub">Enthuse Trust portfolio — ${properties.length} properties</p>
        </div>
        <button id="add-property" class="btn-add">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Property
        </button>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="property-grid">
          ${properties.map(p => renderPropertyCard(p)).join('')}
          <button id="add-property-card" class="bg-white rounded-card overflow-hidden text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)] shadow-[0_0.3rem_1rem_rgba(0,0,0,.07)] border-2 border-dashed border-pomp-border hover:border-[#1E88FF] flex flex-col items-center justify-center min-h-[200px] group">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors" style="background: linear-gradient(135deg, #1E88FF22, #7A2CFF22)">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88FF" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <p class="font-heading font-semibold text-base text-pomp-gray group-hover:text-[#1E88FF] transition-colors">Add Property</p>
            <p class="text-sm text-pomp-gray/60 mt-0.5">Expand the portfolio</p>
          </button>
        </div>
        ${selected ? renderSlidePanel() : ''}
      </div>
      ${showAddModal ? renderAddPropertyModal() : ''}
    </div>
  `

  // Event listeners
  document.getElementById('add-property-card').addEventListener('click', () => { showAddModal = true; rerender() })
  document.getElementById('add-property').addEventListener('click', () => { showAddModal = true; rerender() })

  function rerender() {
    const grid = document.getElementById('property-grid')
    const properties = getState().properties

    grid.innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${properties.map(p => renderPropertyCard(p)).join('')}
        <button id="add-property-card" class="bg-white rounded-card overflow-hidden text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)] shadow-[0_0.3rem_1rem_rgba(0,0,0,.07)] border-2 border-dashed border-pomp-border hover:border-[#1E88FF] flex flex-col items-center justify-center min-h-[200px] group">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors" style="background: linear-gradient(135deg, #1E88FF22, #7A2CFF22)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88FF" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <p class="font-heading font-semibold text-base text-pomp-gray group-hover:text-[#1E88FF] transition-colors">Add Property</p>
          <p class="text-sm text-pomp-gray/60 mt-0.5">Expand the portfolio</p>
        </button>
      </div>
    ` + (selected ? renderSlidePanel() : '')

    // Rewire buttons after rerender
    grid.querySelectorAll('.property-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = properties.find(prop => prop.id === btn.dataset.id)
        if (p) handleCardClick(p)
      })
    })
    document.getElementById('add-property-card').addEventListener('click', () => { showAddModal = true; rerender() })
    document.getElementById('add-property').addEventListener('click', () => { showAddModal = true; rerender() })

    if (showAddModal && document.getElementById('close-add')) {
      document.getElementById('close-add').addEventListener('click', () => { showAddModal = false; rerender() })
    }
    if (detailView) {
      grid.appendChild(document.getElementById('detail-panel'))
    }
  }

  function renderPropertyCard(p) {
    const c = propColor(p.name)
    const isSelected = selected?.id === p.id

    return `
      <button type="button" data-prop-id="${p.id}" class="prop-card bg-white rounded-card overflow-hidden text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)] ${isSelected ? 'ring-2 shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)]' : 'shadow-[0_0.3rem_1rem_rgba(0,0,0,.07)]'}" style="--tw-ring-color: ${c.hex}">
        <div class="relative h-36 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br ${c.from} ${c.to}" />
          <img src="${propThumb(p.id)}" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover" onerror="this.onerror=null; this.src='${PLACEHOLDER_CARD}'" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div class="absolute top-0 left-0 right-0 h-1" style="background: ${c.hex}" />
          ${isSelected ? `<div class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style="background: ${c.hex}">✓</div>` : ''}
          <div class="absolute bottom-2.5 left-3 right-3">
            <p class="text-xs font-bold text-white/80 uppercase tracking-wider">${p.scheme_name || '—'}</p>
          </div>
        </div>
        <div class="p-3">
          <h3 class="font-heading font-bold text-pomp-navy text-base mb-0.5">${escHtml(p.name)}</h3>
          <div class="flex items-center gap-1 text-sm text-pomp-gray mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${escHtml(p.suburb || p.address || '—')}</span>
          </div>
          <div class="grid grid-cols-2 gap-1.5 text-sm">
            <div class="bg-pomp-light rounded-lg px-2 py-1.5">
              <p class="text-pomp-gray text-xs uppercase tracking-wider">Value</p>
              <p class="font-bold text-pomp-navy tabular-nums">${formatRand(p.current_market_value || 0)}</p>
            </div>
            <div class="bg-pomp-light rounded-lg px-2 py-1.5">
              <p class="text-pomp-gray text-xs uppercase tracking-wider">Bought</p>
              <p class="font-bold text-pomp-navy tabular-nums">${formatRand(p.purchase_price || 0)}</p>
            </div>
          </div>
        </div>
      </button>`
  }

  function handleCardClick(p) {
    if (selected?.id === p.id) { setSelected(null); setDetail(null); return }
    setSelected(p); setPropId(p.id); setDetail(null); setLoading(true)
    async function fetchDetail() {
      try { setDetail(await apiClient.get(`/properties/${p.id}`)) } catch { setDetail(null) }
      finally { setLoading(false) }
    }
    fetchDetail()
  }

  function closePanel() { setSelected(null); setDetail(null) }

  async function saveDetails() {
    if (!detail || !propId) return
    setSaving(true)
    try {
      await apiClient.put(`/properties/${propId}/details`, editForm)
      console.log('Saved')
      setEditing(false)
      const updated = await apiClient.get(`/properties/${propId}`)
      setDetail(updated)
      setEditForm(updated)
    } catch { console.error('Failed to save') }
    finally { setSaving(false) }
  }

  const province = detail ? (SCHEME_MAP[detail.name]?.province || '') : ''
  const colors = propColor(detail?.name)

  if (!detailView) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h2 className="page-title">Properties</h2>
            <p className="page-sub">Enthuse Trust portfolio — {properties.length} properties</p>
          </div>
          <button type="button" onClick={() => { setShowAddModal(true) }} className="btn-add">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Property
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.map(p => (
              <PropertyCard key={p.id} p={p} selected={selected?.id === p.id} onClick={() => handleCardClick(p)} />
            ))}
            <AddPropertyCard onClick={() => { setShowAddModal(true) }} />
          </div>
          {selected && (
            <SlidePanel
              p={selected} detail={detail} loading={slideLoading}
              onClose={closePanel}
              onNavigate={() => { setDetailView(true); setSelected(null); setTab('Overview') }}
            />
          )}
        </div>
        {showAddModal && (
          <AddPropertyModal
            onClose={() => { setShowAddModal(false) }}
            onSaved={() => { /* cache will refresh */ }}
          />
        )}
      </div>
    )
  }

  function DetailPanel() {
    return (
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[201] flex flex-col shadow-[-8px_0_48px_rgba(0,0,0,.18)]" role="dialog" aria-label="${detail?.name} details">
        <div className="relative h-48 shrink-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: colors.hex }} />
          <button type="button" onClick={closeDetailView} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors text-lg">×</button>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-white font-heading font-bold text-2xl leading-tight">{detail?.name}</h2>
            <p className="text-white/70 text-sm mt-0.5">{detail?.address}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-white/60"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="text-white/80 text-sm">{detail?.suburb || '—'}, {province}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {editing && (
            <EditForm editForm={editForm} setEditForm={setEditForm} saving={saving} onSave={saveDetails} />
          )}
          {!editing && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-6">
                {[
                  { label: 'Market Value',   value: formatRand(detail?.current_market_value || 0), color: 'text-[#43D000]' },
                  { label: 'Purchase Price', value: formatRand(detail?.purchase_price || 0), color: 'text-pomp-navy' },
                  { label: 'Size',            value: detail?.size_sqm ? `${detail.size_sqm} m²` : '—', color: 'text-pomp-navy' },
                  { label: 'Bedrooms',        value: detail?.bedrooms || '—', color: 'text-pomp-navy' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-pomp-light rounded-lg px-3 py-2.5 border border-pomp-border/60">
                    <p className="text-xs text-pomp-gray uppercase tracking-wider">{label}</p>
                    <p className={`font-bold text-base mt-0.5 tabular-nums ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-pomp-gray uppercase tracking-wider mb-2">Overview</p>
                <div className="bg-pomp-light rounded-lg px-3 py-1 border border-pomp-border/60 divide-y divide-pomp-border/40">
                  <DefinitionList rows={[
                    { label: 'Scheme',         value: detail?.scheme_name },
                    { label: 'Suburb',         value: detail?.suburb },
                    { label: 'Owner',          value: detail?.owner_name },
                    { label: 'Managing Agent', value: detail?.managing_agent_name },
                    { label: 'Municipality',   value: detail?.municipality_name },
                    { label: 'Tenant',         value: detail?.tenant_name },
                    { label: 'BC',             value: detail?.bc_name },
                  ]} />
                </div>
              </div>

              {detail && detail.bonds && detail.bonds.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-pomp-gray uppercase tracking-wider mb-2">Bond</p>
                  <div className="bg-pomp-light rounded-lg px-3 py-1 border border-pomp-border/60">
                    {detail.bonds.map(b => (
                      <DefinitionList key={b.id} rows={[
                        { label: 'Bank',    value: b.bank },
                        { label: 'Monthly', value: b.monthly_payment ? formatRand(b.monthly_payment) : null },
                      ]} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-pomp-border bg-pomp-light flex gap-2">
          <button type="button" onClick={() => { navigate(`/contacts?property_id=${propId}`) }}
            className="flex-1 h-10 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ background: colors.hex }}>
            View Contacts <ChevronRight size={14} />
          </button>
          <button type="button" onClick={() => { setEditing(prev => !prev); if (!editing) setEditForm(detail) }}
            className="h-10 px-4 rounded-lg border border-pomp-border bg-white text-sm text-pomp-gray hover:bg-pomp-light transition-colors">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>
    )
  }
}

// Components

const ChevronRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
)

function ArrowLeft({ size, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-sm text-[#1E88FF] hover:underline">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> All Properties
    </button>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pomp-blue"></div>
    </div>
  )
}

function PageTransition({ children }) {
  const [display, setDisplay] = useState(children)
  const [anim, setAnim] = useState('opacity-100')

  useEffect(() => {
    setAnim('opacity-0 translate-y-1')
    const timer = setTimeout(() => {
      setDisplay(children)
      setAnim('opacity-100 translate-y-0')
    }, 120)
    return () => clearTimeout(timer)
  }, [children])

  return (
    <div className={`transition-all duration-200 ease-out ${anim}`}>
      {display}
    </div>
  )
}

function EditForm({ editForm, setEditForm, saving, onSave }) {
  return (
    <div className="card-flush mb-3 border-2 border-[#1E88FF]/20">
      <div className="card-header">
        <h4 className="text-base font-semibold text-pomp-navy">Edit Property Details</h4>
        <button type="button" onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 text-sm bg-[#43D000] text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2"/><path d="M7 17l10-10"/><path d="M17 17V7H7v10"/></svg>{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
      <div className="card-body">
        <div className="max-h-[480px] overflow-y-auto pr-1 space-y-4">
          {/* Sectioned form would go here */}
        </div>
      </div>
    </div>
  )
}

function SlidePanel({ p, detail, loading, onClose, onNavigate }) {
  const c = propColor(p.name)
  const [imgErr, setImgErr] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const gallery = detail?.gallery_images || []
  const d = detail || {} as PropertyDetail

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-[200] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[201] flex flex-col shadow-[−8px_0_48px_rgba(0,0,0,.18)]"
        style={{ animation: 'slideInRight 0.26s cubic-bezier(0.22,1,0.36,1)' }}
        role="dialog" aria-label={`${p.name} quick view`}>
        <div className="relative h-48 shrink-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${c.from} ${c.to}`} />
          {!imgErr && (
            <img src={propBanner(p.id)} alt={p.name} className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgErr(true)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: c.hex }} />
          <button type="button" onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors text-lg">×</button>
          {gallery.length > 0 && (
            <button type="button" onClick={() => setShowGallery(true)} className="absolute top-3 left-3 h-7 px-2.5 rounded-md bg-black/30 backdrop-blur-sm text-white text-sm font-semibold flex items-center gap-1 hover:bg-black/50 transition-colors">
              🖼 Gallery ({gallery.length})
            </button>
          )}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-white font-heading font-bold text-xl leading-tight">{p.name}</h2>
            <p className="text-white/70 text-sm mt-0.5">{p.address || d.suburb || '—'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {[80, 60, 100, 80].map((h, i) => <div key={i} className="skeleton rounded-lg" style={{ height: h }} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Market Value',   value: formatRand(d.current_market_value || 0), color: 'text-[#43D000]' },
                  { label: 'Purchase Price', value: formatRand(d.purchase_price || 0), color: 'text-pomp-navy' },
                  { label: 'Size',            value: d.size_sqm ? `${d.size_sqm} m²` : '—', color: 'text-pomp-navy' },
                  { label: 'Bedrooms',        value: d.bedrooms || '—', color: 'text-pomp-navy' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-pomp-light rounded-lg px-3 py-2.5 border border-pomp-border/60">
                    <p className="text-xs text-pomp-gray uppercase tracking-wider">{label}</p>
                    <p className={`font-bold text-base mt-0.5 tabular-nums ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-pomp-gray uppercase tracking-wider mb-2">Overview</p>
                <div className="bg-pomp-light rounded-lg px-3 py-1 border border-pomp-border/60 divide-y divide-pomp-border/40">
                  <DefinitionList rows={[
                    { label: 'Scheme',         value: d.scheme_name || p.scheme_name },
                    { label: 'Suburb',         value: d.suburb },
                    { label: 'Owner',          value: d.owner_name },
                    { label: 'Managing Agent', value: d.managing_agent_name },
                    { label: 'Municipality',   value: d.municipality_name },
                    { label: 'Tenant',         value: d.tenant_name },
                    { label: 'BC',             value: d.bc_name },
                  ]} />
                </div>
              </div>

              {d.bonds && d.bonds.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-pomp-gray uppercase tracking-wider mb-2">Bond</p>
                  <div className="bg-pomp-light rounded-lg px-3 py-1 border border-pomp-border/60">
                    {d.bonds.map(b => (
                      <DefinitionList key={b.id} rows={[
                        { label: 'Bank',    value: b.bank },
                        { label: 'Monthly', value: b.monthly_payment ? formatRand(b.monthly_payment) : null },
                      ]} />
                    ))}
                  </div>
                </div>
              )}

              {gallery.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-pomp-gray uppercase tracking-wider mb-2">Gallery</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {gallery.slice(0, 5).map((img, i) => (
                      <button type="button" key={i} onClick={() => setShowGallery(true)} aria-label={`Open image ${i + 1}`}
                        className="w-20 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border border-pomp-border hover:opacity-80 transition-opacity">
                        <img src={galleryImg(p.id, img)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button type="button" onClick={() => setShowGallery(true)} aria-label="View all gallery images"
                      className="w-20 h-14 rounded-lg border-2 border-dashed border-pomp-border shrink-0 cursor-pointer flex flex-col items-center justify-center text-pomp-gray hover:border-[#1E88FF] hover:text-[#1E88FF] transition-colors text-sm font-medium">
                      <span className="text-lg leading-none">+</span>All
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-pomp-border bg-pomp-light flex gap-2">
          <button type="button" onClick={onNavigate}
            className="flex-1 h-10 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ background: c.hex }}>
            Full Property Details <ChevronRight size={14} />
          </button>
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-pomp-border bg-white text-sm text-pomp-gray hover:bg-pomp-light transition-colors">
            Close
          </button>
        </div>
      </div>

      {showGallery && gallery.length > 0 && (
        <Gallery propId={p.id} images={gallery} onClose={() => setShowGallery(false)} />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

function Gallery({ propId, images, onClose }) {
  const [idx, setIdx] = useState(0)
  const total = images.length
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  next()
      if (e.key === 'ArrowLeft')   prev()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, next, prev])

  return (
    <div className="fixed inset-0 bg-black/92 z-[500] flex flex-col" onClick={onClose} role="dialog" aria-label="Property gallery">
      <div className="flex items-center px-5 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white text-base font-semibold">Gallery</span>
        <span className="text-gray-400 text-sm ml-2">{idx + 1} / {total}</span>
        <div className="flex-1" />
        <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors" aria-label="Close gallery">×</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-14 relative min-h-0" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={prev} className="absolute left-4 w-11 h-11 rounded-full bg-white/12 hover:bg-white/22 text-white text-2xl flex items-center justify-center transition-colors" aria-label="Previous image">‹</button>
        <img key={idx} src={galleryImg(propId, images[idx])} alt={`Image ${idx + 1} of ${total}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        <button type="button" onClick={next} className="absolute right-4 w-11 h-11 rounded-full bg-white/12 hover:bg-white/22 text-white text-2xl flex items-center justify-center transition-colors" aria-label="Next image">›</button>
      </div>
      <div className="flex gap-2 px-5 py-3 overflow-x-auto shrink-0 justify-center" onClick={e => e.stopPropagation()}>
        {images.map((img, i) => (
          <button type="button" key={i} onClick={() => setIdx(i)} aria-label={`Go to image ${i + 1}`}
            className={`w-16 h-12 rounded-md overflow-hidden shrink-0 cursor-pointer transition-all ${i === idx ? 'ring-2 ring-[#1E88FF] opacity-100' : 'opacity-50 hover:opacity-75'}`}>
            <img src={galleryImg(propId, img)} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

function PropertyCard({ p, selected, onClick }) {
  const c = propColor(p.name)
  const [imgErr, setImgErr] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`bg-white rounded-card overflow-hidden text-left transition-all duration-200
        hover:-translate-y-1 hover:shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)]
        ${selected ? 'ring-2 shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)]' : 'shadow-[0_0.3rem_1rem_rgba(0,0,0,.07)]'}`}
      style={{ '--tw-ring-color': c.hex } as React.CSSProperties}
    >
      <div className="relative h-36 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${c.from} ${c.to}`} />
        {!imgErr && (
          <img src={propThumb(p.id)} alt={p.name} className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: c.hex }} />
        {selected && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ background: c.hex }}>✓</div>
        )}
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{p.scheme_name || '—'}</p>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-heading font-bold text-pomp-navy text-base mb-0.5">{p.name}</h3>
        <div className="flex items-center gap-1 text-sm text-pomp-gray mb-3">
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{p.suburb || p.address || '—'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-sm">
          <div className="bg-pomp-light rounded-lg px-2 py-1.5">
            <p className="text-pomp-gray text-xs uppercase tracking-wider">Value</p>
            <p className="font-bold text-pomp-navy tabular-nums">{formatRand(p.current_market_value || 0)}</p>
          </div>
          <div className="bg-pomp-light rounded-lg px-2 py-1.5">
            <p className="text-pomp-gray text-xs uppercase tracking-wider">Bought</p>
            <p className="font-bold text-pomp-navy tabular-nums">{formatRand(p.purchase_price || 0)}</p>
          </div>
        </div>
      </div>
    </button>
  )
}

function AddPropertyCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-card overflow-hidden text-left transition-all duration-200
        hover:-translate-y-1 hover:shadow-[0_0.8rem_2.4rem_rgba(0,0,0,.13)]
        shadow-[0_0.3rem_1rem_rgba(0,0,0,.07)]
        border-2 border-dashed border-pomp-border hover:border-[#1E88FF]
        flex flex-col items-center justify-center min-h-[200px] group"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors"
        style={{ background: 'linear-gradient(135deg, #1E88FF22, #7A2CFF22)' }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1E88FF" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
      <p className="font-heading font-semibold text-base text-pomp-gray group-hover:text-[#1E88FF] transition-colors">Add Property</p>
      <p className="text-sm text-pomp-gray/60 mt-0.5">Expand the portfolio</p>
    </button>
  )
}

export default function Properties() {
  const { properties } = getState()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)
  const [detail, setDetail] = useState<PropertyDetail | null>(null)
  const [slideLoading, setLoading] = useState(false)
  const [detailView, setDetailView] = useState(false)
  const [tab, setTab] = useState<Tab>('Overview')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [propId, setPropId] = useState<string | null>(null)
  const [propContacts, setPropContacts] = useState<Contact[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const handleCardClick = useCallback(async (p) => {
    if (selected?.id === p.id) { setSelected(null); setDetail(null); return }
    setSelected(p); setPropId(p.id); setDetail(null); setLoading(true)
    try { setDetail(await apiClient.get<PropertyDetail>(`/properties/${p.id}`)) } catch { setDetail(null) }
    finally { setLoading(false) }
  }, [selected])

  const closePanel = useCallback(() => { setSelected(null); setDetail(null) }, [])
  const closeDetailView = useCallback(() => { setDetailView(false); setDetail(null) }, [])

  const openDetailView = useCallback(() => {
    setDetailView(true)
    setSelected(null)
    setTab('Overview')
    setEditing(false)
  }, [])

  useEffect(() => {
    if (detailView && propId) {
      apiClient.get<Contact[]>(`/property-contacts?property_id=${propId}`).then(d => setPropContacts(d || [])).catch(() => setPropContacts([]))
    } else if (!detailView) {
      setPropContacts([])
    }
  }, [detailView, propId])

  const saveDetails = useCallback(async () => {
    if (!detail || !propId) return
    setSaving(true)
    try {
      await apiClient.put(`/properties/${propId}/details`, editForm)
      toast.success('Property details saved')
      setEditing(false)
      const updated = await apiClient.get<PropertyDetail>(`/properties/${propId}`)
      setDetail(updated)
      setEditForm(updated)
    } catch {
      toast.error('Failed to save property details')
    }
    finally { setSaving(false) }
  }, [detail, propId, editForm])

  const goToContacts = useCallback(() => {
    if (propId) navigate(`/contacts?property_id=${propId}`)
  }, [navigate, propId])

  if (!detailView) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 mb-4 flex items-end justify-between">
          <div>
            <h2 className="page-title">Properties</h2>
            <p className="page-sub">Enthuse Trust portfolio — {properties.length} properties</p>
          </div>
          <button type="button" onClick={() => setShowAddModal(true)} className="btn-add">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Property
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.map(p => (
              <PropertyCard key={p.id} p={p} selected={selected?.id === p.id} onClick={() => handleCardClick(p)} />
            ))}
            <AddPropertyCard onClick={() => setShowAddModal(true)} />
          </div>
          {selected && (
            <SlidePanel
              p={selected} detail={detail} loading={slideLoading}
              onClose={closePanel}
              onNavigate={openDetailView}
            />
          )}
        </div>
        {showAddModal && (
          <AddPropertyModal
            onClose={() => { setShowAddModal(false) }}
            onSaved={() => { /* cache will refresh */ }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="shrink-0 mb-3">
        <button type="button" onClick={closeDetailView} className="flex items-center gap-1 text-sm text-[#1E88FF] hover:underline">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> All Properties
        </button>
      </div>

      <div className="shrink-0">
        <div className={`bg-gradient-to-r ${colors.from} ${colors.to} rounded-card p-4 mb-3`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-heading font-bold text-2xl">{detail?.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">{detail?.address}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-white/60"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-white/80 text-sm">{detail?.suburb || '—'}, {province}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={goToContacts}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2"><path d="M4 6h16"/><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/></svg> Contacts
              </button>
              <button type="button" onClick={() => { setEditing(prev => !prev); if (!editing) setEditForm(detail) }}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Market Value',   value: formatRand(detail?.current_market_value || 0) },
              { label: 'Purchase Price', value: formatRand(detail?.purchase_price || 0) },
              { label: 'Letting Agent',  value: detail?.managing_agent_name?.split(' ')[0] || SCHEME_MAP[detail?.name || '']?.agent || '—' },
              { label: 'Municipality',   value: detail?.municipality_name || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-lg px-3 py-2">
                <p className="text-white/60 text-sm">{label}</p>
                <p className="text-white font-semibold text-base mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {editing && (
          <EditForm editForm={editForm} setEditForm={setEditForm} saving={saving} onSave={saveDetails} />
        )}
      </div>

      <div className="tab-bar shrink-0" role="tablist" aria-label="Property sections">
        {PROPERTY_DETAIL_TABS.map(t => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tab-panel-${t}`}
            onClick={() => setTab(t)}
            className={`tab-item ${tab === t ? 'tab-item-active' : 'tab-item-inactive'}`}
          >{t}</button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-2" id={`tab-panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {detail && (
          <TabContent
            tab={tab}
            detail={detail}
            propContacts={propContacts}
            propId={propId}
            onViewAll={goToContacts}
          />
        )}
      </div>
    </div>
  )
}

function TabContent({ tab, detail, propContacts, propId, onViewAll }) {
  const filterFn = TAB_CONTACT_FILTERS[tab]
  const tabContacts = useMemo(() =>
    (filterFn && propContacts.length > 0 ? propContacts.filter(c => filterFn(c.subcategory || '')) : []),
    [filterFn, propContacts],
  )

  if (tab === 'Documents') {
    return <DocumentsTab detail={detail} />
  }

  if (tab === 'Gallery' || tab === 'Images') {
    return (
      <ImageGalleryTab
        propId={propId || ''}
        propName={detail?.name || ''}
        gallery={detail?.gallery_images || []}
      />
    )
  }

  const fields = PROPERTY_SECTIONS[tab as DetailTab]

  return (
    <div className="space-y-3">
      <div className="card-flush">
        <div className="card-header">
          <h4 className="text-base font-semibold text-pomp-navy">{tab}</h4>
        </div>
        <div className="card-body">
          <DefinitionList
            rows={fields.map(f => {
              const v = detail?.[f.key]
              if (v == null || v === '') return null
              const display = f.format === 'currency' && typeof v === 'number' ? formatRand(v) : String(v)
              return { label: f.label, value: display }
            })}
          />
        </div>
      </div>
      {tabContacts.length > 0 && (
        <div className="card-flush">
          <div className="card-header">
            <h4 className="text-base font-semibold text-pomp-navy flex items-center gap-1.5">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 20h5v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2h5"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.13a4 4 0 0 1 0 7.76"/></svg> {tab} Contacts
              <span className="text-sm text-pomp-gray font-normal">({tabContacts.length})</span>
            </h4>
            <button type="button" onClick={onViewAll}
              className="text-sm text-[#1E88FF] hover:underline flex items-center gap-0.5">
              View all <ExternalLink size={11} />
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tabContacts.map(c => (
                <ContactCard key={c.id} contact={c} variant="mini" onClick={onViewAll} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DocumentsTab({ detail }) {
  const [docs, setDocs] = useState<Document[]>([])
  const [driveUrl, setDriveUrl] = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [showFrame, setShowFrame] = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)

  useEffect(() => {
    if (!detail?.id) return
    apiClient.get<Document[]>(`/documents?property_id=${detail.id}`).then(d => setDocs(d ?? [])).catch(() => setDocs([]))
    // Load persisted drive URL
    const stored = localStorage.getItem(`drive_url_${detail.id}`)
    if (stored) { setSavedUrl(stored); setDriveUrl(stored) }
  }, [detail?.id])

  const saveDriveUrl = () => {
    if (!detail?.id) return
    // Convert Google Drive sharing URL to embeddable URL
    let url = driveUrl.trim()
    // Handle folder: https://drive.google.com/drive/folders/ID
    // Handle file:   https://drive.google.com/file/d/ID/view
    // Convert to embed format
    const folderMatch = url.match(/\/folders\/([^?/]+)/)
    const fileMatch   = url.match(/\/d\/([^/]+)/)
    if (folderMatch) {
      url = `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`
    } else if (fileMatch) {
      url = `https://drive.google.com/file/d/${fileMatch[1]}/preview`
    }
    setSavedUrl(url)
    localStorage.setItem(`drive_url_${detail.id}`, url)
    setShowFrame(true)
    setEditingUrl(false)
  }

  return (
    <div className="space-y-3">
      {/* Google Drive section */}
      <div className="card-flush">
        <div className="card-header">
          <h4 className="text-base font-semibold text-pomp-navy flex items-center gap-2">
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 13v8H6v-8"/><path d="M2 8h20l-10 8L2 8z"/><path d="M2 8v10h20V8"/></svg> Google Drive
          </h4>
          <div className="flex gap-2">
            {savedUrl && (
              <button type="button" onClick={() => setShowFrame(f => !f)}
                className="text-sm text-[#1E88FF] hover:underline">{showFrame ? 'Hide' : 'Show'}</button>
            )}
            <button type="button" onClick={() => setEditingUrl(e => !e)}
              className="text-sm text-pomp-gray hover:text-pomp-navy">{editingUrl ? 'Cancel' : (savedUrl ? 'Change' : 'Add link')}</button>
          </div>
        </div>
        {editingUrl && (
          <div className="card-body border-b border-pomp-border/60">
            <p className="text-sm text-pomp-gray mb-2">Paste a Google Drive shared folder or file link</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="flex-1 border border-pomp-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1E88FF] outline-none"
              />
              <button type="button" onClick={saveDriveUrl}
                className="btn-primary whitespace-nowrap">Save</button>
            </div>
          </div>
        )}
        {showFrame && savedUrl && (
          <div className="w-full" style={{ height: '480px' }}>
            <iframe
              src={savedUrl}
              className="w-full h-full border-0"
              title="Google Drive"
              allow="autoplay"
            />
          </div>
        )}
        {!savedUrl && !editingUrl && (
          <div className="card-body">
            <p className="text-sm text-pomp-gray italic">No Drive link added. Click "Add link" to embed a Google Drive folder or file.</p>
          </div>
        )}
      </div>

      {/* File documents */}
      <div className="card-flush">
        <div className="card-header">
          <h4 className="text-base font-semibold text-pomp-navy">Documents</h4>
          <span className="text-sm text-pomp-gray">{docs.length} files</span>
        </div>
        <div className="card-body">
          {docs.length === 0 ? (
            <p className="text-sm text-pomp-gray italic">No documents for this property.</p>
          ) : (
            <ul className="divide-y divide-pomp-border/40" role="list">
              {docs.map((d) => (
                <li key={d.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-pomp-gray"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="9 9 9 9.01 9 15"/></svg>
                    <div className="min-w-0">
                      <p className="font-semibold text-pomp-navy truncate">{d.name}</p>
                      <p className="text-sm text-pomp-gray truncate">{d.category}{d.expiry_date ? ` · Exp: ${d.expiry_date}` : ''}</p>
                    </div>
                  </div>
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#1E88FF] hover:underline shrink-0 ml-3">Open</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// Commented out for brevity - would continue with EditForm, SlidePanel, TabContent, Gallery implementations
export default Properties
”,
  "currentLineNumber": 78930,
  "injectedAdded": [],
  "injectedRemoved": [],
  "lastAttempt": {"fallback": true},
  "status": "failed"
}