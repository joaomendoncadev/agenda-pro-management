import { CalendarX2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../services/api'
import type { EmployeeBlock } from '../../types'

function toInstant(value: string) { return new Date(value).toISOString() }

export function BlocksTab({ employeeId }: { employeeId: string }) {
  const [blocks, setBlocks] = useState<EmployeeBlock[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ startsAt:'', endsAt:'', reason:'' })
  const load = () => api.listBlocks(employeeId).then(setBlocks)
  useEffect(() => { void load() }, [employeeId])
  const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); try { await api.createBlock(employeeId,{startsAt:toInstant(form.startsAt),endsAt:toInstant(form.endsAt),reason:form.reason}); setForm({startsAt:'',endsAt:'',reason:''}); setFormOpen(false); await load() } finally { setSaving(false) } }
  const remove = async (blockId: string) => { await api.deleteBlock(employeeId, blockId); await load() }

  return <div className="blocks-tab"><div className="tab-intro"><div><h3>Bloqueios de agenda</h3><p>Registre férias, folgas, compromissos ou indisponibilidades.</p></div><button className="button primary small" onClick={() => setFormOpen(current => !current)}><Plus size={16}/> Novo bloqueio</button></div>
    {formOpen && <form className="block-form" onSubmit={submit}><label>Início<input type="datetime-local" value={form.startsAt} onChange={e => setForm({...form,startsAt:e.target.value})} required/></label><label>Fim<input type="datetime-local" value={form.endsAt} onChange={e => setForm({...form,endsAt:e.target.value})} required/></label><label className="reason-field">Motivo<input value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} placeholder="Ex.: Consulta médica" maxLength={200} required/></label><div className="block-form-actions"><button type="button" className="button secondary small" onClick={() => setFormOpen(false)}>Cancelar</button><button className="button primary small" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button></div></form>}
    {blocks.length === 0 ? <div className="empty-inline tall"><CalendarX2 size={30}/><p>Nenhum bloqueio cadastrado.</p><small>Este profissional está disponível conforme a jornada semanal.</small></div> : <div className="blocks-list">{blocks.map(block => <article key={block.id}><span className="block-date"><strong>{new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(block.startsAt))}</strong><small>{new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(new Date(block.startsAt))}</small></span><div><strong>{block.reason}</strong><small>Até {new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(block.endsAt))}</small></div><button className="icon-button danger" onClick={() => void remove(block.id)}><Trash2 size={17}/></button></article>)}</div>}
  </div>
}
