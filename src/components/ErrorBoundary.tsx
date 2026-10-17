import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  fallback: ReactNode
  /** Quando muda (por exemplo, a rota), o erro é descartado e os filhos são tentados de novo. */
  resetKey?: unknown
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  resetKey: unknown
}

/** Captura erros de renderização (e de imports sob demanda) e mostra o fallback no lugar. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    return props.resetKey !== state.resetKey ? { hasError: false, resetKey: props.resetKey } : null
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
