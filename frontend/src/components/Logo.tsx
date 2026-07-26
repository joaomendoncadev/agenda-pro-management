import { CalendarDays } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark"><CalendarDays size={22} /></span>{!compact && <span>Agenda<span>Pro</span></span>}</div>
}
