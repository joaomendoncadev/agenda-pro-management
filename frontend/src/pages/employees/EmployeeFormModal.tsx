import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import type { Employee, EmployeeRequest } from '../../types'

export function EmployeeFormModal({ employee, onClose, onSave }: { employee: Employee | null; onClose: () => void; onSave: (payload: EmployeeRequest) => Promise<void> }) {
  const [form, setForm] = useState({ name: employee?.name || '', position: employee?.position || '', email: employee?.email || '', phone: employee?.phone || '', photoUrl: employee?.photoUrl || '' })
  const [saving, setSaving] = useState(false)
  const update = (field: keyof typeof form, value: string) => setForm(current => ({...current, [field]: value}))
  const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); try { await onSave({ name: form.name.trim(), position: form.position.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, photoUrl: form.photoUrl.trim() || null }) } finally { setSaving(false) } }

  return <Modal title={employee ? 'Editar funcionário' : 'Novo funcionário'} subtitle="Preencha os dados profissionais e de contato." onClose={onClose}>
    <form className="form-grid" onSubmit={submit}>
      <label className="full-field">Nome completo *<input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex.: Maria Silva" maxLength={120} required /></label>
      <label>Cargo ou especialidade *<input value={form.position} onChange={e => update('position', e.target.value)} placeholder="Ex.: Cabeleireira" maxLength={120} required /></label>
      <label>Telefone<input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(11) 99999-9999" maxLength={30}/></label>
      <label className="full-field">E-mail<input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="profissional@exemplo.com" maxLength={180}/></label>
      <label className="full-field">URL da foto <span>(opcional)</span><input type="url" value={form.photoUrl} onChange={e => update('photoUrl', e.target.value)} placeholder="https://..." maxLength={500}/></label>
      <div className="modal-actions full-field"><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Salvando...' : employee ? 'Salvar alterações' : 'Cadastrar funcionário'}</button></div>
    </form>
  </Modal>
}
