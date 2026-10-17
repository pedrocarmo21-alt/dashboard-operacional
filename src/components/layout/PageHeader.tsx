import { type ReactNode, useEffect } from 'react'

/** Título da página (h1 e aba do navegador) com os controles que valem para ela. */
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Dashboard Operacional`
  }, [title])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-lg font-medium">{title}</h1>
      {children}
    </div>
  )
}
