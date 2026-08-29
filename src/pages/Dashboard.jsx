import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLeads } from '../hooks/useLeads'
import { OWNERS, SOURCES, isOverdue } from '../lib/constants'
import LeadDrawer from '../components/LeadDrawer'
import Board from './Board'
import TableView from './TableView'

export default function Dashboard() {
  const { stages, leads, loading, error, createLead, updateLead, deleteLead, moveLeadToStage } = useLeads()
  const { signOut } = useAuth()
  const [view, setView] = useState('kanban')
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('Mind')
  const [sourceFilter, setSourceFilter] = useState('Mind')
  const [onlyOverdue, setOnlyOverdue] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <h1>Ordina CRM</h1>
          <div className="view-toggle">
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Kanban</button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Táblázat</button>
          </div>
        </div>
        <div className="topbar-right">
          <button className="btn-primary" onClick={openNew}>+ Új lead</button>
          <button className="btn-secondary" onClick={signOut}>Kijelentkezés</button>
        </div>
      </header>

      <div className="filterbar">
        <input
          className="search-input"
          placeholder="Keresés név / cégnév alapján..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Betöltés...</div>
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
    </div>
  )
}
