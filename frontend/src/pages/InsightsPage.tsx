import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CalendarRange, CalendarX, CircleDollarSign, RefreshCw, TicketCheck, TrendingUp, UsersRound } from 'lucide-react'
import { api } from '../services/api'
import type { AnalyticsSummary } from '../types'

const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const days=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const hours=Array.from({length:15},(_,i)=>i+7)

export function InsightsPage(){
 const now=new Date()
 const [from,setFrom]=useState(iso(new Date(now.getFullYear(),now.getMonth(),1)))
 const [to,setTo]=useState(iso(new Date(now.getFullYear(),now.getMonth()+1,0)))
 const [data,setData]=useState<AnalyticsSummary|null>(null)
 const [loading,setLoading]=useState(false)
 const load=async()=>{setLoading(true);try{setData(await api.analytics(from,to))}finally{setLoading(false)}}
 useEffect(()=>{void load()},[])
 const maxEmployee=useMemo(()=>Math.max(1,...(data?.revenueByEmployee.map(x=>Number(x.value))||[])),[data])
 const maxService=useMemo(()=>Math.max(1,...(data?.appointmentsByService.map(x=>Number(x.value))||[])),[data])
 const maxHeat=useMemo(()=>Math.max(1,...(data?.heatmap.map(x=>Number(x.value))||[])),[data])
 const attendance=(data?.completed||0)+(data?.cancelled||0)+(data?.noShows||0)
 const completionRate=attendance?Math.round((data?.completed||0)/attendance*100):0
 const heatValue=(day:number,hour:number)=>Number(data?.heatmap.find(x=>Number(x.day)%7===day&&Number(x.hour)===hour)?.value||0)
 return <>
  <div className="page-heading insights-heading"><div><span className="eyebrow neutral">INTELIGÊNCIA</span><h1>Indicadores executivos</h1><p>Entenda receita, produtividade, demanda e comportamento dos clientes.</p></div><div className="insights-period"><CalendarRange size={17}/><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><span>até</span><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="button secondary" onClick={()=>void load()} disabled={loading}><RefreshCw size={16} className={loading?'spin':''}/>Atualizar</button></div></div>
  <div className="kpi-grid premium analytics-kpis">
   <article><CircleDollarSign/><small>Faturamento</small><strong>{money(data?.revenue||0)}</strong><em>Receita concluída</em></article>
   <article><TicketCheck/><small>Ticket médio</small><strong>{money(data?.averageTicket||0)}</strong><em>Por atendimento concluído</em></article>
   <article><TrendingUp/><small>Taxa de conclusão</small><strong>{completionRate}%</strong><em>{data?.completed||0} atendimentos</em></article>
   <article><CalendarX/><small>Perdas</small><strong>{(data?.cancelled||0)+(data?.noShows||0)}</strong><em>Cancelamentos e faltas</em></article>
  </div>
  <div className="analytics-grid expanded">
   <section className="content-card"><header><div><h2>Receita por profissional</h2><p>Comparativo de produtividade financeira.</p></div><UsersRound size={20}/></header><div className="bar-list rich">{data?.revenueByEmployee.map((x,index)=><div key={x.label}><b>{index+1}</b><span>{x.label}</span><div><i style={{width:`${Number(x.value)/maxEmployee*100}%`}}/></div><strong>{money(Number(x.value))}</strong></div>)}</div></section>
   <section className="content-card"><header><div><h2>Serviços mais procurados</h2><p>Participação no volume de agendamentos.</p></div><BarChart3 size={20}/></header><div className="service-bars">{data?.appointmentsByService.map((x,index)=><div key={x.label}><div><span>{x.label}</span><strong>{Number(x.value)}</strong></div><div className="progress"><i style={{width:`${Number(x.value)/maxService*100}%`}}/></div><small>{index===0?'Mais popular':''}</small></div>)}</div></section>
  </div>
  <section className="content-card heatmap-card"><header><div><h2>Mapa de calor da agenda</h2><p>Identifique os dias e horários com maior procura.</p></div><span className="heat-legend">Menor <i/><i/><i/><i/> Maior</span></header><div className="heatmap-wrap"><div className="heatmap-grid"><span/>{hours.map(h=><small key={h}>{String(h).padStart(2,'0')}h</small>)}{days.map((day,dayIndex)=><div className="heat-row" key={day}><strong>{day}</strong>{hours.map(hour=>{const value=heatValue(dayIndex,hour);const level=value?Math.max(1,Math.ceil(value/maxHeat*4)):0;return <button key={hour} className={`heat-cell level-${level}`} title={`${day}, ${hour}h: ${value} agendamento(s)`}><span>{value||''}</span></button>})}</div>)}</div></div></section>
 </>
}
