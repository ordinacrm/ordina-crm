export const OWNERS = ['Petra', 'Máté']

export const SOURCES = ['Személyes megkeresés', 'Weboldal űrlap', 'Email', 'Egyéb']

const OWNER_BY_EMAIL = {
  'varrpetra010319@gmail.com': 'Petra',
  'sztahoramate96@gmail.com': 'Máté',
}

export function ownerForEmail(email) {
  return OWNER_BY_EMAIL[email?.toLowerCase()] ?? OWNERS[0]
}

export function ownerLabel(owner) {
  return owner || 'Nincs hozzárendelve'
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

export function isToday(dueDate) {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dueDate)
  d.setHours(0, 0, 0, 0)
  return d.getTime() === today.getTime()
}

export function isTimestampToday(timestamp) {
  if (!timestamp) return false
  const today = new Date()
  const d = new Date(timestamp)
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function todayISODate() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('hu-HU')
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('hu-HU')
}
