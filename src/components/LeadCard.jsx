import { useDraggable } from '@dnd-kit/core'
import { formatDate, isOverdue } from '../lib/constants'

export default function LeadCard({ lead, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.6 : 1,
      }
    : undefined

  const overdue = isOverdue(lead.next_action_due)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="lead-card"
      onClick={() => onClick(lead)}
    >
      <div className="lead-card-title">{lead.name}</div>
      {lead.company && <div className="lead-card-company">{lead.company}</div>}
      <div className="lead-card-meta">
        <span className="badge">{lead.owner}</span>
        {lead.next_action_due && (
          <span className={overdue ? 'due overdue' : 'due'}>
            {formatDate(lead.next_action_due)}
          </span>
        )}
      </div>
    </div>
  )
}
