import { CalendarClock, Edit3, MoreHorizontal, Plus, Search, SlidersHorizontal, UserRound, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Employee, EmployeeRequest, EmployeeStatus } from '../types'
import { EmployeeFormModal } from './employees/EmployeeFormModal'
import { EmployeeDetailsModal } from './employees/EmployeeDetailsModal'
import { Toast } from '../components/Toast'

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | EmployeeStatus>('ALL')
  const [editing, setEditing] = useState<Employee | null | 'new'>(null)
  const [details, setDetails] = useState<Employee | null>(null)
  const [toast, setToast] = useState<{message: string; type?: 'success'|'error'} | null>(null)

  const load = async () => { setLoading(true); try { setEmployees(await api.listEmployees()) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3200); return () => window.clearTimeout(timer) }, [toast])

  const filtered = useMemo(() => employees.filter(employee => {
    const matchesSearch = `${employee.name} ${employee.position} ${employee.email || ''}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (status === 'ALL' || employee.status === status)
  }), [employees, search, status])

  const save = async (payload: EmployeeRequest) => {
    try {
      if (editing === 'new') { await api.createEmployee(payload); setToast({message: 'Funcionário cadastrado com sucesso.'}) }
      else if (editing) { await api.updateEmployee(editing.id, payload); setToast({message: 'Dados atualizados com sucesso.'}) }
      setEditing(null); await load()
    } catch (error) { setToast({message: error instanceof ApiError ? error.message : 'Não foi possível salvar.', type: 'error'}); throw error }
  }

  const changeStatus = async (employee: Employee) => {
    const nextStatus: EmployeeStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try { await api.changeEmployeeStatus(employee.id, nextStatus); await load(); setDetails(current => current ? {...current, status: nextStatus} : null); setToast({message: nextStatus === 'ACTIVE' ? 'Funcionário reativado.' : 'Funcionário inativado.'}) }
    catch (error) { setToast({message: error instanceof ApiError ? error.message : 'Não foi possível alterar o status.', type: 'error'}) }
  }

  return <>
    <div className="page-heading"><div><span className="eyebrow neutral">GESTÃO DE EQUIPE</span><h1>Funcionários</h1><p>Cadastre profissionais, defina jornadas e gerencie bloqueios.</p></div><button className="button primary" onClick={() => setEditing('new')}><Plus size={18}/> Novo funcionário</button></div>
    <section className="panel employee-panel">
      <div className="toolbar"><div className="search-box"><Search size={18}/><input placeholder="Buscar por nome, cargo ou e-mail..." value={search} onChange={e => setSearch(e.target.value)}/></div><div className="filter-group"><SlidersHorizontal size={17}/><select value={status} onChange={e => setStatus(e.target.value as 'ALL'|EmployeeStatus)}><option value="ALL">Todos os status</option><option value="ACTIVE">Ativos</option><option value="INACTIVE">Inativos</option></select></div></div>
      {loading ? <div className="loading-state"><span className="spinner"/> Carregando equipe...</div> : filtered.length === 0 ? <div className="empty-state"><span><Users size={32}/></span><h3>{employees.length ? 'Nenhum resultado encontrado' : 'Sua equipe começa aqui'}</h3><p>{employees.length ? 'Tente alterar os filtros da busca.' : 'Cadastre o primeiro profissional para começar a configurar horários e disponibilidade.'}</p>{employees.length === 0 && <button className="button primary" onClick={() => setEditing('new')}><Plus size={18}/> Cadastrar funcionário</button>}</div> :
      <div className="employee-table-wrap"><table className="employee-table"><thead><tr><th>PROFISSIONAL</th><th>CARGO</th><th>CONTATO</th><th>STATUS</th><th>ATUALIZADO</th><th></th></tr></thead><tbody>{filtered.map(employee => <tr key={employee.id} onClick={() => setDetails(employee)}><td><div className="employee-cell">{employee.photoUrl ? <img src={employee.photoUrl} alt=""/> : <span className="avatar employee-avatar"><UserRound size={19}/></span>}<div><strong>{employee.name}</strong><small>ID {employee.id.slice(0,8)}</small></div></div></td><td>{employee.position}</td><td><div className="contact-cell"><span>{employee.email || 'E-mail não informado'}</span><small>{employee.phone || 'Telefone não informado'}</small></div></td><td><span className={`badge ${employee.status === 'ACTIVE' ? 'success' : 'neutral'}`}><i/>{employee.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span></td><td>{new Intl.DateTimeFormat('pt-BR').format(new Date(employee.updatedAt))}</td><td><button className="icon-button" onClick={event => {event.stopPropagation(); setDetails(employee)}}><MoreHorizontal size={19}/></button></td></tr>)}</tbody></table></div>}
      <footer className="table-footer"><span>{filtered.length} {filtered.length === 1 ? 'profissional' : 'profissionais'}</span><span><CalendarClock size={15}/> Jornada e bloqueios disponíveis nos detalhes</span></footer>
    </section>
    {editing && <EmployeeFormModal employee={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={save}/>} 
    {details && <EmployeeDetailsModal employee={details} onClose={() => setDetails(null)} onEdit={() => {setEditing(details); setDetails(null)}} onStatus={() => void changeStatus(details)}/>} 
    {toast && <Toast {...toast}/>} 
  </>
}
