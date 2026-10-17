import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AsyncStatus, Kpi } from '@/types/dashboard'
import { KpiCard } from './KpiCard'

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'

interface KpiGridProps {
  kpis: Kpi[]
  status: AsyncStatus
  /** Recarregando com KPIs anteriores na tela: esmaecidos e marcados como ocupados. */
  refreshing?: boolean
  /** KPIs anteriores a uma recarga que falhou: esmaecidos. */
  stale?: boolean
}

/** Linha de KPIs com os mesmos estados de um painel (os anúncios ficam com a página). */
export function KpiGrid({ kpis, status, refreshing = false, stale = false }: KpiGridProps) {
  return (
    <section aria-label="Indicadores" aria-busy={status === 'loading' || refreshing || undefined}>
      {status === 'loading' ? (
        <div aria-hidden="true" className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} data-testid="kpi-skeleton" className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : status === 'error' ? (
        <p className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">Indicadores indisponíveis.</p>
      ) : status === 'empty' ? (
        <p className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">Sem indicadores para o período.</p>
      ) : (
        <div data-testid="kpi-grid" className={cn(GRID, 'transition-opacity', (refreshing || stale) && 'opacity-50')}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </section>
  )
}
