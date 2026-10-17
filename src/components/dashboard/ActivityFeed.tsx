import { useMemo } from 'react'
import { Link } from 'react-router'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { SEVERITY_LABEL } from '@/lib/labels'
import { SEVERITY_BG } from '@/lib/severity'
import { matchesQuery } from '@/lib/text'
import { cn } from '@/lib/utils'
import type { ActivityEvent, Severity } from '@/types/dashboard'

interface ActivityFeedProps {
  events: ActivityEvent[]
  severity: Severity | 'all'
  query: string
  /** Mostra só os primeiros e um link para a página de eventos. */
  limit?: number
  /** Referência do tempo relativo: o `generatedAt` dos dados. */
  now: Date
}

/** Linha do tempo de eventos, do mais recente ao mais antigo. */
export function ActivityFeed({ events, severity, query, limit, now }: ActivityFeedProps) {
  const rows = useMemo(
    () =>
      events
        .filter((e) => (severity === 'all' || e.severity === severity) && matchesQuery([e.message, e.actor], query))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [events, severity, query],
  )
  const visible = limit === undefined ? rows : rows.slice(0, limit)

  if (events.length === 0) return <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nenhum evento para os filtros atuais.</p>

  return (
    <div className="flex flex-col gap-3">
      <ol aria-label="Eventos" className="flex flex-col divide-y">
        {visible.map((event) => (
          <li key={event.id} className="relative flex items-start gap-3 py-2 pl-3">
            <span aria-hidden="true" className={cn('absolute inset-y-2 left-0 w-0.5 rounded-full', SEVERITY_BG[event.severity])} />
            <p data-testid="event-message" className="min-w-0 flex-1 text-sm">
              {event.message}
            </p>
            <p className="flex shrink-0 flex-col items-end font-mono text-xs text-muted-foreground sm:flex-row sm:gap-2">
              <span className="tracking-wider uppercase">{SEVERITY_LABEL[event.severity]}</span>
              <span>{event.actor}</span>
              <time dateTime={event.timestamp} title={formatDateTime(event.timestamp)}>
                {formatRelativeTime(event.timestamp, now)}
              </time>
            </p>
          </li>
        ))}
      </ol>
      {limit !== undefined && rows.length > limit && (
        <Link to="/eventos" className="self-start text-xs text-signal-ok underline-offset-4 hover:underline">
          Ver todos os {rows.length} eventos
        </Link>
      )}
    </div>
  )
}
