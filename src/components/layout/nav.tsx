import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

/** Lista de seções, compartilhada pela sidebar e pelo menu mobile. */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex h-8 items-center gap-2.5 rounded-sm px-3 text-sm text-muted-foreground transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'focus-visible:ring-1 focus-visible:ring-sidebar-ring focus-visible:outline-none',
                isActive &&
                  'bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:bg-signal-ok',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
