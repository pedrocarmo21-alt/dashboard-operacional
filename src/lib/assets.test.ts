import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import type { Asset } from '@/types/dashboard'
import { filterAssets, sortAssets } from './assets'

const assets = createMockData('24h').assets

const asset = (overrides: Partial<Asset>): Asset => ({
  id: 'AT-0000',
  name: 'Ativo',
  type: 'sensor',
  region: 'Norte',
  status: 'online',
  latencyMs: 50,
  lastSeen: '2026-10-16T11:59:00Z',
  ...overrides,
})

describe('filterAssets', () => {
  it('busca sem acento encontra nomes com acento', () => {
    const found = filterAssets(assets, { query: 'ESTACAO', status: 'all' })
    expect(found.length).toBeGreaterThan(0)
    expect(found.every((a) => a.type === 'estacao')).toBe(true)
  })

  it('busca pelo id', () => {
    expect(filterAssets(assets, { query: 'at-0007', status: 'all' }).map((a) => a.id)).toEqual(['AT-0007'])
  })

  it('busca pela região', () => {
    const found = filterAssets(assets, { query: 'sul', status: 'all' })
    expect(found.length).toBeGreaterThan(0)
    expect(found.every((a) => a.region === 'Sul' || /sul/i.test(a.name))).toBe(true)
  })

  it('busca pelo rótulo do tipo', () => {
    const list = [asset({ id: 'A', type: 'veiculo', name: 'X-1' }), asset({ id: 'B', type: 'sensor', name: 'X-2' })]
    expect(filterAssets(list, { query: 'veículo', status: 'all' }).map((a) => a.id)).toEqual(['A'])
  })

  it('sem correspondência, lista vazia', () => {
    expect(filterAssets(assets, { query: 'zzz', status: 'all' })).toEqual([])
  })

  it('filtra por status', () => {
    const offline = filterAssets(assets, { query: '', status: 'offline' })
    expect(offline).toHaveLength(2)
    expect(offline.every((a) => a.status === 'offline')).toBe(true)
  })

  it('combina busca e status', () => {
    const found = filterAssets(assets, { query: 'sensor', status: 'online' })
    expect(found.every((a) => a.status === 'online' && a.type === 'sensor')).toBe(true)
  })

  it('"all" e busca vazia devolvem tudo', () => {
    expect(filterAssets(assets, { query: '  ', status: 'all' })).toHaveLength(40)
  })
})

describe('sortAssets', () => {
  it('não altera a lista recebida', () => {
    const copy = [...assets]
    sortAssets(assets, 'latencyMs', 'desc')
    expect(assets).toEqual(copy)
  })

  it('latência decrescente', () => {
    const sorted = sortAssets(assets, 'latencyMs', 'desc')
    expect(sorted[0].latencyMs).toBe(Math.max(...assets.map((a) => a.latencyMs)))
    expect(sorted.at(-1)!.latencyMs).toBe(Math.min(...assets.map((a) => a.latencyMs)))
  })

  it('status crescente põe offline, depois degradado, depois online', () => {
    const order = sortAssets(assets, 'status', 'asc').map((a) => a.status)
    expect(order.indexOf('degraded')).toBeGreaterThan(order.lastIndexOf('offline'))
    expect(order.indexOf('online')).toBeGreaterThan(order.lastIndexOf('degraded'))
  })

  it('nome em ordem alfabética pt-BR, com acento no lugar certo', () => {
    const list = [asset({ id: '1', name: 'Veículo' }), asset({ id: '2', name: 'Estação' }), asset({ id: '3', name: 'Sensor' })]
    expect(sortAssets(list, 'name', 'asc').map((a) => a.name)).toEqual(['Estação', 'Sensor', 'Veículo'])
  })

  it('nome com números em ordem natural (2 antes de 10)', () => {
    const list = [asset({ id: '1', name: 'Sensor 10' }), asset({ id: '2', name: 'Sensor 2' })]
    expect(sortAssets(list, 'name', 'asc').map((a) => a.name)).toEqual(['Sensor 2', 'Sensor 10'])
  })

  it('visto por último: mais recente primeiro em desc', () => {
    const list = [asset({ id: '1', lastSeen: '2026-10-16T10:00:00Z' }), asset({ id: '2', lastSeen: '2026-10-16T11:00:00Z' })]
    expect(sortAssets(list, 'lastSeen', 'desc').map((a) => a.id)).toEqual(['2', '1'])
  })

  it('empates são desfeitos pelo id, de forma estável', () => {
    const list = [asset({ id: 'B', latencyMs: 10 }), asset({ id: 'A', latencyMs: 10 })]
    expect(sortAssets(list, 'latencyMs', 'asc').map((a) => a.id)).toEqual(['A', 'B'])
    expect(sortAssets(list, 'latencyMs', 'desc').map((a) => a.id)).toEqual(['A', 'B'])
  })
})
