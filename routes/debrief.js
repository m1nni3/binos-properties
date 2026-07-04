import { $, el, render } from '../lib/utils.js'

const debriefs = [
  { id: 8, month: "May 2026", date: "8–11 May 2026", title: "Municipal Accounts, Property Management & Operational Update", tag: "OPERATIONAL", summary: "Comprehensive operational update covering six active matters...", sections: [{ heading: "Municipal & Property Solutions – Status", body: "Indaba: Interest reversal complete. Account reduced from R69,497 to R818.30..." }, { heading: "Villeroy – Prestige Metering (Utilities, VILL.0135.07)", body: "Outstanding balance of R138.09 confirmed..." }, { heading: "Oakdale & Mont Bleu – Municipal Account Access", body: "Oakdale: Sarah has existing City of Cape Town e-services profile..." }, { heading: "Mont Bleu – Tenant Onboarding & Occupation", body: "Completed: first month rental paid, full deposit paid..." }, { heading: "KempRent → Trafalgar Transition (D26 Malindi)", body: "No funds transferred — neither tenant deposits nor rental income disbursed..." }, { heading: "Villeroy Court 135 – Tenant Payment Reference Issue", body: "Tenant used incorrect payment reference for 3–4 consecutive months..." }, { heading: "Oakdale – Urgent Remote Control Audit", body: "Trafalgar issued urgent security notice on 11 May..." }, { heading: "Trust Financial Administration", body: "Nedbank notifications: binostribe@gmail.com to be added..." }], financials: [{ label: "MPS total outstanding", value: "R5,123.25", status: "warning" }, { label: "Villeroy municipal outstanding", value: "R22,632.56", status: "danger" }, { label: "Villeroy if debt relief approved", value: "~R11,316.28", status: "warning" }], docs: [{ name: "Trustee_Debrief_Municipal_Property_Management_May_2026.pdf", file: "Trustee_Debrief_Municipal_Property_Management_May_2026.pdf" }], properties: ["Indaba", "Malindi", "Villeroy", "Oakdale", "Mont Bleu"] },
  { id: 7, month: "May 2026", date: "May 2026", title: "Letting Agent Negotiations, Municipal Accounts & Sectional Title", tag: "STRATEGIC", summary: "Positive outcomes across financial, operational, and compliance areas...", sections: [{ heading: "Letting Agent Fee Negotiations – Results", body: "Mont Bleu (Cape Town / Trafalgar CT): Original 10% + VAT negotiated to 8% + VAT..." }, { heading: "SS Malindi Court – Ekurhuleni Municipality", body: "Appointed vendor successfully located the municipal account..." }, { heading: "Tshwane Municipal Account (Property Acquired 2005)", body: "Background: Arrears identified approximately R68,000..." }, { heading: "Key Takeaways", body: "Successful negotiation of reduced letting agent fees..." }], financials: [{ label: "Combined annual letting fee saving", value: "R3,381.00", status: "ok" }, { label: "Tshwane settlement offer", value: "R42,840.33", status: "warning" }], docs: [{ name: "Property_Management_Debrief_.pdf", file: "Property_Management_Debrief_.pdf" }], properties: ["Mont Bleu", "Malindi", "Indaba"] },
  { id: 6, month: "May 2026", date: "May 2026", title: "Situational Debrief – Municipal Office Engagement", tag: "URGENT", summary: "Post-meeting debrief following engagement with municipal services office...", sections: [{ heading: "Key Findings from Municipal Office", body: "Interest waiver offer strictly conditional on full settlement..." }, { heading: "Valuation Dispute Potential", body: "Unit historically valued R1.2–1.5M..." }, { heading: "Position Taken & Reasoning", body: "No commitment made — Trust liquidity position not available..." }, { heading: "Draft Correspondence & Next Steps", body: "Draft correspondence to debt collection department prepared..." }], financials: [{ label: "Estimated immediate settlement required", value: "~R45,000", status: "danger" }], docs: [{ name: "Situational_Debrief__refined_.pdf", file: "Situational_Debrief__refined_.pdf" }], properties: ["Indaba"] },
  { id: 5, month: "May 2026", date: "8 May 2026", title: "Malindi Court – Legal Review Debrief", tag: "LEGAL", summary: "Debrief summarising material deficiencies in Kemprent's management...", sections: [{ heading: "Key Issues Identified", body: "Failure to conduct proper entry/exit inspections..." }, { heading: "Financial & Administrative Irregularities", body: "Trust charged for levy payments that were never made..." }, { heading: "Preliminary Assessment", body: "Pattern of discrepancies indicates material deficiencies..." }, { heading: "Recommended Next Steps for Legal Counsel", body: "1. Finalise detailed review against all inspection records..." }, { heading: "Recommendation", body: "Transfer property management to Trafalgar without delay..." }], financials: [], docs: [{ name: "Malindi_Debrief.pdf", file: "Malindi_Debrief.pdf" }], properties: ["Malindi"] },
  { id: 4, month: "May 2026", date: "8 May 2026", title: "D26 Malindi – Kemprent Mandate Termination: Handover Review", tag: "FORENSIC", summary: "Confidential memorandum reviewing all Kemprent ledger records...", sections: [{ heading: "Scope of Review", body: "22 canonical ledger files reviewed after removing 44 duplicate files..." }, { heading: "Owner Ledger Summary", body: "2016: 5 of 12 months..." }, { heading: "Tenant Ledger Summary", body: "Masilela (2016): Opens with R11,200.86 arrears..." }, { heading: "Critical Irregularities", body: "CRITICAL: Owner 2019 — near-empty ledger..." }, { heading: "Financial Summary", body: "Owner outstanding gross: R18,640.24..." }, { heading: "Next Steps", body: "Formal reconciliation request sent to Kemprent..." }], financials: [{ label: "Owner account outstanding (gross)", value: "R18,640.24", status: "danger" }, { label: "Closed tenant accounts outstanding", value: "R31,043.06", status: "danger" }], docs: [{ name: "D26_Malindi_Trustee_Debrief.pdf", file: "D26_Malindi_Trustee_Debrief.pdf" }], properties: ["Malindi"] },
  { id: 3, month: "February 2026", date: "27 February 2026", title: "Trustees Meeting – Handout & Decision Pack", tag: "MEETING", summary: "Supporting handout for the 27 February trustees meeting...", sections: [{ heading: "Municipal Account Summary Table", body: "Malindi (Ekurhuleni): Balance unconfirmed..." }, { heading: "Decisions Required from Trustees", body: "Decision 1: Malindi — Authorise MPSCC account locate/create..." }, { heading: "Action Items Log", body: "Authorise MPSCC to locate/create Malindi account..." }, { heading: "Key Risks", body: "Villeroy (Prestige Metering): disconnection IMMEDIATE..." }], financials: [{ label: "Indaba settlement (3-year)", value: "R25,730", status: "warning" }, { label: "Villeroy municipal estimate", value: "~R23,000", status: "danger" }], docs: [{ name: "enthuse-trust-meeting-handout.docx", file: "enthuse-trust-meeting-handout.docx" }], properties: ["Malindi", "Indaba", "Villeroy", "Oakdale"] },
  { id: 2, month: "February 2026", date: "27 February 2026", title: "Trustees Meeting – Formal Agenda", tag: "MEETING", summary: "Formal agenda for trustees meeting covering municipal clearance authorisations...", sections: [{ heading: "Meeting Purpose", body: "Approve authorisations for municipal clearance..." }, { heading: "Malindi – SS Malindi Court, Unit 15", body: "Account number unconfirmed..." }, { heading: "Indaba – SS Indaba, Unit 5", body: "Account 5004692062 located..." }, { heading: "Villeroy – SS Villeroy Court, Unit 135", body: "Municipal arrears estimate: ~R23,000..." }, { heading: "Malindi D26 – New Tenant Maintenance Dispute", body: "New tenant arrived to find unit unpainted..." }, { heading: "Trafalgar Trust Payments", body: "R2,733.76 paid 27 Feb 2026..." }], financials: [{ label: "Indaba 3-year settlement", value: "R25,730", status: "warning" }, { label: "Villeroy municipal arrears (est.)", value: "~R23,000", status: "danger" }], docs: [{ name: "enthuse-trust-meeting-agenda.docx", file: "enthuse-trust-meeting-agenda.docx" }], properties: ["Malindi", "Indaba", "Villeroy", "Oakdale"] },
  { id: 1, month: "January 2026", date: "January 2026", title: "Unknown Bond Payment Report", tag: "FORENSIC", summary: "Analysis of unidentified historical bond payments in Trust bank statements...", sections: [{ heading: "Purpose & Background", body: "Report prepared to document, analyse, and explain..." }, { heading: "Bond Accounts Identified", body: "NEDBHL (Nedbank Home Loan): ~R4,600–R4,900/month..." }, { heading: "Cessation of Payments", body: "Standard Bank Home Loan payments cease in December 2017..." }, { heading: "Attribution Limitation & Conclusion", body: "Not possible to definitively assign either bond..." }, { heading: "Annual Bond Payment Pivot Summary", body: "2014: NEDBHL R4,651 (Dec only)..." }], financials: [{ label: "Nedbank Home Loan (peak monthly)", value: "R4,915", status: "neutral" }, { label: "Standard Bank Home Loan (peak monthly)", value: "R4,307", status: "neutral" }], docs: [{ name: "Enthuse Trust – Unknown Bond Payment Report.docx", file: "Enthuse_Trust___Unknown_Bond_Payment_Report.docx" }], properties: ["River Hamlet"] },
]

