import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RequestStatus } from '@/types/dashboard'

interface DataStatusProps {
  status: RequestStatus
  /** Há dados anteriores na tela (o erro é de uma recarga). */
  hasData: boolean
  onRetry: () => void
}

/**
 * Anúncio de carregamento e aviso de erro da página, uma vez só. A requisição é única,
 * então anunciar em cada painel repetiria a mesma mensagem para o leitor de tela.
 */
export function DataStatus({ status, hasData, onRetry }: DataStatusProps) {
  const retry = () => {
    // O botão some quando a nova carga começa; o foco vai para o início do conteúdo
    // em vez de cair no <body>.
    document.getElementById('conteudo')?.focus()
    onRetry()
  }

  return (
    <>
      <p role="status" className="sr-only">
        {status === 'loading' ? 'Carregando dados…' : ''}
      </p>
      {status === 'error' && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-signal-warn/40 bg-card px-4 py-3 text-sm">
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-signal-warn" />
          <p className="flex-1">
            {hasData
              ? 'Não foi possível atualizar os dados. Mostrando os dados anteriores.'
              : 'Não foi possível carregar os dados.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </>
  )
}
