import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-3">
      <PageHeader title="Página não encontrada" />
      <p className="text-sm text-muted-foreground">O endereço não corresponde a nenhuma seção do dashboard.</p>
      <Link to="/" className="text-sm text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground">
        Voltar à visão geral
      </Link>
    </div>
  )
}
