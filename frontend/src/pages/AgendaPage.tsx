import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Filter, Plus, Users, X } from 'lucide-react'
import { api, ApiError } from '../services/api'
import { Modal } from '../components/Modal'
import { Toast } from '../components/Toast'
import type { Appointment, AppointmentRequest, AppointmentStatus, Customer, Employee, ServiceOffering } from '../types'

type ViewMode = 'week' | 'day'

const HOUR_START = 7
const HOUR_END = 22
const SLOT_MINUTES = 30
const HOUR_HEIGHT = 72

const statusMeta: Record<AppointmentStatus, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendado', className: 'scheduled' },
  CONFIRMED: { label: 'Confirmado', className: 'confirmed' },
  COMPLETED: { label: 'Concluído', className: 'completed' },
  CANCELLED: { label: 'Cancelado', className: 'cancelled' },
  NO_SHOW: { label: 'Não compareceu', className: 'no-show' },
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfWeek(value: string) {
  const date = parseDate(value)
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return date
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toMinutes(value: string) {
  const time = value.slice(11, 16)
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

function localDateTime(date: string, hour = 9, minute = 0) {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function weekLabel(days: Date[]) {
  const first = days[0]
  const last = days[days.length - 1]
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(last)
  return `${first.getDate()} – ${last.getDate()} de ${month} de ${last.getFullYear()}`
}

export function AgendaPage() {
  const today = isoDate(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState<ViewMode>('week')
  const [items, setItems] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<ServiceOffering[]>([])
  const [employeeFilter, setEmployeeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [details, setDetails] = useState<Appointment | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState<AppointmentRequest>({ customerId: '', employeeId: '', serviceId: '', startsAt: localDateTime(today), notes: null })

  const weekDays = useMemo(() => {
    const monday = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
  }, [selectedDate])

  const visibleDays = view === 'day' ? [parseDate(selectedDate)] : weekDays
  const rangeFrom = isoDate(visibleDays[0])
  const rangeTo = isoDate(visibleDays[visibleDays.length - 1])

  const load = async () => {
    setLoading(true)
    try {
      setItems(await api.listAppointments(rangeFrom, rangeTo))
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : 'Erro ao carregar agenda', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [rangeFrom, rangeTo])

  useEffect(() => {
    Promise.all([api.listCustomers(), api.listEmployees(), api.listServices()])
      .then(([customerList, employeeList, serviceList]) => {
        setCustomers(customerList.filter(item => item.status === 'ACTIVE'))
        setEmployees(employeeList.filter(item => item.status === 'ACTIVE'))
        setServices(serviceList.filter(item => item.status === 'ACTIVE'))
      })
      .catch(() => setToast({ message: 'Não foi possível carregar os dados auxiliares.', type: 'error' }))
  }, [])

  const filteredItems = useMemo(() => items.filter(item =>
    (employeeFilter === 'ALL' || item.employeeId === employeeFilter) &&
    (statusFilter === 'ALL' || item.status === statusFilter)
  ), [items, employeeFilter, statusFilter])

  const openCreate = (date = selectedDate, hour = 9, minute = 0) => {
    setEditingId(null)
    setDetails(null)
    setForm({ customerId: '', employeeId: employeeFilter === 'ALL' ? '' : employeeFilter, serviceId: '', startsAt: localDateTime(date, hour, minute), notes: null })
    setFormOpen(true)
  }

  const openEdit = (appointment: Appointment) => {
    setDetails(null)
    setEditingId(appointment.id)
    setForm({
      customerId: appointment.customerId,
      employeeId: appointment.employeeId,
      serviceId: appointment.serviceId,
      startsAt: appointment.startsAt.slice(0, 16),
      notes: appointment.notes,
    })
    setFormOpen(true)
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    try {
      if (editingId) await api.updateAppointment(editingId, form)
      else await api.createAppointment(form)
      setFormOpen(false)
      await load()
      setToast({ message: editingId ? 'Agendamento atualizado.' : 'Agendamento criado.' })
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : 'Erro ao salvar agendamento', type: 'error' })
    }
  }

  const changeStatus = async (appointment: Appointment, status: AppointmentStatus) => {
    try {
      const updated = await api.changeAppointmentStatus(appointment.id, status)
      setDetails(updated)
      await load()
      setToast({ message: `Status alterado para ${statusMeta[status].label}.` })
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : 'Erro ao alterar status', type: 'error' })
    }
  }

  const navigate = (direction: number) => {
    const date = parseDate(selectedDate)
    date.setDate(date.getDate() + direction * (view === 'week' ? 7 : 1))
    setSelectedDate(isoDate(date))
  }

  const slots = Array.from({ length: (HOUR_END - HOUR_START) * 2 }, (_, index) => HOUR_START * 60 + index * SLOT_MINUTES)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowTop = ((nowMinutes - HOUR_START * 60) / 60) * HOUR_HEIGHT

  return <>
    <div className="page-heading agenda-heading">
      <div>
        <span className="eyebrow neutral">OPERAÇÃO</span>
        <h1>Agenda</h1>
        <p>Organize horários, equipe e atendimentos em uma visão clara.</p>
      </div>
      <button className="button primary" onClick={() => openCreate()}><Plus size={18}/>Novo agendamento</button>
    </div>

    <section className="calendar-shell">
      <header className="calendar-toolbar">
        <div className="calendar-navigation">
          <button className="icon-button" aria-label="Período anterior" onClick={() => navigate(-1)}><ChevronLeft size={18}/></button>
          <button className="button secondary small" onClick={() => setSelectedDate(today)}>Hoje</button>
          <button className="icon-button" aria-label="Próximo período" onClick={() => navigate(1)}><ChevronRight size={18}/></button>
          <div className="calendar-period">
            <CalendarDays size={18}/>
            <strong>{view === 'week' ? weekLabel(weekDays) : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(parseDate(selectedDate))}</strong>
          </div>
        </div>
        <div className="calendar-controls">
          <label className="calendar-filter"><Users size={16}/><select value={employeeFilter} onChange={event => setEmployeeFilter(event.target.value)}><option value="ALL">Toda a equipe</option>{employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label>
          <label className="calendar-filter"><Filter size={16}/><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as AppointmentStatus | 'ALL')}><option value="ALL">Todos os status</option>{Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></label>
          <div className="view-switch"><button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Dia</button><button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Semana</button></div>
        </div>
      </header>

      <div className="calendar-legend">
        {Object.entries(statusMeta).map(([status, meta]) => <span key={status}><i className={meta.className}/>{meta.label}</span>)}
      </div>

      <div className={`calendar-scroll ${view === 'day' ? 'day-view' : ''}`}>
        <div className="calendar-grid" style={{ '--calendar-columns': visibleDays.length } as CSSProperties}>
          <div className="calendar-corner"><Clock3 size={15}/><span>Horário</span></div>
          {visibleDays.map(day => {
            const value = isoDate(day)
            const isToday = value === today
            return <button key={value} className={`calendar-day-header ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDate(value); setView('day') }}>
              <span>{new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day).replace('.', '')}</span>
              <strong>{day.getDate()}</strong>
              <small>{filteredItems.filter(item => item.startsAt.slice(0, 10) === value).length} atend.</small>
            </button>
          })}

          <div className="calendar-time-column">
            {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, index) => <span key={index} style={{ top: index * HOUR_HEIGHT }}>{String(HOUR_START + index).padStart(2, '0')}:00</span>)}
          </div>

          {visibleDays.map(day => {
            const date = isoDate(day)
            const dayItems = filteredItems.filter(item => item.startsAt.slice(0, 10) === date)
            return <div className={`calendar-day-column ${date === today ? 'today' : ''}`} key={date} style={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }}>
              {slots.map(minutes => {
                const hour = Math.floor(minutes / 60)
                const minute = minutes % 60
                return <button key={minutes} className="calendar-slot" style={{ top: ((minutes - HOUR_START * 60) / 60) * HOUR_HEIGHT, height: HOUR_HEIGHT / 2 }} onClick={() => openCreate(date, hour, minute)} aria-label={`Agendar em ${date} às ${hour}:${String(minute).padStart(2, '0')}`}/>
              })}
              {date === today && nowMinutes >= HOUR_START * 60 && nowMinutes <= HOUR_END * 60 && <div className="current-time-line" style={{ top: nowTop }}><i/><span>{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>}
              {dayItems.map(appointment => {
                const starts = toMinutes(appointment.startsAt)
                const ends = toMinutes(appointment.endsAt)
                const top = ((starts - HOUR_START * 60) / 60) * HOUR_HEIGHT
                const height = Math.max(((ends - starts) / 60) * HOUR_HEIGHT, 34)
                if (ends <= HOUR_START * 60 || starts >= HOUR_END * 60) return null
                return <button
                  key={appointment.id}
                  className={`calendar-event ${statusMeta[appointment.status].className}`}
                  style={{ top, height }}
                  onClick={event => { event.stopPropagation(); setDetails(appointment) }}
                  title={`${appointment.customerName} · ${appointment.serviceName}`}
                >
                  <strong>{appointment.customerName}</strong>
                  <span>{appointment.startsAt.slice(11, 16)}–{appointment.endsAt.slice(11, 16)}</span>
                  <small>{appointment.serviceName}</small>
                  {view === 'day' && <em>{appointment.employeeName}</em>}
                </button>
              })}
            </div>
          })}
        </div>
        {loading && <div className="calendar-loading"><span className="spinner"/>Carregando agenda…</div>}
      </div>

      {!loading && filteredItems.length === 0 && <div className="calendar-empty"><CalendarDays size={28}/><div><strong>Nenhum atendimento neste período</strong><p>Clique em um horário vazio para criar o primeiro agendamento.</p></div></div>}
    </section>

    {formOpen && <Modal title={editingId ? 'Editar agendamento' : 'Novo agendamento'} subtitle="O horário final é calculado pela duração do serviço." onClose={() => setFormOpen(false)}>
      <form className="form-grid" onSubmit={save}>
        <label className="field full-field">Cliente<select required value={form.customerId} onChange={event => setForm({ ...form, customerId: event.target.value })}><option value="">Selecione</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
        <label className="field">Profissional<select required value={form.employeeId} onChange={event => setForm({ ...form, employeeId: event.target.value })}><option value="">Selecione</option>{employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label>
        <label className="field">Serviço<select required value={form.serviceId} onChange={event => setForm({ ...form, serviceId: event.target.value })}><option value="">Selecione</option>{services.map(service => <option key={service.id} value={service.id}>{service.name} · {service.durationMinutes} min</option>)}</select></label>
        <label className="field full-field">Data e horário<input required type="datetime-local" value={form.startsAt} onChange={event => setForm({ ...form, startsAt: event.target.value })}/></label>
        <label className="field full-field">Observações<textarea value={form.notes || ''} onChange={event => setForm({ ...form, notes: event.target.value || null })}/></label>
        <div className="modal-actions full-field"><button type="button" className="button secondary" onClick={() => setFormOpen(false)}>Cancelar</button><button className="button primary">{editingId ? 'Salvar alterações' : 'Agendar'}</button></div>
      </form>
    </Modal>}

    {details && <Modal title="Detalhes do atendimento" subtitle={`${details.startsAt.slice(8, 10)}/${details.startsAt.slice(5, 7)} · ${details.startsAt.slice(11, 16)}–${details.endsAt.slice(11, 16)}`} onClose={() => setDetails(null)}>
      <div className="appointment-details">
        <div className="appointment-detail-hero"><span className={`appointment-status ${statusMeta[details.status].className}`}>{statusMeta[details.status].label}</span><h2>{details.customerName}</h2><p>{details.serviceName} com {details.employeeName}</p></div>
        <div className="appointment-info-grid"><div><small>VALOR</small><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(details.price)}</strong></div><div><small>DURAÇÃO</small><strong>{toMinutes(details.endsAt) - toMinutes(details.startsAt)} min</strong></div></div>
        {details.notes && <div className="appointment-notes"><small>OBSERVAÇÕES</small><p>{details.notes}</p></div>}
        <label className="field">Alterar status<select value={details.status} onChange={event => void changeStatus(details, event.target.value as AppointmentStatus)}>{Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></label>
        <div className="modal-actions split"><button className="button secondary" onClick={() => setDetails(null)}><X size={17}/>Fechar</button><button className="button primary" onClick={() => openEdit(details)}>Editar agendamento</button></div>
      </div>
    </Modal>}

    {toast && <Toast {...toast}/>} 
  </>
}
