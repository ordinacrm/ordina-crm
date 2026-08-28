import { DndContext } from '@dnd-kit/core'
import StageColumn from '../components/StageColumn'

export default function Board({ stages, leads, onCardClick, onMoveLead }) {
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    const leadId = active.id
    const stageId = over.id
    const lead = leads.find((l) => l.id === leadId)
    if (lead && lead.stage_id !== stageId) {
      onMoveLead(leadId, stageId)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="board">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter((l) => l.stage_id === stage.id)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
