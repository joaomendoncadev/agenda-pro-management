import {
  CalendarDays,
  ChevronDown,
  Contact,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Scissors,
  Settings,
  Sun,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Logo } from './Logo'

const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/employees', label: 'Funcionários', icon: Users },
  { to: '/customers', label: 'Clientes', icon: Contact },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/services', label: 'Serviços', icon: Scissors },
  { to: '/finance', label: 'Financeiro', icon: WalletCards },
  { to: '/settings', label: 'Configurações', icon: Settings },
] as const

export function AppLayout() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AP'

  const signOut = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo />
          <button className="icon-button mobile-only" onClick={() => setMobileMenu(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-caption">GESTÃO</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.roles.join(' · ')}</small>
            </div>
          </div>
          <button className="logout-button" onClick={() => void signOut()} title="Sair" aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button aria-label="Fechar menu" className="sidebar-backdrop" onClick={() => setMobileMenu(false)} />
      )}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileMenu(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <div className="topbar-spacer" />
          <button
            className="icon-button"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button className="tenant-switch">
            <span className="avatar small">{initials}</span>
            <span>{user?.name}</span>
            <ChevronDown size={16} />
          </button>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
