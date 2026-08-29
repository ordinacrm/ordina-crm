import { useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLeads } from '../hooks/useLeads'
import { OWNERS, SOURCES, isOverdue, ownerForEmail } from '../lib/constants'
import LeadDrawer from '../components/LeadDrawer'
import ProfileModal from '../components/ProfileModal'
import Board from './Board'
import TableView from './TableView'
import Today from './Today'

const NAV_ITEMS = [
  {
    key: 'today',
    label: 'Mai napom',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    key: 'kanban',
    label: 'Értékesítés',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-6 3 4 5-8" />
      </svg>
    ),
  },
  {
    key: 'table',
    label: 'Ügyféladatbázis',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </svg>
    ),
  },
]

const VIEW_TITLES = {
  today: 'Mai napom',
  kanban: 'Értékesítés',
  table: 'Ügyféladatbázis',
}

export default function Dashboard() {
  const {
    stages,
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    moveLeadToStage,
    completeTask,
    postponeTask,
  } = useLeads()
  const { session, signOut } = useAuth()
  const [view, setView] = useState('today')
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('Mind')
  const [sourceFilter, setSourceFilter] = useState('Mind')
  const [onlyOverdue, setOnlyOverdue] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const profileRef = useRef(null)

  const currentUser = ownerForEmail(session?.user?.email)

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (q && !l.name.toLowerCase().includes(q) && !(l.company ?? '').toLowerCase().includes(q)) return false
      if (ownerFilter === 'Nincs hozzárendelve' && l.owner) return false
      if (ownerFilter !== 'Mind' && ownerFilter !== 'Nincs hozzárendelve' && l.owner !== ownerFilter) return false
      if (sourceFilter !== 'Mind' && l.source !== sourceFilter) return false
      if (onlyOverdue && !isOverdue(l.next_action_due)) return false
      return true
    })
  }, [leads, search, ownerFilter, sourceFilter, onlyOverdue])

  const openNew = () => {
    setSelectedLead(null)
    setDrawerOpen(true)
  }

  const openLead = (lead) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  const closeDrawer = () => setDrawerOpen(false)

  const handleSave = async (id, payload) => {
    if (id) await updateLead(id, payload)
    else await createLead(payload)
  }

  const handleDelete = async (id) => {
    await deleteLead(id)
    closeDrawer()
  }

  const closeProfileOnBlur = (e) => {
    if (!profileRef.current?.contains(e.relatedTarget)) setProfileOpen(false)
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Ordina CRM</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={view === item.key ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => setView(item.key)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-side" />
          <input
            className="search-input topbar-search"
            placeholder="Keresés név / cégnév alapján..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="topbar-side topbar-side-right">
            <div
              className="profile-menu"
              ref={profileRef}
              tabIndex={-1}
              onBlur={closeProfileOnBlur}
            >
              <button className="profile-avatar" onClick={() => setProfileOpen((o) => !o)}>
                {currentUser.charAt(0)}
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-name">{currentUser}</div>
                  <div className="profile-dropdown-email">{session?.user?.email}</div>
                  <button
                    className="profile-dropdown-item"
                    onClick={() => {
                      setProfileModalOpen(true)
                      setProfileOpen(false)
                    }}
                  >
                    Profilbeállítások
                  </button>
                  <button className="profile-dropdown-item" onClick={signOut}>Kijelentkezés</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-header">
          <h1>{VIEW_TITLES[view]}</h1>
          <button className="btn-primary btn-pill" onClick={openNew}>+ Új lead</button>
        </div>

        {view !== 'today' && (
          <div className="filterbar">
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option>Mind</option>
              {OWNERS.map((o) => <option key={o}>{o}</option>)}
              <option>Nincs hozzárendelve</option>
            </select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option>Mind</option>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="checkbox-label">
              <input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} />
              Csak lejárt határidejűek
            </label>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-state">Betöltés...</div>
        ) : view === 'today' ? (
          <Today
            leads={leads}
            stages={stages}
            onCompleteTask={completeTask}
            onPostponeTask={postponeTask}
            onOpenLead={openLead}
          />
        ) : view === 'kanban' ? (
          <Board stages={stages} leads={filteredLeads} onCardClick={openLead} onMoveLead={moveLeadToStage} />
        ) : (
          <TableView stages={stages} leads={filteredLeads} onRowClick={openLead} />
        )}

        {drawerOpen && (
          <LeadDrawer
            lead={selectedLead}
            stages={stages}
            onClose={closeDrawer}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}

        {profileModalOpen && (
          <ProfileModal session={session} onClose={() => setProfileModalOpen(false)} />
        )}
      </div>
    </div>
  )
}
