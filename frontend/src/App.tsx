import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { useAuth } from './context/AuthContext'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { CustomersPage } from './pages/CustomersPage'
import { LoginPage } from './pages/LoginPage'
import { ServicesPage } from './pages/ServicesPage'
import { AgendaPage } from './pages/AgendaPage'
import { FinancePage } from './pages/FinancePage'
import { SettingsPage } from './pages/SettingsPage'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loader"><span className="spinner"/><strong>Preparando seu AgendaPro...</strong></div>
  return user ? <AppLayout /> : <Navigate to="/login" replace />
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route element={<ProtectedLayout/>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="employees" element={<EmployeesPage/>}/>
      <Route path="customers" element={<CustomersPage/>}/>
      <Route path="services" element={<ServicesPage/>}/>
      <Route path="agenda" element={<AgendaPage/>}/>
      <Route path="finance" element={<FinancePage/>}/>
      <Route path="settings" element={<SettingsPage/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
  </Routes>
}
