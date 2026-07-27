import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message?: string }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AgendaPro frontend error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="fatal-error-page">
        <section className="fatal-error-card">
          <span className="eyebrow neutral">ERRO NO FRONTEND</span>
          <h1>Não foi possível carregar o AgendaPro</h1>
          <p>Recarregue a página. Caso o problema continue, abra o Console do navegador para consultar o erro técnico.</p>
          {this.state.message && <pre>{this.state.message}</pre>}
          <button className="button primary" onClick={() => window.location.reload()}>Recarregar página</button>
        </section>
      </main>
    )
  }
}
