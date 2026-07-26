import { Cake, Mail, MessageCircle, Pencil, Power, UserRound } from 'lucide-react'
import { Modal } from '../../components/Modal'
import type { Customer } from '../../types'

export function CustomerDetailsModal({customer,onClose,onEdit,onStatus}:{customer:Customer;onClose:()=>void;onEdit:()=>void;onStatus:()=>void}) {
 const birthday=customer.birthDate?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(customer.birthDate+'T00:00:00Z')):'Não informado'
 return <Modal title="Detalhes do cliente" subtitle="Informações de contato e relacionamento." onClose={onClose} wide>
  <div className="customer-profile"><span className="avatar customer-avatar"><UserRound size={28}/></span><div><h2>{customer.name}</h2><span className={`badge ${customer.status==='ACTIVE'?'success':'neutral'}`}><i/>{customer.status==='ACTIVE'?'Ativo':'Inativo'}</span></div></div>
  <div className="detail-grid"><div><Mail size={18}/><span><small>E-mail</small><strong>{customer.email||'Não informado'}</strong></span></div><div><MessageCircle size={18}/><span><small>WhatsApp / telefone</small><strong>{customer.phone||'Não informado'}</strong></span></div><div><Cake size={18}/><span><small>Aniversário</small><strong>{birthday}</strong></span></div></div>
  <section className="notes-card"><small>OBSERVAÇÕES</small><p>{customer.notes||'Nenhuma observação cadastrada.'}</p></section>
  <div className="modal-actions split"><button className="button danger-ghost" onClick={onStatus}><Power size={17}/>{customer.status==='ACTIVE'?'Inativar cliente':'Reativar cliente'}</button><div><button className="button secondary" onClick={onClose}>Fechar</button><button className="button primary" onClick={onEdit}><Pencil size={17}/> Editar</button></div></div>
 </Modal>
}
