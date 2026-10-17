import { Bell } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDashboardData } from '@/hooks/dashboard-data'
import { formatRelativeTime } from '@/lib/format'
import { acknowledgeLabel, SEVERITY_LABEL } from '@/lib/labels'
import { SEVERITY_BG } from '@/lib/severity'
import { cn } from '@/lib/utils'
import type { Alert } from '@/types/dashboard'

const VISIBLE = 5

function triggerLabel(pending: number | undefined): string {
  if (pending === undefined) return 'Notificações'
  if (pending === 0) return 'Notificações, nenhum pendente'
  return `Notificações, ${pending} ${pending === 1 ? 'pendente' : 'pendentes'}`
}

/** Sino do header: alertas pendentes mais recentes, com reconhecimento rápido. */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const { status, data, acknowledgeAlert } = useDashboardData()

  const pending = useMemo(
    () => data?.alerts.filter((a) => !a.acknowledged).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data],
  )
  const count = pending?.length

  // O item reconhecido sai da lista: o foco vai para o próximo "Reconhecer" ou, se não
  // sobrar nenhum, para "Ver todos os alertas", em vez de cair no <body> com o menu aberto.
  const listRef = useRef<HTMLUListElement>(null)
  const seeAllRef = useRef<HTMLAnchorElement>(null)
  const focusIndex = useRef<number | null>(null)
  useEffect(() => {
    const index = focusIndex.current
    if (index === null) return
    focusIndex.current = null
    const buttons = listRef.current?.querySelectorAll<HTMLElement>('button') ?? []
    ;(buttons[Math.min(index, buttons.length - 1)] ?? seeAllRef.current)?.focus()
  }, [pending])

  const acknowledge = (id: string, index: number) => {
    focusIndex.current = index
    acknowledgeAlert(id)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="relative" aria-label={triggerLabel(count)}>
          <Bell aria-hidden="true" />
          {count !== undefined && count > 0 && (
            <span
              data-testid="notifications-count"
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-warn px-1 font-mono text-[10px] leading-none text-background"
            >
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-labelledby={titleId} className="w-80 gap-0 p-0">
        <p id={titleId} className="border-b px-3 py-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Notificações
        </p>
        <div className="max-h-80 overflow-y-auto">
          {pending === undefined ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              {status === 'error' ? 'Não foi possível carregar as notificações.' : 'Carregando…'}
            </p>
          ) : pending.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">Nenhuma notificação</p>
          ) : (
            <ul ref={listRef} aria-label="Alertas pendentes" className="divide-y">
              {pending.slice(0, VISIBLE).map((alert, index) => (
                <NotificationItem
                  key={alert.id}
                  alert={alert}
                  now={new Date(data!.generatedAt)}
                  onAcknowledge={(id) => acknowledge(id, index)}
                />
              ))}
            </ul>
          )}
        </div>
        <div className="border-t px-3 py-2">
          <Link
            ref={seeAllRef}
            to="/alertas"
            onClick={() => setOpen(false)}
            className="text-xs text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
          >
            Ver todos os alertas
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({
  alert,
  now,
  onAcknowledge,
}: {
  alert: Alert
  now: Date
  onAcknowledge: (id: string) => void
}) {
  return (
    <li className="flex items-start gap-2.5 px-3 py-2.5">
      <span aria-hidden="true" className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', SEVERITY_BG[alert.severity])} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="sr-only">{SEVERITY_LABEL[alert.severity]}: </span>
          {alert.title}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {alert.assetId} · {formatRelativeTime(alert.createdAt, now)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label={acknowledgeLabel(alert)}
        onClick={() => onAcknowledge(alert.id)}
      >
        Reconhecer
      </Button>
    </li>
  )
}
