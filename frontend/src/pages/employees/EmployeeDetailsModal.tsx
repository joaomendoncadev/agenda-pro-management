import { CalendarDays, Edit3, Mail, Phone, Power, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import type { Employee } from '../../types'
import { BlocksTab } from './BlocksTab'
import { ScheduleTab } from './ScheduleTab'

export function EmployeeDetailsModal({ employee, onClose, onEdit, onStatus }: { employee: Employee; onClose: () => void; onEdit: () => void; onStatus: () => void }) {
  const [tab, setTab] = useState<'profile'|'schedule'|'blocks'>('profile')
  return <Modal title={employee.name} subtitle={employee.position} onClose={onClose} wide>
    <div className="employee-details-top">{employee.photoUrl ? <img src={employee.photoUrl} alt=""/> : <span className="avatar details-avatar"><UserRound size={28}/></span>}<div className="details-summary"><span className={`badge ${employee.status === 'ACTIVE' ? 'success' : 'neutral'}`}><i/>{employee.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span><p><Mail size={16}/>{employee.email || 'E-mail não informado'}</p><p><Phone size={16}/>{employee.phone || 'Telefone não informado'}</p></div><div className="details-actions"><button className="button secondary" onClick={onEdit}><Edit3 size={17}/> Editar</button><button className={`button ${employee.status === 'ACTIVE' ? 'danger-outline' : 'secondary'}`} onClick={onStatus}><Power size={17}/>{employee.status === 'ACTIVE' ? 'Inativar' : 'Reativar'}</button></div></div>
    <div className="tabs"><button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Perfil</button><button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>Jornada semanal</button><button className={tab === 'blocks' ? 'active' : ''} onClick={() => setTab('blocks')}>Bloqueios</button></div>
    {tab === 'profile' && <div className="profile-grid"><div><small>NOME COMPLETO</small><strong>{employee.name}</strong></div><div><small>CARGO</small><strong>{employee.position}</strong></div><div><small>CADASTRADO EM</small><strong>{new Intl.DateTimeFormat('pt-BR', {dateStyle:'long'}).format(new Date(employee.createdAt))}</strong></div><div><small>ÚLTIMA ATUALIZAÇÃO</small><strong>{new Intl.DateTimeFormat('pt-BR', {dateStyle:'long'}).format(new Date(employee.updatedAt))}</strong></div><div className="profile-tip"><CalendarDays size={21}/><p><strong>Próximo passo</strong><span>Configure a jornada semanal para que este profissional possa receber agendamentos.</span></p></div></div>}
    {tab === 'schedule' && <ScheduleTab employeeId={employee.id}/>} 
    {tab === 'blocks' && <BlocksTab employeeId={employee.id}/>} 
  </Modal>
}
