import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLeadNotes } from '../hooks/useLeads'
import { OWNERS, SOURCES, formatDateTime, ownerForEmail } from '../lib/constants'

const emptyLead = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: SOURCES[0],
  owner: OWNERS[0],
  stage_id: '',
  estimated_value: '',
  last_contact_date: '',
  next_action: '',
  next_action_due: '',
  lost_reason: '',
}

export default function LeadDrawer({ lead, stages, onClose, onSave, onDelete }) {
  const isNew = !lead
  const [form, setForm] = useState(() => (lead ? { ...emptyLead, ...lead } : { ...emptyLead, stage_id: stages[0]?.id ?? '' }))
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const { session } = useAuth()
  const currentUser = ownerForEmail(session?.user?.email)
  const { notes, addNote } = useLeadNotes(lead?.id)

  useEffect(() => {
    setForm(lead ? { ...emptyLead, ...lead } : { ...emptyLead, stage_id: stages[0]?.id ?? '' })
  }, [lead, stages])

  const currentStage = stages.find((s) => s.id === form.stage_id)

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        estimated_value: form.estimated_value === '' ? null : Number(form.estimated_value),
        last_contact_date: form.last_contact_date || null,
        next_action_due: form.next_action_due || null,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        next_action: form.next_action || null,
        lost_reason: form.lost_reason || null,
        owner: form.owner || null,
      }
      delete payload.id
      delete payload.created_at
      await onSave(lead?.id, payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    await addNote(currentUser, noteText.trim())
    setNoteText('')
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{isNew ? 'Új lead' : lead.name}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form">
          <label>
            Név
            <input value={form.name} onChange={handleChange('name')} required />
          </label>
          <label>
            Cégnév
            <input value={form.company ?? ''} onChange={handleChange('company')} />
          </label>
          <div className="form-row">
            <label>
              Email
              <input type="email" value={form.email ?? ''} onChange={handleChange('email')} />
            </label>
            <label>
              Telefonszám
              <input value={form.phone ?? ''} onChange={handleChange('phone')} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Forrás
              <select value={form.source} onChange={handleChange('source')}>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Felelős
              <select value={form.owner ?? ''} onChange={handleChange('owner')}>
                <option value="">Nincs hozzárendelve</option>
                {OWNERS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Állapot
            <select value={form.stage_id} onChange={handleChange('stage_id')}>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          {currentStage?.is_lost && (
            <label>
              Elutasítás oka
              <input value={form.lost_reason ?? ''} onChange={handleChange('lost_reason')} />
            </label>
          )}
          <div className="form-row">
            <label>
              Becsült érték (Ft)
              <input type="number" value={form.estimated_value ?? ''} onChange={handleChange('estimated_value')} />
            </label>
            <label>
              Utolsó kapcsolatfelvétel
              <input type="date" value={form.last_contact_date ?? ''} onChange={handleChange('last_contact_date')} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Következő teendő
              <input value={form.next_action ?? ''} onChange={handleChange('next_action')} placeholder="pl. hívás, ajánlat kiküldése" />
            </label>
            <label>
              Határidő
              <input type="date" value={form.next_action_due ?? ''} onChange={handleChange('next_action_due')} />
            </label>
          </div>

          <div className="drawer-actions">
            {!isNew && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  if (confirm('Biztosan törlöd ezt a leadet?')) onDelete(lead.id)
                }}
              >
                Törlés
              </button>
            )}
            <div className="drawer-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>Mégse</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Mentés...' : 'Mentés'}
              </button>
            </div>
          </div>
        </form>

        {!isNew && (
          <div className="notes-section">
            <h3>Jegyzetek</h3>
            <div className="note-add">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={`Új bejegyzés (${currentUser})`}
                rows={2}
              />
              <button type="button" className="btn-primary" onClick={handleAddNote}>Hozzáadás</button>
            </div>
            <ul className="note-list">
              {notes.map((n) => (
                <li key={n.id} className="note-item">
                  <div className="note-meta">
                    <strong>{n.author}</strong> · {formatDateTime(n.created_at)}
                  </div>
                  <div className="note-body">{n.body}</div>
                </li>
              ))}
              {notes.length === 0 && <li className="note-empty">Még nincs jegyzet.</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
