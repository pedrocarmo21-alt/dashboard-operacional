import { type ReactNode, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AsyncStatus } from '@/types/dashboard'

interface PanelProps {
  title: string
  description?: ReactNode
  /** Controles do cabeçalho; continuam visíveis em todos os estados. */
  actions?: ReactNode
  status: AsyncStatus
  onRetry?: () => void
  emptyMessage?: string
  className?: string
  children: ReactNode
}

/** Painel do dashboard: cabeçalho e os estados de carregamento, vazio e erro num só lugar. */
export function Panel({
  title,
  description,
  actions,
  status,
  onRetry,
  emptyMessage = 'Nenhum dado para exibir.',
  className,
  children,
}: PanelProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={status === 'loading' || undefined}
      className={cn('flex min-w-0 flex-col rounded-lg border bg-card text-card-foreground', className)}
    >
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="min-w-0 flex-1 p-4">
        <PanelBody status={status} onRetry={onRetry} emptyMessage={emptyMessage}>
          {children}
        </PanelBody>
      </div>
    </section>
  )
}

function PanelBody({
  status,
  onRetry,
  emptyMessage,
  children,
}: Pick<PanelProps, 'status' | 'onRetry' | 'emptyMessage' | 'children'>) {
  if (status === 'loading') {
    return (
      <div role="status">
        <span className="sr-only">Carregando…</span>
        <div aria-hidden="true" className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 text-sm">
        <p>Não foi possível carregar os dados.</p>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    )
  }
  if (status === 'empty') {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }
  return children
}
