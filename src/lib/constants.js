export const OWNERS = ['Petra', 'Máté']

export const SOURCES = ['Személyes megkeresés', 'Weboldal űrlap', 'Email', 'Egyéb']

const OWNER_BY_EMAIL = {
  'varrpetra010319@gmail.com': 'Petra',
  'sztahoramate96@gmail.com': 'Máté',
}

export function ownerForEmail(email) {
  return OWNER_BY_EMAIL[email?.toLowerCase()] ?? OWNERS[0]
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('hu-HU')
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('hu-HU')
}
