import { Check } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
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
  const visible = useMemo(() => (limit === undefined ? rows : rows.slice(0, limit)), [rows, limit])

  // Reconhecer reordena a lista (e, com limite, pode tirar o item da tela). O foco vai para
  // o item que passa a ocupar a mesma posição, em vez de cair no <body>.
  const listRef = useRef<HTMLOListElement>(null)
  const focusIndex = useRef<number | null>(null)
  useEffect(() => {
    const index = focusIndex.current
    if (index === null) return
    focusIndex.current = null
    const items = listRef.current?.querySelectorAll<HTMLElement>(':scope > li') ?? []
    ;(items[Math.min(index, items.length - 1)] ?? listRef.current)?.focus()
  }, [visible])

  const acknowledge = (id: string, index: number) => {
    focusIndex.current = index
    onAcknowledge(id)
  }

  if (alerts.length === 0) return <p className="text-sm text-muted-foreground">Nenhum alerta no período.</p>
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nenhum alerta para os filtros atuais.</p>

  return (
    <div className="flex flex-col gap-3">
      <ol ref={listRef} tabIndex={-1} aria-label="Alertas" className="flex flex-col divide-y outline-none">
        {visible.map((alert, index) => (
          <AlertItem key={alert.id} alert={alert} now={now} onAcknowledge={(id) => acknowledge(id, index)} />
        ))}
      </ol>
      {limit !== undefined && rows.length > limit && (
        <Link to="/alertas" className="self-start text-xs text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground">
          Ver todos os {rows.length} alertas
        </Link>
      )}
    </div>
  )
}

function AlertItem({ alert, now, onAcknowledge }: { alert: Alert; now: Date; onAcknowledge: (id: string) => void }) {
  return (
    <li
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
          onClick={() => onAcknowledge(alert.id)}
        >
          Reconhecer
        </Button>
      )}
    </li>
  )
}
