import { useEffect, useState } from 'react'
import { Cake, CalendarCheck2, Clock3, Mail, MessageCircle, Pencil, Power, Receipt, Star, UserRound } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { api } from '../../services/api'
import type { Customer, CustomerProfile } from '../../types'
const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
const dateTime=(v:string)=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))
export function CustomerDetailsModal({customer,onClose,onEdit,onStatus}:{customer:Customer;onClose:()=>void;onEdit:()=>void;onStatus:()=>void}) {
 const [profile,setProfile]=useState<CustomerProfile|null>(null)
 const [loading,setLoading]=useState(true)
 useEffect(()=>{api.customerProfile(customer.id).then(setProfile).finally(()=>setLoading(false))},[customer.id])
 const birthday=customer.birthDate?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(customer.birthDate+'T00:00:00Z')):'Não informado'
 const last=profile?.history?.[0]
 return <Modal title="Perfil do cliente" subtitle="Relacionamento, histórico e valor do cliente." onClose={onClose} wide>
  <div className="customer-profile premium-profile"><span className="avatar customer-avatar"><UserRound size={28}/></span><div><h2>{customer.name}</h2><div className="profile-badges"><span className={`badge ${customer.status==='ACTIVE'?'success':'neutral'}`}><i/>{customer.status==='ACTIVE'?'Ativo':'Inativo'}</span>{profile&&profile.completedVisits>=5&&<span className="badge vip"><Star size={11}/>Cliente recorrente</span>}</div></div></div>
  <div className="customer-metrics"><article><Receipt/><span><small>Total gasto</small><strong>{loading?'—':money(profile?.totalSpent||0)}</strong></span></article><article><CalendarCheck2/><span><small>Visitas concluídas</small><strong>{loading?'—':profile?.completedVisits||0}</strong></span></article><article><Clock3/><span><small>Última visita</small><strong>{last?dateTime(last.startsAt):'Sem histórico'}</strong></span></article></div>
  <div className="detail-grid"><div><Mail size={18}/><span><small>E-mail</small><strong>{customer.email||'Não informado'}</strong></span></div><div><MessageCircle size={18}/><span><small>WhatsApp / telefone</small><strong>{customer.phone||'Não informado'}</strong></span></div><div><Cake size={18}/><span><small>Aniversário</small><strong>{birthday}</strong></span></div></div>
  <section className="notes-card"><small>OBSERVAÇÕES</small><p>{customer.notes||'Nenhuma observação cadastrada.'}</p></section>
  <section className="customer-history"><header><div><h3>Histórico de atendimentos</h3><p>Últimos serviços realizados e agendados.</p></div><span>{profile?.history.length||0} registros</span></header>{loading?<div className="loading-row"><span className="spinner"/>Carregando histórico…</div>:profile?.history.length?<div className="history-list">{profile.history.map(item=><article key={item.id}><div className={`history-status ${item.status.toLowerCase()}`}/><div><strong>{item.serviceName}</strong><span>{item.employeeName} · {dateTime(item.startsAt)}</span></div><b>{money(item.price)}</b><small>{item.status==='COMPLETED'?'Concluído':item.status==='CANCELLED'?'Cancelado':item.status==='NO_SHOW'?'Falta':'Agendado'}</small></article>)}</div>:<div className="empty-history">Nenhum atendimento registrado para este cliente.</div>}</section>
  <div className="modal-actions split"><button className="button danger-ghost" onClick={onStatus}><Power size={17}/>{customer.status==='ACTIVE'?'Inativar cliente':'Reativar cliente'}</button><div><button className="button secondary" onClick={onClose}>Fechar</button><button className="button primary" onClick={onEdit}><Pencil size={17}/> Editar</button></div></div>
 </Modal>
}
