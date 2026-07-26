import { CheckCircle2, XCircle } from 'lucide-react'

export function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  return <div className={`toast ${type}`}>{type === 'success' ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}<span>{message}</span></div>
}
