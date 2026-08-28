import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const { session, loading } = useAuth()

  if (loading) return <div className="loading-state full">Betöltés...</div>

  return session ? <Dashboard /> : <Login />
}

export default App
