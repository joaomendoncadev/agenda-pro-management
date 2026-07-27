import { Boxes, CircleDollarSign, PackagePlus, Search, TriangleAlert, TrendingDown, TrendingUp, UsersRound } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Modal } from '../components/Modal'
import { Toast } from '../components/Toast'
import { ApiError, api } from '../services/api'
import type { CommissionSummary, Employee, InventoryMovement, Product } from '../types'

const money = (value:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)
const number = (value:number) => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value)
const isoMonthStart = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }
const isoToday = () => new Date().toISOString().slice(0,10)

export function InventoryPage() {
  const [tab,setTab]=useState<'products'|'movements'|'commissions'>('products')
  const [products,setProducts]=useState<Product[]>([])
  const [movements,setMovements]=useState<InventoryMovement[]>([])
  const [employees,setEmployees]=useState<Employee[]>([])
  const [commissions,setCommissions]=useState<CommissionSummary|null>(null)
  const [search,setSearch]=useState('')
  const [productModal,setProductModal]=useState(false)
  const [movementProduct,setMovementProduct]=useState<Product|null>(null)
  const [commissionModal,setCommissionModal]=useState(false)
  const [toast,setToast]=useState<{message:string;type?:'success'|'error'}|null>(null)
  const [period,setPeriod]=useState({from:isoMonthStart(),to:isoToday()})

  const load=async()=>{
    try {
      const [p,m,e,c]=await Promise.all([
        api.listProducts(),api.listInventoryMovements(),api.listEmployees(),api.commissions(period.from,period.to),
      ])
      setProducts(p);setMovements(m);setEmployees(e);setCommissions(c)
    } catch(error) {
      setToast({message:error instanceof ApiError?error.message:'Não foi possível carregar estoque e comissões.',type:'error'})
    }
  }
  useEffect(()=>{void load()},[period.from,period.to])

  const filtered=useMemo(()=>products.filter(p=>`${p.name} ${p.sku||''} ${p.category||''}`.toLowerCase().includes(search.toLowerCase())),[products,search])
  const stockValue=products.reduce((sum,p)=>sum+p.stockQuantity*p.costPrice,0)
  const lowStock=products.filter(p=>p.stockQuantity<=p.minimumStock)

  const createProduct=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();const f=new FormData(e.currentTarget)
    try {
      await api.createProduct({name:String(f.get('name')),sku:String(f.get('sku')||''),category:String(f.get('category')||''),salePrice:Number(f.get('salePrice')),costPrice:Number(f.get('costPrice')),initialStock:Number(f.get('initialStock')),minimumStock:Number(f.get('minimumStock'))})
      setProductModal(false);await load();setToast({message:'Produto cadastrado com estoque inicial.'})
    } catch(error){setToast({message:error instanceof ApiError?error.message:'Erro ao cadastrar produto.',type:'error'})}
  }

  const moveStock=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();if(!movementProduct)return;const f=new FormData(e.currentTarget)
    try {
      await api.moveStock(movementProduct.id,{type:String(f.get('type')),quantity:Number(f.get('quantity')),unitCost:Number(f.get('unitCost')||0),reason:String(f.get('reason'))})
      setMovementProduct(null);await load();setToast({message:'Movimentação registrada.'})
    } catch(error){setToast({message:error instanceof ApiError?error.message:'Erro ao movimentar estoque.',type:'error'})}
  }

  const createCommission=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();const f=new FormData(e.currentTarget)
    try {
      await api.generateCommission(String(f.get('employeeId')),{description:String(f.get('description')),baseAmount:Number(f.get('baseAmount')),percentage:Number(f.get('percentage')),occurredOn:String(f.get('occurredOn'))})
      setCommissionModal(false);await load();setToast({message:'Comissão lançada para o profissional.'})
    } catch(error){setToast({message:error instanceof ApiError?error.message:'Erro ao lançar comissão.',type:'error'})}
  }

  const pay=async(employeeId:string)=>{
    try { const r=await api.payCommissions(employeeId,period);await load();setToast({message:`${r.paidEntries} lançamento(s) pagos: ${money(r.amount)}`}) }
    catch(error){setToast({message:error instanceof ApiError?error.message:'Erro ao pagar comissões.',type:'error'})}
  }

  return <>
    <div className="page-heading"><div><span className="eyebrow">OPERAÇÃO</span><h1>Estoque e comissões</h1><p>Controle produtos, entradas, saídas, alertas e repasses dos profissionais.</p></div></div>
    <div className="segmented-tabs inventory-tabs">
      <button className={tab==='products'?'active':''} onClick={()=>setTab('products')}><Boxes size={16}/>Produtos</button>
      <button className={tab==='movements'?'active':''} onClick={()=>setTab('movements')}><TrendingUp size={16}/>Movimentações</button>
      <button className={tab==='commissions'?'active':''} onClick={()=>setTab('commissions')}><UsersRound size={16}/>Comissões</button>
    </div>

    {tab==='products'&&<>
      <div className="inventory-kpis">
        <article><Boxes/><small>Produtos ativos</small><strong>{products.length}</strong></article>
        <article><CircleDollarSign/><small>Valor em estoque</small><strong>{money(stockValue)}</strong></article>
        <article className={lowStock.length?'warning':''}><TriangleAlert/><small>Estoque baixo</small><strong>{lowStock.length}</strong></article>
      </div>
      <section className="content-card">
        <header><div><h2>Catálogo de produtos</h2><p>Itens disponíveis para venda e consumo interno.</p></div><button className="button primary" onClick={()=>setProductModal(true)}><PackagePlus size={16}/>Novo produto</button></header>
        <div className="table-toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto, SKU ou categoria"/></label></div>
        <div className="responsive-table"><table><thead><tr><th>Produto</th><th>SKU</th><th>Preço</th><th>Custo</th><th>Estoque</th><th>Situação</th><th></th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small>{p.category||'Sem categoria'}</small></td><td>{p.sku||'—'}</td><td>{money(p.salePrice)}</td><td>{money(p.costPrice)}</td><td><b>{number(p.stockQuantity)}</b><small>Mínimo: {number(p.minimumStock)}</small></td><td><span className={p.stockQuantity<=p.minimumStock?'status-warning':'status-live'}>{p.stockQuantity<=p.minimumStock?'Repor':'Normal'}</span></td><td><button className="button secondary compact" onClick={()=>setMovementProduct(p)}>Movimentar</button></td></tr>)}</tbody></table></div>
      </section>
    </>}

    {tab==='movements'&&<section className="content-card"><header><div><h2>Histórico de estoque</h2><p>Últimas 200 movimentações registradas.</p></div></header><div className="movement-list">{movements.map(m=><article key={m.id}><span className={`movement-icon ${m.type.toLowerCase()}`}>{m.type==='ENTRY'?<TrendingUp/>:m.type==='EXIT'?<TrendingDown/>:<Boxes/>}</span><div><strong>{m.productName}</strong><small>{m.reason} · {new Date(m.occurredAt).toLocaleString('pt-BR')}</small></div><b>{m.type==='EXIT'?'-':m.type==='ENTRY'?'+':''}{number(m.quantity)}</b></article>)}</div></section>}

    {tab==='commissions'&&<>
      <div className="commission-toolbar"><div className="period-fields"><label>De<input type="date" value={period.from} onChange={e=>setPeriod(v=>({...v,from:e.target.value}))}/></label><label>Até<input type="date" value={period.to} onChange={e=>setPeriod(v=>({...v,to:e.target.value}))}/></label></div><button className="button primary" onClick={()=>setCommissionModal(true)}>Lançar comissão</button></div>
      <div className="inventory-kpis"><article><CircleDollarSign/><small>Total gerado</small><strong>{money(commissions?.total||0)}</strong></article><article className="warning"><TriangleAlert/><small>Pendente</small><strong>{money(commissions?.pending||0)}</strong></article><article><TrendingUp/><small>Pago</small><strong>{money(commissions?.paid||0)}</strong></article></div>
      <section className="content-card"><header><div><h2>Fechamento por profissional</h2><p>Consolidação do período selecionado.</p></div></header><div className="responsive-table"><table><thead><tr><th>Profissional</th><th>Pendente</th><th>Pago</th><th>Total</th><th></th></tr></thead><tbody>{commissions?.employees.map(e=><tr key={e.employeeId}><td><strong>{e.employeeName}</strong></td><td>{money(e.pending)}</td><td>{money(e.paid)}</td><td><b>{money(e.total)}</b></td><td><button disabled={e.pending<=0} className="button secondary compact" onClick={()=>void pay(e.employeeId)}>Marcar como pago</button></td></tr>)}</tbody></table></div></section>
    </>}

    {productModal&&<Modal title="Novo produto" subtitle="Cadastre preços e defina o estoque mínimo." onClose={()=>setProductModal(false)}><form className="form-grid" onSubmit={createProduct}><label className="field full-field">Nome<input name="name" required autoFocus/></label><label className="field">SKU<input name="sku"/></label><label className="field">Categoria<input name="category"/></label><label className="field">Preço de venda<input name="salePrice" type="number" min="0" step="0.01" required/></label><label className="field">Preço de custo<input name="costPrice" type="number" min="0" step="0.01" required/></label><label className="field">Estoque inicial<input name="initialStock" type="number" min="0" step="0.01" defaultValue="0" required/></label><label className="field">Estoque mínimo<input name="minimumStock" type="number" min="0" step="0.01" defaultValue="0" required/></label><div className="modal-actions full-field"><button type="button" className="button secondary" onClick={()=>setProductModal(false)}>Cancelar</button><button className="button primary">Cadastrar produto</button></div></form></Modal>}
    {movementProduct&&<Modal title={`Movimentar · ${movementProduct.name}`} subtitle={`Estoque atual: ${number(movementProduct.stockQuantity)}`} onClose={()=>setMovementProduct(null)}><form className="form-grid" onSubmit={moveStock}><label className="field full-field">Tipo<select name="type" required><option value="ENTRY">Entrada</option><option value="EXIT">Saída</option><option value="ADJUSTMENT">Ajuste de saldo</option></select></label><label className="field">Quantidade<input name="quantity" type="number" min="0" step="0.01" required/></label><label className="field">Custo unitário<input name="unitCost" type="number" min="0" step="0.01"/></label><label className="field full-field">Motivo<input name="reason" required placeholder="Compra, uso interno, avaria, inventário…"/></label><div className="modal-actions full-field"><button type="button" className="button secondary" onClick={()=>setMovementProduct(null)}>Cancelar</button><button className="button primary">Registrar</button></div></form></Modal>}
    {commissionModal&&<Modal title="Lançar comissão" subtitle="Registre um valor avulso ou ajuste do período." onClose={()=>setCommissionModal(false)}><form className="form-grid" onSubmit={createCommission}><label className="field full-field">Profissional<select name="employeeId" required><option value="">Selecione</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label className="field full-field">Descrição<input name="description" required placeholder="Comissão de serviços do período"/></label><label className="field">Valor base<input name="baseAmount" type="number" min="0.01" step="0.01" required/></label><label className="field">Percentual<input name="percentage" type="number" min="0.01" step="0.01" required/></label><label className="field full-field">Data<input name="occurredOn" type="date" defaultValue={isoToday()} required/></label><div className="modal-actions full-field"><button type="button" className="button secondary" onClick={()=>setCommissionModal(false)}>Cancelar</button><button className="button primary">Lançar comissão</button></div></form></Modal>}
    {toast&&<Toast {...toast}/>} 
  </>
}
