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
import { InsightsPage } from './pages/InsightsPage'
import { OperationsPage } from './pages/OperationsPage'
import { PublicBookingPage } from './pages/PublicBookingPage'
import { InventoryPage } from './pages/InventoryPage'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loader"><span className="spinner"/><strong>Preparando seu AgendaPro...</strong></div>
  return user ? <AppLayout /> : <Navigate to="/login" replace />
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/book/:slug" element={<PublicBookingPage/>}/>
    <Route element={<ProtectedLayout/>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="employees" element={<EmployeesPage/>}/>
      <Route path="customers" element={<CustomersPage/>}/>
      <Route path="services" element={<ServicesPage/>}/>
      <Route path="agenda" element={<AgendaPage/>}/>
      <Route path="finance" element={<FinancePage/>}/>
      <Route path="insights" element={<InsightsPage/>}/>
      <Route path="operations" element={<OperationsPage/>}/>
      <Route path="inventory" element={<InventoryPage/>}/>
      <Route path="settings" element={<SettingsPage/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
  </Routes>
}
