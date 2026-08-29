import { useMemo, useState } from 'react'
import {
  formatDate,
  isOverdue,
  isToday,
  isTimestampToday,
  ownerLabel,
  todayISODate,
} from '../lib/constants'

export default function Today({ leads, stages, onCompleteTask, onPostponeTask, onOpenLead }) {
  const [postponeFor, setPostponeFor] = useState(null)
  const [postponeDate, setPostponeDate] = useState('')

  const stageName = (id) => stages.find((s) => s.id === id)?.name ?? ''

  const openTasks = useMemo(
    () => leads.filter((l) => l.next_action && l.next_action_status === 'nyitott' && l.next_action_due),
    [leads]
  )

  const todayTasks = openTasks.filter((l) => isToday(l.next_action_due))
  const overdueTasks = openTasks.filter((l) => isOverdue(l.next_action_due))
  const completedToday = leads.filter((l) => isTimestampToday(l.next_action_completed_at))
  const postponedToday = leads.filter((l) => isTimestampToday(l.next_action_postponed_at))

  const dueList = [...overdueTasks, ...todayTasks].sort(
    (a, b) => new Date(a.next_action_due) - new Date(b.next_action_due)
  )

  const startPostpone = (lead) => {
    setPostponeFor(lead.id)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setPostponeDate(tomorrow.toISOString().slice(0, 10))
  }

  const confirmPostpone = async () => {
    if (!postponeDate) return
    await onPostponeTask(postponeFor, postponeDate)
    setPostponeFor(null)
  }

  return (
    <div className="today-page">
      <div className="today-header">
        <h2>Mai napom</h2>
        <span className="today-date">{formatDate(todayISODate())}</span>
      </div>

      <div className="today-tiles">
        <div className="today-tile">
          <span className="today-tile-label">Mai teendők</span>
          <span className="today-tile-num">{todayTasks.length}</span>
        </div>
        <div className="today-tile today-tile-overdue">
          <span className="today-tile-label">Lejárt teendők</span>
          <span className="today-tile-num">{overdueTasks.length}</span>
        </div>
        <div className="today-tile today-tile-done">
          <span className="today-tile-label">Lezárt teendők</span>
          <span className="today-tile-num">{completedToday.length}</span>
        </div>
        <div className="today-tile today-tile-postponed">
          <span className="today-tile-label">Elnapolt teendők</span>
          <span className="today-tile-num">{postponedToday.length}</span>
        </div>
      </div>

      <div className="today-list-card">
        <h3>Teendők</h3>
        {dueList.length === 0 ? (
          <div className="today-empty">
            <span className="today-empty-emoji">☀️</span>
            <p>Hoppá! Nincsenek teendőid.</p>
            <span className="today-empty-sub">Nézz szét a lead-ek között, vagy élvezd a nyugalmat.</span>
          </div>
        ) : (
          <ul className="today-task-list">
            {dueList.map((lead) => {
              const overdue = isOverdue(lead.next_action_due)
              return (
                <li key={lead.id} className="today-task-row">
                  <div className="today-task-main" onClick={() => onOpenLead(lead)}>
                    <div className="today-task-title">{lead.name}</div>
                    <div className="today-task-sub">
                      {lead.company && <span>{lead.company}</span>}
                      <span className="today-task-owner">{ownerLabel(lead.owner)}</span>
                      <span className="today-task-stage">{stageName(lead.stage_id)}</span>
                    </div>
                    <div className="today-task-action">{lead.next_action}</div>
                  </div>
                  <div className="today-task-right">
                    <span className={overdue ? 'due overdue' : 'due'}>{formatDate(lead.next_action_due)}</span>
                    {postponeFor === lead.id ? (
                      <div className="today-postpone-picker">
                        <input
                          type="date"
                          value={postponeDate}
                          onChange={(e) => setPostponeDate(e.target.value)}
                        />
                        <button type="button" className="btn-primary" onClick={confirmPostpone}>
                          OK
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setPostponeFor(null)}>
                          Mégse
                        </button>
                      </div>
                    ) : (
                      <div className="today-task-buttons">
                        <button type="button" className="btn-secondary" onClick={() => startPostpone(lead)}>
                          Elnapolás
                        </button>
                        <button type="button" className="btn-primary" onClick={() => onCompleteTask(lead.id)}>
                          ✓ Kész
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
