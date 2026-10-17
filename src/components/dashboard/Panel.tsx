import { type ReactNode, useId } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AsyncStatus } from '@/types/dashboard'

interface PanelProps {
  title: string
  description?: ReactNode
  status: AsyncStatus
  /** Recarregando com o conteúdo anterior na tela: esmaecido e marcado como ocupado. */
  refreshing?: boolean
  /** Conteúdo anterior a uma recarga que falhou: esmaecido. */
  stale?: boolean
  emptyMessage?: string
  className?: string
  children: ReactNode
}

/**
 * Painel do dashboard: cabeçalho e os estados de carregamento, vazio e erro num só lugar.
 * Carregamento e erro não são anunciados aqui: a página tem um anúncio e um aviso únicos
 * (DataStatus), em vez de um por painel.
 */
export function Panel({
  title,
  description,
  status,
  refreshing = false,
  stale = false,
  emptyMessage = 'Nenhum dado para exibir.',
  className,
  children,
}: PanelProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={status === 'loading' || refreshing || undefined}
      className={cn('flex min-w-0 flex-col rounded-lg border bg-card text-card-foreground', className)}
    >
      <header className="border-b px-4 py-3">
        <h2 id={titleId} className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div
        data-testid="panel-body"
        className={cn('min-w-0 flex-1 p-4 transition-opacity', (refreshing || stale) && 'opacity-50')}
      >
        <PanelBody status={status} emptyMessage={emptyMessage}>
          {children}
        </PanelBody>
      </div>
    </section>
  )
}

function PanelBody({ status, emptyMessage, children }: Pick<PanelProps, 'status' | 'emptyMessage' | 'children'>) {
  if (status === 'loading') {
    return (
      <div data-testid="panel-skeleton" aria-hidden="true" className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }
  if (status === 'error') return <p className="text-sm text-muted-foreground">Dados indisponíveis.</p>
  if (status === 'empty') return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  return children
}
