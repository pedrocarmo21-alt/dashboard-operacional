import { useId, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, type TooltipContentProps, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { formatCompact, formatDateTime, formatNumber } from '@/lib/format'
import { PERIOD_LABEL } from '@/lib/labels'
import type { Period, ThroughputPoint } from '@/types/dashboard'
import { formatAxisTime, summarizeThroughput } from './chart-data'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' }
const evs = (n: number) => `${formatNumber(Math.round(n))}\u00a0ev/s`

interface ThroughputChartProps {
  data: ThroughputPoint[]
  period: Period
}

/**
 * Série única de ingestão. O SVG fica oculto para leitores de tela: o nome da figura,
 * o resumo e a visão em tabela carregam os mesmos dados.
 */
export function ThroughputChart({ data, period }: ThroughputChartProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const captionId = useId()
  const caption = `Ingestão de eventos por segundo, ${PERIOD_LABEL[period].toLowerCase()}`
  const summary = summarizeThroughput(data)

  if (!summary) {
    return <p className="text-sm text-muted-foreground">Sem dados de ingestão no período.</p>
  }

  return (
    <figure aria-labelledby={captionId} className="flex flex-col gap-3">
      <figcaption id={captionId} className="sr-only">
        {caption}
      </figcaption>
      {view === 'chart' ? (
        <div data-testid="throughput-chart" aria-hidden="true" className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 64, bottom: 0, left: 0 }} accessibilityLayer={false}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v: string) => formatAxisTime(v, period)}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                minTickGap={32}
              />
              {/* Largura para "1,6 mil" em fonte mono 11px; com 44px o "1," era cortado. */}
              <YAxis width={60} tickFormatter={formatCompact} tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip
                content={(props) => <ThroughputTooltip {...props} />}
                cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="eventsPerSec"
                stroke="var(--chart-line)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={(props) => <EndDot {...props} last={data.length - 1} />}
                activeDot={{ r: 4, fill: 'var(--chart-line)', stroke: 'var(--card)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="py-1.5 text-left font-medium">
                  Horário
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  Eventos/s
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs tabular-nums">
              {data.map((p) => (
                <tr key={p.timestamp} className="border-t">
                  <td className="py-1.5">{formatDateTime(p.timestamp)}</td>
                  <td className="py-1.5 text-right">{formatNumber(p.eventsPerSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p data-testid="throughput-summary" className="font-mono">
          Mín. {evs(summary.min)} · Média {evs(summary.avg)} · Máx. {evs(summary.max)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          className="text-muted-foreground"
        >
          {view === 'chart' ? 'Ver como tabela' : 'Ver como gráfico'}
        </Button>
      </div>
    </figure>
  )
}

/** Só o último ponto ganha marcador e rótulo de valor; os demais ficam para o tooltip. */
function EndDot({ cx, cy, index, value, last }: { cx?: number; cy?: number; index?: number; value?: unknown; last: number }) {
  if (index !== last || cx === undefined || cy === undefined) return <g />
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="var(--chart-line)" stroke="var(--card)" strokeWidth={2} />
      <text x={cx + 8} y={cy} dy="0.35em" fill="var(--foreground)" fontSize={11} fontFamily="var(--font-mono)">
        {formatCompact(Number(value))}
      </text>
    </g>
  )
}

function ThroughputTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-sm border bg-popover px-2.5 py-1.5 shadow-sm">
      <p className="font-mono text-sm text-foreground">{evs(Number(payload[0].value))}</p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-chart-line" />
        {formatDateTime(String(label))}
      </p>
    </div>
  )
}
