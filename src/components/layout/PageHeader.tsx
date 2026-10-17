import { type ReactNode, useEffect } from 'react'

/** Título da página (h1 e aba do navegador) com os controles que valem para ela. */
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Dashboard Operacional`
  }, [title])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* tabIndex -1: recebe o foco na troca de página (ver AppShell). */}
      <h1 tabIndex={-1} className="text-lg font-medium outline-none">
        {title}
      </h1>
      {children}
    </div>
  )
}
