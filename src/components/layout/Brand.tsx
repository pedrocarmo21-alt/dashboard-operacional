/** Marca do produto: o mesmo desenho do favicon e o nome. */
export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
        <rect x="3" y="9" width="2" height="4" className="fill-muted-foreground" />
        <rect x="7" y="6" width="2" height="7" className="fill-muted-foreground" />
        <rect x="11" y="3" width="2" height="10" className="fill-signal-ok" />
      </svg>
      <span className="text-xs font-medium tracking-wider uppercase">Dashboard Operacional</span>
    </div>
  )
}
