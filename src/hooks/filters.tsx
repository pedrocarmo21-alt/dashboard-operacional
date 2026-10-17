import { createContext, type ReactNode, use, useCallback, useMemo, useState } from 'react'
import type { Period, Severity } from '@/types/dashboard'

export interface Filters {
  period: Period
  setPeriod: (period: Period) => void
  severity: Severity | 'all'
  setSeverity: (severity: Severity | 'all') => void
  query: string
  setQuery: (query: string) => void
  /** Todos os filtros no padrão (busca só com espaços conta como vazia). */
  isDefault: boolean
  resetFilters: () => void
}

const DEFAULT_PERIOD: Period = '24h'

const FiltersContext = createContext<Filters | null>(null)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD)
  const [severity, setSeverity] = useState<Severity | 'all'>('all')
  const [query, setQuery] = useState('')

  const resetFilters = useCallback(() => {
    setPeriod(DEFAULT_PERIOD)
    setSeverity('all')
    setQuery('')
  }, [])

  const value = useMemo(
    () => ({
      period,
      setPeriod,
      severity,
      setSeverity,
      query,
      setQuery,
      isDefault: period === DEFAULT_PERIOD && severity === 'all' && query.trim() === '',
      resetFilters,
    }),
    [period, severity, query, resetFilters],
  )
  return <FiltersContext value={value}>{children}</FiltersContext>
}

export function useFilters(): Filters {
  const filters = use(FiltersContext)
  if (!filters) throw new Error('useFilters precisa estar dentro de <FiltersProvider>')
  return filters
}
