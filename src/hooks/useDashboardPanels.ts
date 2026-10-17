import { useMemo } from 'react'
import { panelState } from '@/lib/status'
import { useDashboardData } from './dashboard-data'

/**
 * Liga os dados aos painéis de uma página: `panel(n)` devolve o estado de um painel com
 * `n` itens; `dataStatus` vai para o DataStatus (anúncio e aviso únicos da página);
 * `now` é o instante dos dados, para o tempo relativo.
 */
export function useDashboardPanels() {
  const { status, data, retry, acknowledgeAlert } = useDashboardData()
  const generatedAt = data?.generatedAt
  const now = useMemo(() => new Date(generatedAt ?? 0), [generatedAt])
  const hasData = data !== undefined

  const panel = (count: number) => panelState(status, hasData, count)
  return { data, now, panel, acknowledgeAlert, dataStatus: { status, hasData, onRetry: retry } }
}
