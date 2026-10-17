import { SYSTEM_STATUS_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'
import type { SystemStatus } from '@/types/dashboard'

const SIGNAL = { operational: 'ok', degraded: 'warn', outage: 'critical' } as const
const DOT = {
  ok: 'bg-signal-ok',
  warn: 'bg-signal-warn',
  critical: 'bg-signal-critical',
  unknown: 'bg-muted-foreground',
}

/** Ponto colorido + rótulo; em telas estreitas o rótulo fica só para leitores de tela. */
export function SystemStatusBadge({ status, unavailable = false }: { status: SystemStatus | undefined; unavailable?: boolean }) {
  const signal = status ? SIGNAL[status] : 'unknown'
  return (
    <div
      data-testid="system-status"
      data-signal={signal}
      className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
    >
      <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', DOT[signal])} />
      <span className="sr-only">Status do sistema: </span>
      <span className="max-sm:sr-only">{status ? SYSTEM_STATUS_LABEL[status] : unavailable ? 'Indisponível' : 'Verificando…'}</span>
    </div>
  )
}
