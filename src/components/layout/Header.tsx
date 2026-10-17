import { Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { useDashboardData } from '@/hooks/dashboard-data'
import { useFilters } from '@/hooks/filters'
import { MobileNav } from './MobileNav'
import { NotificationsMenu } from './NotificationsMenu'
import { ProfileMenu } from './ProfileMenu'
import { SystemStatusBadge } from './SystemStatusBadge'

const TYPING_TARGET = 'input, textarea, select, [contenteditable="true"]'

/** Barra superior: busca global (atalho "/"), status do sistema, notificações e perfil. */
export function Header() {
  const { query, setQuery } = useFilters()
  const { data, status } = useDashboardData()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target instanceof Element && e.target.closest(TYPING_TARGET)) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background px-2 md:gap-4 md:px-6">
      <MobileNav />
      <div className="relative max-w-md min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={searchRef}
          type="search"
          aria-label="Buscar ativos, alertas e eventos"
          placeholder="Buscar ativos, alertas e eventos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && query) {
              e.preventDefault()
              setQuery('')
            }
          }}
          className="h-8 pr-8 pl-8"
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-sm border px-1 font-mono text-[11px] text-muted-foreground sm:block"
        >
          /
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-1 md:gap-3">
        <SystemStatusBadge status={data?.systemStatus} unavailable={status === 'error' && !data} />
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  )
}
