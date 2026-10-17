import { createContext, type ReactNode, use, useMemo, useState } from 'react'
import type { Period, Severity } from '@/types/dashboard'

export interface Filters {
  period: Period
  setPeriod: (period: Period) => void
  severity: Severity | 'all'
  setSeverity: (severity: Severity | 'all') => void
  query: string
  setQuery: (query: string) => void
}

const FiltersContext = createContext<Filters | null>(null)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>('24h')
  const [severity, setSeverity] = useState<Severity | 'all'>('all')
  const [query, setQuery] = useState('')

  const value = useMemo(
    () => ({ period, setPeriod, severity, setSeverity, query, setQuery }),
    [period, severity, query],
  )
  return <FiltersContext value={value}>{children}</FiltersContext>
}

export function useFilters(): Filters {
  const filters = use(FiltersContext)
  if (!filters) throw new Error('useFilters precisa estar dentro de <FiltersProvider>')
  return filters
}
