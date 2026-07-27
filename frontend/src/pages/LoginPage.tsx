import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CalendarCheck2, LockKeyhole, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Digite um e-mail válido.'),
  password: z.string().min(8, 'A senha deve possuir pelo menos 8 caracteres.'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@agendapro.local', password: 'ChangeMe123!' },
  })
  if (user) return <Navigate to="/" replace />

  const submit = handleSubmit(async ({ email, password }) => {
    try { await login(email, password); navigate('/') }
    catch (error) {
      setError('root', { message: error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente novamente.' })
    }
  })

  return <main className="login-page">
    <section className="login-brand-panel">
      <Logo />
      <div className="login-hero">
        <span className="eyebrow"><Sparkles size={15}/> Gestão simples, resultados melhores</span>
        <h1>Seu negócio organizado.<br/><em>Seu tempo valorizado.</em></h1>
        <p>Gerencie sua equipe, agenda e clientes em um só lugar — com clareza e sem complicação.</p>
        <div className="login-feature"><span><CalendarCheck2 size={22}/></span><div><strong>Controle completo da rotina</strong><small>Visualize horários, bloqueios e disponibilidade da equipe.</small></div></div>
        <div className="login-feature"><span><LockKeyhole size={22}/></span><div><strong>Dados protegidos</strong><small>Acesso seguro e isolado para cada estabelecimento.</small></div></div>
      </div>
      <p className="login-copyright">© 2026 AgendaPro. Feito para quem transforma cuidado em negócio.</p>
    </section>
    <section className="login-form-panel">
      <div className="login-card">
        <div className="mobile-login-logo"><Logo /></div>
        <span className="login-kicker">BEM-VINDO DE VOLTA</span>
        <h2>Acesse sua conta</h2>
        <p>Entre com seus dados para continuar.</p>
        <form onSubmit={submit} noValidate>
          <label>E-mail<input type="email" autoComplete="email" {...register('email')} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
          <label>Senha<input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <small className="field-error">{errors.password.message}</small>}</label>
          {errors.root && <div className="form-error">{errors.root.message}</div>}
          <button className="button primary full" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : <>Entrar <ArrowRight size={18}/></>}</button>
        </form>
        <p className="login-help">Problemas para acessar? Fale com o administrador do estabelecimento.</p>
      </div>
    </section>
  </main>
}