const MONTHS = ["All", "January 2026", "February 2026", "May 2026"]

const TAG_COLORS = {
  FORENSIC: { bg: "#1a1a2e", text: "#e8c87a", border: "#3d3d5c" },
  LEGAL:    { bg: "#1e0a2e", text: "#c87ae8", border: "#3d1a5c" },
  MEETING:  { bg: "#0a1e2e", text: "#7ab8e8", border: "#1a3d5c" },
  OPERATIONAL: { bg: "#0a2e1a", text: "#7ae8a8", border: "#1a5c3d" },
  STRATEGIC: { bg: "#2e1a0a", text: "#e8b87a", border: "#5c3d1a" },
  URGENT:   { bg: "#2e0a0a", text: "#e87a7a", border: "#5c1a1a" },
}

const STATUS_STYLE = {
  ok:      { color: "#1a6b3c", bg: "#eaf7f0", dot: "#2ecc71" },
  warning: { color: "#7a5200", bg: "#fdf6ec", dot: "#f39c12" },
  danger:  { color: "#7a1a1a", bg: "#fdf0ef", dot: "#e74c3c" },
  neutral: { color: "#444",   bg: "#f5f5f5", dot: "#999" },
}

export function renderDebrief(container) {
  let selected = null
  let monthFilter = "All"

  container.innerHTML = `
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h2 class="font-heading text-xl font-bold text-pomp-navy">Debrief</h2>
          <p class="text-xs text-gray-400">Trustee debriefs &amp; reports</p>
        </div>
      </div>
      <div id="debrief-content" class="flex flex-col flex-1 min-h-0 mt-4"></div>
    </div>`

  rerender()

  function rerender() {
    const filtered = monthFilter === "All" ? debriefs : debriefs.filter(d => d.month === monthFilter)
    const totals = {
      docs: debriefs.length,
      properties: [...new Set(debriefs.flatMap(d => d.properties))].length,
      urgent: debriefs.filter(d => d.tag === "URGENT" || d.tag === "LEGAL" || d.tag === "FORENSIC").length,
      months: [...new Set(debriefs.map(d => d.month.split(' ')[0] + ' ' + d.month.split(' ')[1]))].length
    }

    let html = `
      <div class="grid grid-cols-4 gap-2 shrink-0 mb-4">
        ${[["Debriefs", totals.docs], ["Properties", totals.properties], ["High Priority", totals.urgent], ["Months", totals.months]].map(([label, val]) => `
          <div class="card py-3 px-4">
            <p class="text-[0.6rem] font-mono tracking-wider text-gray-400 uppercase mb-1">${label}</p>
            <p class="text-xl font-bold text-pomp-navy font-mono">${val}</p>
          </div>`).join('')}
      </div>
      <div class="shrink-0 mb-4">
        <p class="text-[0.6rem] font-mono tracking-wider text-gray-400 uppercase mb-1.5">Filter by Month</p>
        <div class="flex gap-1.5 flex-wrap">
          ${MONTHS.map(m => `<button data-month="${m}" class="text-[0.72rem] font-bold font-mono tracking-wide px-3 py-1 rounded transition-colors ${monthFilter === m ? 'bg-pomp-navy text-white' : 'bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-100'}">${m}</button>`).join('')}
        </div>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto" id="debrief-cards"></div>`

    $('debrief-content').innerHTML = html

    // Month filter buttons
    document.querySelectorAll('[data-month]').forEach(b => b.addEventListener('click', () => { monthFilter = b.dataset.month; rerender() }))

    // Render cards
    const cardsContainer = $('debrief-cards')
    let cardsHtml = ''

    const monthsToShow = monthFilter === "All" ? MONTHS.slice(1) : [monthFilter]
    monthsToShow.forEach(m => {
      const group = debriefs.filter(d => d.month === m)
      if (!group.length) return
      cardsHtml += `
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-3">
            <p class="text-[0.72rem] font-bold font-mono tracking-wider text-gray-500 uppercase whitespace-nowrap">${m}</p>
            <div class="flex-1 h-px bg-gray-200"></div>
            <p class="text-[0.65rem] text-gray-400 font-mono whitespace-nowrap">${group.length} debrief${group.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            ${group.map(d => renderCard(d)).join('')}
          </div>
        </div>`
    })

    cardsHtml += `
      <div class="border-t border-gray-200 pt-4 mt-2 flex items-center justify-between flex-wrap gap-2">
        <span class="text-[0.65rem] text-gray-300 font-mono tracking-wide">CONFIDENTIAL — ENTHUSE TRUST INTERNAL USE ONLY</span>
        <span class="text-[0.65rem] text-gray-300 font-mono">${filtered.length} of ${debriefs.length} debriefs shown</span>
      </div>`

    cardsContainer.innerHTML = cardsHtml
    cardsContainer.querySelectorAll('.debrief-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.id)
        selected = debriefs.find(d => d.id === id) || null
        showSidePanel()
      })
    })
  }

  function renderCard(d) {
    const tc = TAG_COLORS[d.tag] || TAG_COLORS.OPERATIONAL
    return `
      <div data-id="${d.id}" class="debrief-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer flex flex-col gap-2 relative overflow-hidden transition-shadow duration-150 hover:-translate-y-0.5" style="box-shadow: 0 1px 4px rgba(0,0,0,0.04); cursor: pointer;">
        <div class="absolute top-0 left-0 w-0.5 h-full opacity-80" style="background-color: ${tc.text}"></div>
        <div class="flex items-center justify-between pl-1.5">
          <span class="text-[0.58rem] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase shrink-0" style="background-color: ${tc.bg}; color: ${tc.text}; border: 1px solid ${tc.border}">${d.tag}</span>
          <span class="text-[0.67rem] text-gray-400 font-mono">${d.date}</span>
        </div>
        <h3 class="text-[0.88rem] font-bold text-gray-900 leading-snug pl-1.5 m-0">${escHtml(d.title)}</h3>
        <p class="text-[0.76rem] text-gray-500 leading-relaxed italic pl-1.5 m-0 line-clamp-2">${escHtml(d.summary)}</p>
        <div class="flex gap-1 flex-wrap pl-1.5">${d.properties.map(p => `<span class="text-[0.58rem] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono tracking-wide">${escHtml(p)}</span>`).join('')}</div>
        <div class="flex items-center justify-between pl-1.5 pt-0.5">
          <span class="text-[0.67rem] text-gray-300 font-mono">${d.sections.length} sections · ${d.docs.length} doc${d.docs.length !== 1 ? 's' : ''}</span>
          <span class="text-[0.7rem] font-bold font-mono" style="color: ${tc.text}">Open →</span>
        </div>
      </div>`
  }

  function showSidePanel() {
    if (!selected) return
    document.body.insertAdjacentHTML('beforeend', `
      <div class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" id="panel-overlay"></div>
      <div class="fixed top-0 right-0 bottom-0 w-[min(560px,100vw)] bg-[#fdfcfa] shadow-2xl z-50 flex flex-col" id="side-panel" style="animation: panelIn .22s cubic-bezier(.4,0,.2,1)">
        <style>@keyframes panelIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}</style>
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50/50 shrink-0">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="text-[0.58rem] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase shrink-0" style="background-color: ${TAG_COLORS[selected.tag]?.bg || '#0a2e1a'}; color: ${TAG_COLORS[selected.tag]?.text || '#7ae8a8'}; border: 1px solid ${TAG_COLORS[selected.tag]?.border || '#1a5c3d'}">${selected.tag}</span>
                <span class="text-[0.7rem] text-gray-400 font-mono">${selected.date}</span>
              </div>
              <h2 class="text-base font-bold text-gray-900 leading-tight m-0">${escHtml(selected.title)}</h2>
              <div class="flex gap-1 flex-wrap mt-1.5">${selected.properties.map(p => `<span class="text-[0.58rem] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono tracking-wide">${escHtml(p)}</span>`).join('')}</div>
            </div>
            <button id="panel-close" class="border-0 bg-gray-200 cursor-pointer text-gray-500 p-1.5 rounded ml-3 shrink-0 leading-none hover:bg-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <p class="mt-2 text-[0.8rem] text-gray-500 leading-relaxed italic m-0">${escHtml(selected.summary)}</p>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div class="mb-5">
            <div class="text-[0.6rem] font-bold tracking-widest text-gray-400 uppercase font-mono mb-1.5">Debrief Sections</div>
            ${selected.sections.map((s, i) => `
              <div class="mb-0.5">
                <button class="section-toggle w-full text-left bg-gray-50 border border-gray-200 px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100" style="border-radius: 5px" data-section="${i}">
                  <span class="text-[0.83rem] font-semibold text-gray-800">${escHtml(s.heading)}</span>
                  <span class="text-gray-400 text-[0.7rem] ml-2 shrink-0 section-arrow">▼</span>
                </button>
                <div class="section-body hidden px-3.5 py-3 bg-white border border-gray-200 border-t-0 text-[0.8rem] text-gray-600 leading-relaxed rounded-b" data-body="${i}">${escHtml(s.body)}</div>
              </div>`).join('')}
          </div>
          ${selected.financials.length > 0 ? `
            <div class="mb-5">
              <div class="text-[0.6rem] font-bold tracking-widest text-gray-400 uppercase font-mono mb-1.5">Financial Snapshot</div>
              ${selected.financials.map(f => {
                const s = STATUS_STYLE[f.status] || STATUS_STYLE.neutral
                return `<div class="flex items-center justify-between px-2.5 py-1.5 rounded mb-0.5" style="background-color: ${s.bg}">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background-color: ${s.dot}"></span>
                    <span class="text-[0.76rem] text-gray-500 font-mono">${escHtml(f.label)}</span>
                  </div>
                  <span class="text-[0.8rem] font-bold font-mono" style="color: ${s.color}">${f.value}</span>
                </div>`
              }).join('')}
            </div>` : ''}
          <div>
            <div class="text-[0.6rem] font-bold tracking-widest text-gray-400 uppercase font-mono mb-1.5">Source Documents</div>
            ${selected.docs.map(doc => `
              <div class="flex items-center gap-2.5 px-3 py-2 border border-gray-200 rounded mb-1 bg-gray-50">
                <span class="text-sm shrink-0 text-gray-400">📄</span>
                <span class="flex-1 text-[0.73rem] text-gray-500 font-mono truncate">${escHtml(doc.name)}</span>
                <div class="flex gap-1 shrink-0">
                  <a href="/mnt/user-data/uploads/${doc.file}" target="_blank" rel="noreferrer" class="text-[0.68rem] px-2.5 py-0.5 rounded bg-gray-900 text-white no-underline font-bold font-mono">View</a>
                  <a href="/mnt/user-data/uploads/${doc.file}" download class="text-[0.68rem] px-2 py-0.5 rounded border border-gray-300 text-gray-500 no-underline font-bold font-mono hover:bg-gray-100">↓</a>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`)

    // Wire panel events
    $('panel-overlay').addEventListener('click', closePanel)
    $('panel-close').addEventListener('click', closePanel)
    document.querySelectorAll('.section-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = btn.dataset.section
        const body = document.querySelector(`[data-body="${i}"]`)
        const arrow = btn.querySelector('.section-arrow')
        if (body.classList.contains('hidden')) {
          body.classList.remove('hidden')
          btn.style.borderRadius = '5px 5px 0 0'
          arrow.textContent = '▲'
        } else {
          body.classList.add('hidden')
          btn.style.borderRadius = '5px'
          arrow.textContent = '▼'
        }
      })
    })
  }

  function closePanel() {
    const overlay = $('panel-overlay')
    const panel = $('side-panel')
    if (overlay) overlay.remove()
    if (panel) panel.remove()
    selected = null
  }

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
}
