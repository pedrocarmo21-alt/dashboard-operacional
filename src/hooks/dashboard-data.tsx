import { createContext, type ReactNode, use, useCallback, useMemo, useState } from 'react'
import { fetchDashboard, getSimulationMode } from '@/data/api'
import type { DashboardData, Period, RequestStatus } from '@/types/dashboard'
import { useFilters } from './filters'
import { useAsync } from './useAsync'

export type Fetcher = (period: Period, signal: AbortSignal) => Promise<DashboardData>

export interface DashboardDataState {
  status: RequestStatus
  /** Dados com os reconhecimentos de alerta feitos nesta sessão já aplicados. */
  data: DashboardData | undefined
  error: Error | undefined
  retry: () => void
  acknowledgeAlert: (id: string) => void
}

const DashboardDataContext = createContext<DashboardDataState | null>(null)

const defaultFetcher: Fetcher = (period, signal) =>
  fetchDashboard(period, signal, getSimulationMode(window.location.search))

// Reconhecer um alerta muda também o KPI de incidentes abertos e o status do sistema.
function applyAcknowledged(data: DashboardData, acknowledged: ReadonlySet<string>): DashboardData {
  if (!data.alerts.some((a) => !a.acknowledged && acknowledged.has(a.id))) return data
  const alerts = data.alerts.map((a) => (acknowledged.has(a.id) ? { ...a, acknowledged: true } : a))
  const open = alerts.filter((a) => !a.acknowledged).length
  const pendingCritical = alerts.some((a) => a.severity === 'critical' && !a.acknowledged)
  return {
    ...data,
    alerts,
    kpis: data.kpis.map((k) => (k.id === 'openIncidents' ? { ...k, value: open } : k)),
    systemStatus: data.systemStatus === 'outage' ? 'outage' : pendingCritical ? 'degraded' : 'operational',
  }
}

/** Busca os dados do período escolhido nos filtros. `fetcher` precisa ter identidade estável. */
export function DashboardDataProvider({ children, fetcher = defaultFetcher }: { children: ReactNode; fetcher?: Fetcher }) {
  const { period } = useFilters()
  const load = useCallback((signal: AbortSignal) => fetcher(period, signal), [fetcher, period])
  const { status, data, error, retry } = useAsync(load)

  const [acknowledged, setAcknowledged] = useState<ReadonlySet<string>>(() => new Set())
  const acknowledgeAlert = useCallback(
    (id: string) => setAcknowledged((prev) => (prev.has(id) ? prev : new Set(prev).add(id))),
    [],
  )

  const value = useMemo(
    () => ({
      status,
      data: data && applyAcknowledged(data, acknowledged),
      error,
      retry,
      acknowledgeAlert,
    }),
    [status, data, acknowledged, error, retry, acknowledgeAlert],
  )
  return <DashboardDataContext value={value}>{children}</DashboardDataContext>
}

export function useDashboardData(): DashboardDataState {
  const state = use(DashboardDataContext)
  if (!state) throw new Error('useDashboardData precisa estar dentro de <DashboardDataProvider>')
  return state
}
