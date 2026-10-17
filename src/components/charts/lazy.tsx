import { type ComponentProps, lazy, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// O Recharts é a maior dependência do app: carregado sob demanda, ele vai para um arquivo
// separado e o resto da interface não espera por ele.
const ThroughputChartImpl = lazy(() => import('./ThroughputChart').then((m) => ({ default: m.ThroughputChart })))
const IncidentsBySeverityChartImpl = lazy(() =>
  import('./IncidentsBySeverityChart').then((m) => ({ default: m.IncidentsBySeverityChart })),
)

function ChartFallback({ height }: { height: string }) {
  return (
    <Skeleton data-testid="chart-skeleton" aria-hidden="true" className={`w-full ${height}`} />
  )
}

// Se o arquivo do gráfico não carregar (rede, ou deploy novo com a aba aberta), o erro fica
// no painel. Recarregar a página busca os arquivos da versão atual.
function ChartError() {
  return (
    <div className="flex flex-col items-start gap-3 text-sm">
      <p className="text-muted-foreground">Não foi possível carregar o gráfico.</p>
      <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
        Recarregar a página
      </Button>
    </div>
  )
}

export function ThroughputChart(props: ComponentProps<typeof ThroughputChartImpl>) {
  return (
    <ErrorBoundary fallback={<ChartError />}>
      <Suspense fallback={<ChartFallback height="h-56" />}>
        <ThroughputChartImpl {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export function IncidentsBySeverityChart(props: ComponentProps<typeof IncidentsBySeverityChartImpl>) {
  return (
    <ErrorBoundary fallback={<ChartError />}>
      <Suspense fallback={<ChartFallback height="h-36" />}>
        <IncidentsBySeverityChartImpl {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}
