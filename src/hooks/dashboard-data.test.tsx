import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockData } from '@/data/mock'
import type { DashboardData } from '@/types/dashboard'
import { DashboardDataProvider, type Fetcher, useDashboardData } from './dashboard-data'
import { FiltersProvider, useFilters } from './filters'

const okFetcher: Fetcher = (period) => Promise.resolve(createMockData(period))

function setup(fetcher?: Fetcher) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <FiltersProvider>
      <DashboardDataProvider fetcher={fetcher}>{children}</DashboardDataProvider>
    </FiltersProvider>
  )
  return renderHook(() => ({ filters: useFilters(), dash: useDashboardData() }), { wrapper })
}

const pendingAlerts = (d: DashboardData | undefined) => d?.kpis.find((k) => k.id === 'pendingAlerts')?.value

describe('useDashboardData', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('carrega os dados do período atual', async () => {
    const fetcher = vi.fn<Fetcher>(okFetcher)
    const { result } = setup(fetcher)
    expect(result.current.dash.status).toBe('loading')
    await waitFor(() => expect(result.current.dash.status).toBe('success'))
    expect(fetcher).toHaveBeenCalledWith('24h', expect.any(AbortSignal))
    expect(result.current.dash.data?.throughput).toHaveLength(24)
  })

  it('busca de novo ao trocar o período', async () => {
    const fetcher = vi.fn<Fetcher>(okFetcher)
    const { result } = setup(fetcher)
    await waitFor(() => expect(result.current.dash.status).toBe('success'))

    act(() => result.current.filters.setPeriod('30d'))
    await waitFor(() => expect(result.current.dash.data?.throughput).toHaveLength(30))
    expect(fetcher).toHaveBeenLastCalledWith('30d', expect.any(AbortSignal))
  })

  it('não busca de novo ao mudar filtros que não são o período', async () => {
    const fetcher = vi.fn<Fetcher>(okFetcher)
    const { result } = setup(fetcher)
    await waitFor(() => expect(result.current.dash.status).toBe('success'))

    act(() => result.current.filters.setQuery('norte'))
    act(() => result.current.filters.setSeverity('critical'))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('erro e retry', async () => {
    const fetcher = vi.fn<Fetcher>().mockRejectedValueOnce(new Error('falhou')).mockImplementation(okFetcher)
    const { result } = setup(fetcher)
    await waitFor(() => expect(result.current.dash.status).toBe('error'))
    expect(result.current.dash.error?.message).toBe('falhou')

    act(() => result.current.dash.retry())
    await waitFor(() => expect(result.current.dash.status).toBe('success'))
  })

  describe('acknowledgeAlert', () => {
    async function loaded() {
      const r = setup(okFetcher)
      await waitFor(() => expect(r.result.current.dash.status).toBe('success'))
      return r
    }

    it('marca o alerta como reconhecido', async () => {
      const { result } = await loaded()
      const pending = result.current.dash.data!.alerts.find((a) => !a.acknowledged)!
      act(() => result.current.dash.acknowledgeAlert(pending.id))
      expect(result.current.dash.data!.alerts.find((a) => a.id === pending.id)?.acknowledged).toBe(true)
    })

    it('atualiza o KPI de alertas pendentes', async () => {
      const { result } = await loaded()
      const before = pendingAlerts(result.current.dash.data)!
      const pending = result.current.dash.data!.alerts.find((a) => !a.acknowledged)!
      act(() => result.current.dash.acknowledgeAlert(pending.id))
      expect(pendingAlerts(result.current.dash.data)).toBe(before - 1)
    })

    it('reconhecer todos os críticos deixa o sistema operacional', async () => {
      const { result } = await loaded()
      const criticals = result.current.dash.data!.alerts.filter((a) => a.severity === 'critical' && !a.acknowledged)
      expect(criticals.length).toBeGreaterThan(0)
      expect(result.current.dash.data!.systemStatus).toBe('degraded')
      act(() => criticals.forEach((a) => result.current.dash.acknowledgeAlert(a.id)))
      expect(result.current.dash.data!.systemStatus).toBe('operational')
    })

    it('o reconhecimento sobrevive à troca de período e não afeta os alertas do outro período', async () => {
      const { result } = await loaded()
      const pending = result.current.dash.data!.alerts.find((a) => !a.acknowledged)!
      act(() => result.current.dash.acknowledgeAlert(pending.id))

      act(() => result.current.filters.setPeriod('7d'))
      await waitFor(() => expect(result.current.dash.data?.throughput).toHaveLength(28))
      expect(result.current.dash.data!.alerts).toEqual(createMockData('7d').alerts)

      act(() => result.current.filters.setPeriod('24h'))
      await waitFor(() => expect(result.current.dash.data?.throughput).toHaveLength(24))
      expect(result.current.dash.data!.alerts.find((a) => a.id === pending.id)?.acknowledged).toBe(true)
    })

    it('reconhecer alerta já reconhecido não muda nada', async () => {
      const { result } = await loaded()
      const done = result.current.dash.data!.alerts.find((a) => a.acknowledged)!
      const before = result.current.dash.data
      act(() => result.current.dash.acknowledgeAlert(done.id))
      expect(result.current.dash.data).toEqual(before)
    })
  })

  it('sem fetcher, usa a API simulada com o modo da URL', async () => {
    window.history.replaceState(null, '', '/?simular=erro')
    const { result } = setup()
    await waitFor(() => expect(result.current.dash.status).toBe('error'), { timeout: 2000 })
    expect(result.current.dash.error?.message).toBe('Falha ao carregar dados')
  })

  it('fora do provider lança erro explicativo', () => {
    expect(() => renderHook(() => useDashboardData())).toThrow(
      'useDashboardData precisa estar dentro de <DashboardDataProvider>',
    )
  })
})
