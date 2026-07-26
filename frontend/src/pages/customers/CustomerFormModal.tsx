import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import type { Customer, CustomerRequest } from '../../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.').max(120),
  email: z.string().trim().email('Informe um e-mail válido.').or(z.literal('')),
  phone: z.string().trim().max(30),
  birthDate: z.string(),
  notes: z.string().trim().max(2000),
})
type FormData = z.infer<typeof schema>

export function CustomerFormModal({customer,onClose,onSave}:{customer:Customer|null;onClose:()=>void;onSave:(payload:CustomerRequest)=>Promise<void>}) {
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormData>({resolver:zodResolver(schema),defaultValues:{name:customer?.name||'',email:customer?.email||'',phone:customer?.phone||'',birthDate:customer?.birthDate||'',notes:customer?.notes||''}})
 const submit=handleSubmit(async data=>onSave({name:data.name,email:data.email||null,phone:data.phone||null,birthDate:data.birthDate||null,notes:data.notes||null}))
 return <Modal title={customer?'Editar cliente':'Novo cliente'} subtitle="Mantenha os dados de contato e relacionamento organizados." onClose={onClose}>
  <form className="form-stack" onSubmit={submit}>
   <label className="field"><span>Nome completo *</span><input autoFocus {...register('name')} placeholder="Ex.: Ana Souza"/>{errors.name&&<small className="field-error">{errors.name.message}</small>}</label>
   <div className="form-grid two"><label className="field"><span>E-mail</span><input type="email" {...register('email')} placeholder="ana@email.com"/>{errors.email&&<small className="field-error">{errors.email.message}</small>}</label><label className="field"><span>WhatsApp / telefone</span><input {...register('phone')} placeholder="(11) 99999-9999"/></label></div>
   <label className="field"><span>Data de nascimento</span><input type="date" {...register('birthDate')}/></label>
   <label className="field"><span>Observações</span><textarea rows={4} {...register('notes')} placeholder="Preferências, alergias, informações importantes..."/>{errors.notes&&<small className="field-error">{errors.notes.message}</small>}</label>
   <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" disabled={isSubmitting}>{isSubmitting?'Salvando...':customer?'Salvar alterações':'Cadastrar cliente'}</button></div>
  </form>
 </Modal>
}
