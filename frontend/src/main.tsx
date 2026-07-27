import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppProviders } from './app/AppProviders'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><AppErrorBoundary><AppProviders><App/></AppProviders></AppErrorBoundary></StrictMode>)
