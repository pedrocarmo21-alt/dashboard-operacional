import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-lg font-medium">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">O endereço não corresponde a nenhuma seção do dashboard.</p>
      <Link to="/" className="text-sm text-signal-ok underline-offset-4 hover:underline">
        Voltar à visão geral
      </Link>
    </div>
  )
}
