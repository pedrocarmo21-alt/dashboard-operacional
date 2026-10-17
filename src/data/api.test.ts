import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchDashboard, getSimulationMode } from './api'

describe('getSimulationMode', () => {
  it.each([
    ['?simular=erro', 'erro'],
    ['?simular=vazio', 'vazio'],
    ['?simular=lento', 'lento'],
    ['?outro=1&simular=erro', 'erro'],
    ['?simular=xyz', 'normal'],
    ['?simular=', 'normal'],
    ['', 'normal'],
  ])('%j → %s', (search, mode) => {
    expect(getSimulationMode(search)).toBe(mode)
  })
})

describe('fetchDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolve com os dados do período depois de 400 ms', async () => {
    const settled = vi.fn<() => void>()
    const request = fetchDashboard('7d').finally(settled)
    await vi.advanceTimersByTimeAsync(399)
    expect(settled).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    const data = await request
    expect(data.assets).toHaveLength(40)
    expect(data.throughput).toHaveLength(28)
  })

  it('modo lento demora 2 s', async () => {
    const settled = vi.fn<() => void>()
    const request = fetchDashboard('24h', undefined, 'lento').finally(settled)
    await vi.advanceTimersByTimeAsync(1999)
    expect(settled).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await expect(request).resolves.toMatchObject({ assets: expect.any(Array) })
  })

  it('modo erro rejeita com mensagem em português', async () => {
    const error = fetchDashboard('24h', undefined, 'erro').catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(400)
    expect(await error).toEqual(new Error('Falha ao carregar dados'))
  })

  it('modo vazio resolve com todas as listas vazias', async () => {
    const request = fetchDashboard('24h', undefined, 'vazio')
    await vi.advanceTimersByTimeAsync(400)
    expect(await request).toMatchObject({ kpis: [], throughput: [], assets: [], alerts: [], events: [] })
  })

  it('abortar durante a espera rejeita com AbortError e cancela o timer', async () => {
    const controller = new AbortController()
    const error = fetchDashboard('24h', controller.signal).catch((e: unknown) => e)
    controller.abort()
    expect(await error).toHaveProperty('name', 'AbortError')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('sinal já abortado rejeita na hora, sem agendar timer', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(fetchDashboard('24h', controller.signal)).rejects.toHaveProperty('name', 'AbortError')
    expect(vi.getTimerCount()).toBe(0)
  })
})
