import { createMockData } from '@/data/mock'
import type { Fetcher } from '@/hooks/dashboard-data'
import type { DashboardData, Period } from '@/types/dashboard'

export const okFetcher: Fetcher = (period) => Promise.resolve(createMockData(period))

export function emptyData(period: Period): DashboardData {
  return { ...createMockData(period), kpis: [], throughput: [], assets: [], alerts: [], events: [] }
}

/** Fetcher que só responde quando o teste manda, para observar carga e recarga. */
export function controlledFetcher() {
  const calls: { period: Period; resolve: (d: DashboardData) => void; reject: (e: unknown) => void }[] = []
  const fetcher: Fetcher = (period) =>
    new Promise((resolve, reject) => {
      calls.push({ period, resolve, reject })
    })
  return { fetcher, calls }
}
