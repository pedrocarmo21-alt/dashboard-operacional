import { type ComponentProps, lazy, Suspense } from 'react'
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

export function ThroughputChart(props: ComponentProps<typeof ThroughputChartImpl>) {
  return (
    <Suspense fallback={<ChartFallback height="h-56" />}>
      <ThroughputChartImpl {...props} />
    </Suspense>
  )
}

export function IncidentsBySeverityChart(props: ComponentProps<typeof IncidentsBySeverityChartImpl>) {
  return (
    <Suspense fallback={<ChartFallback height="h-36" />}>
      <IncidentsBySeverityChartImpl {...props} />
    </Suspense>
  )
}
