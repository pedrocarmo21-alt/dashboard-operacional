import type { DashboardData, Period } from '@/types/dashboard'
import { createMockData } from './mock'

export type SimulationMode = 'normal' | 'erro' | 'vazio' | 'lento'

const MODES: SimulationMode[] = ['erro', 'vazio', 'lento']
const LATENCY_MS: Record<SimulationMode, number> = { normal: 400, erro: 400, vazio: 400, lento: 2000 }

/** Lê `?simular=erro|vazio|lento` da URL, para demonstrar os estados da interface. */
export function getSimulationMode(search: string): SimulationMode {
  const value = new URLSearchParams(search).get('simular')
  return MODES.find((mode) => mode === value) ?? 'normal'
}

function abortError(): DOMException {
  return new DOMException('Requisição cancelada', 'AbortError')
}

function emptyData(data: DashboardData): DashboardData {
  return { ...data, systemStatus: 'operational', kpis: [], throughput: [], assets: [], alerts: [], events: [] }
}

/** API simulada: responde com dados fictícios depois de uma latência artificial. */
export function fetchDashboard(
  period: Period,
  signal?: AbortSignal,
  mode: SimulationMode = 'normal',
): Promise<DashboardData> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      if (mode === 'erro') {
        reject(new Error('Falha ao carregar dados'))
        return
      }
      const data = createMockData(period)
      resolve(mode === 'vazio' ? emptyData(data) : data)
    }, LATENCY_MS[mode])
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
