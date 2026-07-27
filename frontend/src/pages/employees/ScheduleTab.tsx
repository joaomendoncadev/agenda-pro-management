import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { DayOfWeek, WorkScheduleRequest } from '../../types'

const days: {key: DayOfWeek; label: string}[] = [
  {key:'MONDAY',label:'Segunda-feira'}, {key:'TUESDAY',label:'Terça-feira'}, {key:'WEDNESDAY',label:'Quarta-feira'}, {key:'THURSDAY',label:'Quinta-feira'}, {key:'FRIDAY',label:'Sexta-feira'}, {key:'SATURDAY',label:'Sábado'}, {key:'SUNDAY',label:'Domingo'},
]
const defaultSchedule = (dayOfWeek: DayOfWeek): WorkScheduleRequest => ({ dayOfWeek, working: !['SUNDAY'].includes(dayOfWeek), startTime:'09:00', endTime:'18:00', breakStart:'12:00', breakEnd:'13:00' })

export function ScheduleTab({ employeeId }: { employeeId: string }) {
  const [schedules, setSchedules] = useState<Record<DayOfWeek, WorkScheduleRequest>>(() => Object.fromEntries(days.map(day => [day.key, defaultSchedule(day.key)])) as Record<DayOfWeek, WorkScheduleRequest>)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    api.listSchedules(employeeId)
      .then(data => setSchedules(current => {
        const next = {...current}
        data.forEach(item => {
          next[item.dayOfWeek] = {
            dayOfWeek: item.dayOfWeek,
            working: item.working,
            startTime: item.startTime,
            endTime: item.endTime,
            breakStart: item.breakStart,
            breakEnd: item.breakEnd,
          }
        })
        return next
      }))
      .finally(() => setLoading(false))
  }, [employeeId])
  const update = (day: DayOfWeek, patch: Partial<WorkScheduleRequest>) => setSchedules(current => ({...current, [day]: {...current[day], ...patch}}))
  const save = async () => { setSaving(true); setMessage(''); try { for (const day of days) { const schedule = schedules[day.key]; await api.saveSchedule(employeeId, schedule.working ? schedule : {...schedule,startTime:null,endTime:null,breakStart:null,breakEnd:null}) } setMessage('Jornada salva com sucesso.') } finally { setSaving(false) } }
  if (loading) return <div className="loading-state"><span className="spinner"/> Carregando jornada...</div>

  return <div className="schedule-tab"><div className="tab-intro"><div><h3>Jornada semanal</h3><p>Defina os dias e horários regulares deste profissional.</p></div><button className="button primary small" onClick={() => void save()} disabled={saving}><Save size={16}/>{saving ? 'Salvando...' : 'Salvar jornada'}</button></div>{message && <div className="success-message">{message}</div>}
    <div className="schedule-list">{days.map(day => { const item = schedules[day.key]; return <div className={`schedule-row ${!item.working ? 'off' : ''}`} key={day.key}><label className="switch"><input type="checkbox" checked={item.working} onChange={e => update(day.key,{working:e.target.checked})}/><span/></label><strong>{day.label}</strong>{item.working ? <div className="schedule-times"><input type="time" value={item.startTime || ''} onChange={e => update(day.key,{startTime:e.target.value})}/><span>até</span><input type="time" value={item.endTime || ''} onChange={e => update(day.key,{endTime:e.target.value})}/><em>Intervalo</em><input type="time" value={item.breakStart || ''} onChange={e => update(day.key,{breakStart:e.target.value || null})}/><span>até</span><input type="time" value={item.breakEnd || ''} onChange={e => update(day.key,{breakEnd:e.target.value || null})}/></div> : <span className="day-off">Folga</span>}</div>})}</div>
  </div>
}
