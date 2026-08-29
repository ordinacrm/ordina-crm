import { useEffect, useRef, useState } from 'react'

const OPEN_COLORS = ['#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a']

export function stageColor(stage, openIndex) {
  if (!stage) return '#94a3b8'
  if (stage.is_won) return '#16a34a'
  if (stage.is_lost) return '#111827'
  return OPEN_COLORS[Math.min(openIndex, OPEN_COLORS.length - 1)]
}

export default function StageSelect({ stages, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openStages = stages.filter((s) => !s.is_won && !s.is_lost)
  const wonStages = stages.filter((s) => s.is_won)
  const lostStages = stages.filter((s) => s.is_lost)

  const openIndexOf = (stage) => openStages.findIndex((s) => s.id === stage.id)
  const selected = stages.find((s) => s.id === value)

  const groups = [
    { label: 'Folyamatban', items: openStages },
    { label: 'Sikeres', items: wonStages },
    { label: 'Sikertelen', items: lostStages },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="stage-select" ref={ref}>
      <button type="button" className="stage-select-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="stage-dot" style={{ background: stageColor(selected, openIndexOf(selected ?? {})) }} />
        <span>{selected?.name ?? 'Válassz állapotot'}</span>
      </button>
      {open && (
        <div className="stage-select-menu">
          {groups.map((group) => (
            <div key={group.label} className="stage-select-group">
              <div className="stage-select-group-label">{group.label}</div>
              {group.items.map((stage) => (
                <button
                  type="button"
                  key={stage.id}
                  className="stage-select-option"
                  onClick={() => {
                    onChange(stage.id)
                    setOpen(false)
                  }}
                >
                  <span className="stage-dot" style={{ background: stageColor(stage, openIndexOf(stage)) }} />
                  {stage.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
