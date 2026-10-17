import { Check } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { acknowledgeLabel, SEVERITY_LABEL } from '@/lib/labels'
import { SEVERITY_BG } from '@/lib/severity'
import { matchesQuery } from '@/lib/text'
import { cn } from '@/lib/utils'
import type { Alert, Severity } from '@/types/dashboard'

interface AlertsPanelProps {
  alerts: Alert[]
  severity: Severity | 'all'
  query: string
  onAcknowledge: (id: string) => void
  /** Mostra só os primeiros e um link para a página de alertas. */
  limit?: number
  /** Referência do tempo relativo: o `generatedAt` dos dados. */
  now: Date
}

// Pendentes primeiro; dentro de cada grupo, do mais recente ao mais antigo.
function byPriority(a: Alert, b: Alert): number {
  return Number(a.acknowledged) - Number(b.acknowledged) || b.createdAt.localeCompare(a.createdAt)
}

export function AlertsPanel({ alerts, severity, query, onAcknowledge, limit, now }: AlertsPanelProps) {
  const rows = useMemo(
    () =>
      alerts
        .filter((a) => (severity === 'all' || a.severity === severity) && matchesQuery([a.title, a.assetId], query))
        .sort(byPriority),
    [alerts, severity, query],
  )
  const visible = limit === undefined ? rows : rows.slice(0, limit)

  if (alerts.length === 0) return <p className="text-sm text-muted-foreground">Nenhum alerta no período.</p>
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nenhum alerta para os filtros atuais.</p>

  return (
    <div className="flex flex-col gap-3">
      <ol aria-label="Alertas" className="flex flex-col divide-y">
        {visible.map((alert) => (
          <AlertItem key={alert.id} alert={alert} now={now} onAcknowledge={onAcknowledge} />
        ))}
      </ol>
      {limit !== undefined && rows.length > limit && (
        <Link to="/alertas" className="self-start text-xs text-signal-ok underline-offset-4 hover:underline">
          Ver todos os {rows.length} alertas
        </Link>
      )}
    </div>
  )
}

function AlertItem({ alert, now, onAcknowledge }: { alert: Alert; now: Date; onAcknowledge: (id: string) => void }) {
  const itemRef = useRef<HTMLLIElement>(null)

  return (
    <li
      ref={itemRef}
      tabIndex={-1}
      className="relative flex items-start gap-3 py-2.5 pl-3 outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <span aria-hidden="true" className={cn('absolute inset-y-2.5 left-0 w-0.5 rounded-full', SEVERITY_BG[alert.severity])} />
      <div className={cn('min-w-0 flex-1', alert.acknowledged && 'text-muted-foreground')}>
        <p data-testid="alert-title" className="truncate text-sm">
          {alert.title}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
          <span className="tracking-wider uppercase">{SEVERITY_LABEL[alert.severity]}</span>
          <span>{alert.assetId}</span>
          <time dateTime={alert.createdAt} title={formatDateTime(alert.createdAt)}>
            {formatRelativeTime(alert.createdAt, now)}
          </time>
        </p>
      </div>
      {alert.acknowledged ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Check aria-hidden="true" className="size-3.5" />
          Reconhecido
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="xs"
          aria-label={acknowledgeLabel(alert)}
          // O botão some depois do clique; o foco fica no item em vez de cair no <body>.
          onClick={() => {
            onAcknowledge(alert.id)
            itemRef.current?.focus()
          }}
        >
          Reconhecer
        </Button>
      )}
    </li>
  )
}
