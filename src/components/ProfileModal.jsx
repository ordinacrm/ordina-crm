import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ownerForEmail } from '../lib/constants'

export default function ProfileModal({ session, onClose }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const currentUser = ownerForEmail(session?.user?.email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('A két jelszó nem egyezik.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Profilbeállítások</h2>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-basic-info">
          <div>
            <span className="profile-field-label">Név</span>
            <span className="profile-field-value">{currentUser}</span>
          </div>
          <div>
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value">{session?.user?.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form">
          <h3>Jelszó módosítása</h3>
          <label>
            Új jelszó
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Legalább 6 karakter"
              required
            />
          </label>
          <label>
            Új jelszó megerősítése
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="profile-success">Jelszó sikeresen frissítve.</p>}

          <div className="drawer-actions">
            <div className="drawer-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>Bezárás</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Mentés...' : 'Jelszó mentése'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
