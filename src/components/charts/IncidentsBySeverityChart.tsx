import { useId } from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, type TooltipContentProps, XAxis, YAxis } from 'recharts'
import { useFilters } from '@/hooks/filters'
import { SEVERITY_LABEL } from '@/lib/labels'
import { SEVERITY_BG } from '@/lib/severity'
import { cn } from '@/lib/utils'
import type { Alert, Severity } from '@/types/dashboard'
import { countBySeverity } from './chart-data'

// Da mais grave para a mais leve: o que exige atenção fica em cima.
const ORDER: Severity[] = ['critical', 'warning', 'info']

const FILL: Record<Severity, string> = {
  critical: 'var(--signal-critical)',
  warning: 'var(--signal-warn)',
  info: 'var(--chart-4)',
}

interface Row {
  severity: Severity
  label: string
  count: number
}

/**
 * Alertas do período por severidade. Clicar numa barra ou num botão filtra o dashboard
 * por aquela severidade; clicar de novo remove o filtro. Os botões são o equivalente
 * acessível do gráfico, com rótulo e contagem.
 */
export function IncidentsBySeverityChart({ alerts }: { alerts: Alert[] }) {
  const { severity, setSeverity } = useFilters()
  const captionId = useId()
  const counts = countBySeverity(alerts)
  const rows: Row[] = ORDER.map((s) => ({ severity: s, label: SEVERITY_LABEL[s], count: counts[s] }))
  const toggle = (s: Severity) => setSeverity(severity === s ? 'all' : s)

  if (alerts.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum alerta no período.</p>
  }

  return (
    <figure aria-labelledby={captionId} className="flex flex-col gap-3">
      <figcaption id={captionId} className="sr-only">
        Alertas por severidade
      </figcaption>
      <div data-testid="severity-chart" aria-hidden="true" className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} accessibilityLayer={false}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={56}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={(props) => <SeverityTooltip {...props} />}
              cursor={{ fill: 'var(--muted)' }}
              isAnimationActive={false}
            />
            <Bar
              dataKey="count"
              barSize={20}
              radius={[0, 4, 4, 0]}
              onClick={(_, index) => toggle(rows[index].severity)}
              className="cursor-pointer"
              isAnimationActive={false}
            >
              {rows.map((row) => (
                <Cell
                  key={row.severity}
                  fill={FILL[row.severity]}
                  fillOpacity={severity === 'all' || severity === row.severity ? 1 : 0.3}
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                fill="var(--foreground)"
                fontSize={12}
                fontFamily="var(--font-mono)"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div role="group" aria-label="Filtrar por severidade" className="flex flex-wrap gap-1.5">
        {rows.map((row) => (
          <button
            key={row.severity}
            type="button"
            aria-label={`${row.label}: ${row.count}`}
            aria-pressed={severity === row.severity}
            onClick={() => toggle(row.severity)}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-sm border px-2 text-xs text-muted-foreground transition-colors',
              'hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
              'aria-pressed:border-ring aria-pressed:text-foreground',
            )}
          >
            <span aria-hidden="true" className={cn('size-2 rounded-[2px]', SEVERITY_BG[row.severity])} />
            {row.label}
            <span className="font-mono text-foreground">{row.count}</span>
          </button>
        ))}
      </div>
    </figure>
  )
}

function SeverityTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload as Row
  return (
    <div className="rounded-sm border bg-popover px-2.5 py-1.5 shadow-sm">
      <p className="font-mono text-sm text-foreground">{row.count}</p>
      <p className="text-xs text-muted-foreground">{row.label}</p>
    </div>
  )
}
