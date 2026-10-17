import { useMemo } from 'react'
import { panelState } from '@/lib/status'
import { useDashboardData } from './dashboard-data'

/**
 * Liga os dados aos painéis de uma página: `panel(n)` devolve status, `refreshing` e
 * `onRetry` para um painel com `n` itens; `now` é o instante dos dados, para o tempo relativo.
 */
export function useDashboardPanels() {
  const { status, data, retry, acknowledgeAlert } = useDashboardData()
  const generatedAt = data?.generatedAt
  const now = useMemo(() => new Date(generatedAt ?? 0), [generatedAt])

  const panel = (count: number) => ({ ...panelState(status, data !== undefined, count), onRetry: retry })
  return { data, now, panel, acknowledgeAlert }
}
