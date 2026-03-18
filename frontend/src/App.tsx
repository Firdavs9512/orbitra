import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SitesPage from './pages/SitesPage'
import AddSitePage from './pages/AddSitePage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sites" element={<SitesPage />} />
      <Route path="/sites/new" element={<AddSitePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/sites" replace />} />
    </Routes>
  )
}

export default App
