import { Brand } from './Brand'
import { NavLinks } from './nav'

/** Navegação lateral fixa, visível a partir do breakpoint md. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-12 items-center border-b border-sidebar-border px-4">
        <Brand />
      </div>
      <nav aria-label="Principal" className="flex-1 overflow-y-auto p-2">
        <NavLinks />
      </nav>
    </aside>
  )
}
