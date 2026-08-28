import { useDroppable } from '@dnd-kit/core'
import LeadCard from './LeadCard'

export default function StageColumn({ stage, leads, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="stage-column" ref={setNodeRef} data-over={isOver}>
      <div className="stage-column-header">
        <span>{stage.name}</span>
        <span className="stage-count">{leads.length}</span>
      </div>
      <div className="stage-column-body">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onCardClick} />
        ))}
        {leads.length === 0 && <div className="stage-empty">Nincs itt lead</div>}
      </div>
    </div>
  )
}
