import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatMs, formatNumber, formatPercentDelta } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Kpi } from '@/types/dashboard'

type Trend = 'good' | 'bad' | 'neutral'

const TREND_CLASS: Record<Trend, string> = {
  good: 'text-signal-ok',
  bad: 'text-signal-warn',
  neutral: 'text-muted-foreground',
}

function formatValue({ value, unit }: Kpi): string {
  if (unit === 'ms') return formatMs(value)
  if (unit === 'eventsPerSec') return Number.isFinite(value) ? `${formatNumber(Math.round(value))}\u00a0ev/s` : '—'
  return formatNumber(value)
}

// Mesmo arredondamento de formatPercentDelta: o que aparece como 0,0% é neutro.
const roundDelta = (delta: number) => Math.round(delta * 10) / 10

function trendOf({ delta, goodWhen }: Kpi): Trend {
  const d = roundDelta(delta)
  if (!Number.isFinite(d) || d === 0) return 'neutral'
  return (d > 0) === (goodWhen === 'up') ? 'good' : 'bad'
}

function describeDelta(delta: number): string {
  const d = roundDelta(delta)
  if (!Number.isFinite(d)) return 'variação indisponível'
  if (d === 0) return 'sem variação em relação ao período anterior'
  const amount = formatPercentDelta(Math.abs(d)).replace('+', '')
  return `${d > 0 ? 'aumento' : 'redução'} de ${amount} em relação ao período anterior`
}

/** Card de KPI: valor em destaque e variação colorida pelo que é bom para aquele indicador. */
export function KpiCard({ kpi }: { kpi: Kpi }) {
  const trend = trendOf(kpi)
  const d = roundDelta(kpi.delta)
  const Icon = trend === 'neutral' ? Minus : d > 0 ? ArrowUpRight : ArrowDownRight

  return (
    <dl className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3">
      <dt className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{kpi.label}</dt>
      <dd data-testid="kpi-value" className="font-mono text-2xl text-foreground tabular-nums">
        {formatValue(kpi)}
      </dd>
      <dd className="flex items-center gap-1.5 text-xs">
        <span aria-hidden="true" className="flex items-center gap-1.5">
          <span data-trend={trend} className={cn('flex items-center gap-0.5 font-mono tabular-nums', TREND_CLASS[trend])}>
            <Icon className="size-3.5" />
            {formatPercentDelta(kpi.delta)}
          </span>
          <span className="text-muted-foreground">vs. período anterior</span>
        </span>
        <span className="sr-only">{describeDelta(kpi.delta)}</span>
      </dd>
    </dl>
  )
}
