import { useMemo, useState } from 'react'
import { formatDate, isOverdue } from '../lib/constants'

const COLUMNS = [
  { key: 'name', label: 'Név' },
  { key: 'company', label: 'Cégnév' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefon' },
  { key: 'source', label: 'Forrás' },
  { key: 'owner', label: 'Felelős' },
  { key: 'stage', label: 'Állapot' },
  { key: 'estimated_value', label: 'Becsült érték' },
  { key: 'last_contact_date', label: 'Utolsó kapcsolat' },
  { key: 'next_action', label: 'Következő teendő' },
  { key: 'next_action_due', label: 'Határidő' },
  { key: 'created_at', label: 'Létrehozva' },
]

export default function TableView({ stages, leads, onRowClick }) {
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const stageName = (id) => stages.find((s) => s.id === id)?.name ?? ''

  const sorted = useMemo(() => {
    const rows = [...leads]
    rows.sort((a, b) => {
      let av = sortKey === 'stage' ? stageName(a.stage_id) : a[sortKey]
      let bv = sortKey === 'stage' ? stageName(b.stage_id) : b[sortKey]
      av = av ?? ''
      bv = bv ?? ''
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, sortKey, sortDir, stages])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="table-wrap">
      <table className="lead-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} onClick={() => toggleSort(col.key)}>
                {col.label}
                {sortKey === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead) => {
            const overdue = isOverdue(lead.next_action_due)
            return (
              <tr key={lead.id} onClick={() => onRowClick(lead)} className={overdue ? 'row-overdue' : ''}>
                <td>{lead.name}</td>
                <td>{lead.company}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.source}</td>
                <td>{lead.owner}</td>
                <td>{stageName(lead.stage_id)}</td>
                <td>{lead.estimated_value != null ? `${lead.estimated_value.toLocaleString('hu-HU')} Ft` : ''}</td>
                <td>{formatDate(lead.last_contact_date)}</td>
                <td>{lead.next_action}</td>
                <td className={overdue ? 'overdue-text' : ''}>{formatDate(lead.next_action_due)}</td>
                <td>{formatDate(lead.created_at)}</td>
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="table-empty">Nincs találat.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
