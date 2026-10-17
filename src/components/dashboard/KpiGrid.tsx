import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AsyncStatus, Kpi } from '@/types/dashboard'
import { KpiCard } from './KpiCard'

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'

interface KpiGridProps {
  kpis: Kpi[]
  status: AsyncStatus
  /** Recarregando com KPIs anteriores na tela: mostra-os esmaecidos. */
  refreshing?: boolean
  onRetry?: () => void
}

/** Linha de KPIs com os mesmos estados de um painel: carregando, vazio e erro. */
export function KpiGrid({ kpis, status, refreshing = false, onRetry }: KpiGridProps) {
  return (
    <section aria-label="Indicadores" aria-busy={status === 'loading' || refreshing || undefined}>
      {status === 'loading' ? (
        <div role="status">
          <span className="sr-only">Carregando indicadores…</span>
          <div aria-hidden="true" className={GRID}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} data-testid="kpi-skeleton" className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      ) : status === 'error' ? (
        <div role="alert" className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
          <p>Não foi possível carregar os indicadores.</p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      ) : status === 'empty' ? (
        <p className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">Sem indicadores para o período.</p>
      ) : (
        <div className={cn(GRID, 'transition-opacity', refreshing && 'opacity-50')}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </section>
  )
}
