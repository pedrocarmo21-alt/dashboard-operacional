import { describe, expect, it } from 'vitest'
import type { DashboardData, Kpi, KpiId, Period } from '@/types/dashboard'
import { REFERENCE_NOW, createMockData, createThroughputSeries } from './mock'

const PERIODS: Period[] = ['24h', '7d', '30d']
const HOUR = 3_600_000
const PERIOD_MS: Record<Period, number> = { '24h': 24 * HOUR, '7d': 7 * 24 * HOUR, '30d': 30 * 24 * HOUR }
const now = Date.parse(REFERENCE_NOW)

const kpi = (d: DashboardData, id: KpiId): Kpi => d.kpis.find((k) => k.id === id)!
const mean = (points: { eventsPerSec: number }[]) => points.reduce((sum, p) => sum + p.eventsPerSec, 0) / points.length

describe('createMockData', () => {
  it('é determinístico para a mesma semente', () => {
    expect(createMockData('24h')).toEqual(createMockData('24h'))
    expect(createMockData('7d', 7)).toEqual(createMockData('7d', 7))
  })

  it('sementes diferentes geram dados diferentes', () => {
    expect(createMockData('24h', 1)).not.toEqual(createMockData('24h', 2))
  })

  it('gera a quantidade esperada de pontos por período', () => {
    expect(createMockData('24h').throughput).toHaveLength(24)
    expect(createMockData('7d').throughput).toHaveLength(28)
    expect(createMockData('30d').throughput).toHaveLength(30)
  })

  it('gera 40 ativos, 12 alertas, 25 eventos e os 4 KPIs', () => {
    const d = createMockData('24h')
    expect(d.assets).toHaveLength(40)
    expect(d.alerts).toHaveLength(12)
    expect(d.events).toHaveLength(25)
    expect(d.kpis.map((k) => k.id)).toEqual(['assetsOnline', 'pendingAlerts', 'avgLatency', 'ingestRate'])
  })

  it('alertas de períodos diferentes têm ids diferentes', () => {
    const ids = PERIODS.flatMap((p) => createMockData(p).alerts.map((a) => a.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('a frota de ativos é a mesma em todos os períodos', () => {
    expect(createMockData('7d').assets).toEqual(createMockData('24h').assets)
  })

  it.each(PERIODS)('informa o próprio período (%s)', (period) => {
    expect(createMockData(period).period).toBe(period)
  })

  it('é gerado no instante de referência', () => {
    expect(createMockData('24h').generatedAt).toBe(REFERENCE_NOW)
  })
})

describe.each(PERIODS)('consistência interna (%s)', (period) => {
  const d = createMockData(period)
  const start = now - PERIOD_MS[period]

  it('a série termina no instante de referência, em ordem e com intervalo constante', () => {
    const times = d.throughput.map((p) => Date.parse(p.timestamp))
    expect(times.at(-1)).toBe(now)
    const steps = new Set(times.slice(1).map((t, i) => t - times[i]))
    expect(steps).toEqual(new Set([PERIOD_MS[period] / d.throughput.length]))
  })

  it('a ingestão é sempre positiva e finita', () => {
    expect(d.throughput.every((p) => Number.isFinite(p.eventsPerSec) && p.eventsPerSec > 0)).toBe(true)
  })

  it('alertas e eventos caem dentro do período', () => {
    const times = [...d.alerts.map((a) => a.createdAt), ...d.events.map((e) => e.timestamp)].map(Date.parse)
    expect(times.every((t) => t > start && t <= now)).toBe(true)
  })

  it('ids são únicos', () => {
    for (const list of [d.assets, d.alerts, d.events]) {
      expect(new Set(list.map((x) => x.id)).size).toBe(list.length)
    }
  })

  it('todo alerta aponta para um ativo existente', () => {
    const ids = new Set(d.assets.map((a) => a.id))
    expect(d.alerts.every((a) => ids.has(a.assetId))).toBe(true)
  })

  it('KPI de ativos online bate com a lista de ativos', () => {
    expect(kpi(d, 'assetsOnline').value).toBe(d.assets.filter((a) => a.status === 'online').length)
  })

  it('KPI de alertas pendentes conta os alertas não reconhecidos', () => {
    expect(kpi(d, 'pendingAlerts').value).toBe(d.alerts.filter((a) => !a.acknowledged).length)
  })

  it('KPI de latência média ignora ativos offline', () => {
    const reachable = d.assets.filter((a) => a.status !== 'offline')
    const mean = reachable.reduce((sum, a) => sum + a.latencyMs, 0) / reachable.length
    expect(kpi(d, 'avgLatency').value).toBeCloseTo(mean, 6)
  })

  it('KPI de ingestão é a média da série do período', () => {
    expect(kpi(d, 'ingestRate').label).toBe('Ingestão média')
    expect(kpi(d, 'ingestRate').value).toBeCloseTo(mean(d.throughput), 6)
  })

  it('a variação da ingestão compara com a média do período anterior', () => {
    const previous = createThroughputSeries(period, 42, now - PERIOD_MS[period])
    const expected = Math.round(((mean(d.throughput) - mean(previous)) / mean(previous)) * 1000) / 10
    expect(kpi(d, 'ingestRate').delta).toBe(expected)
  })

  it('KPIs têm unidade, direção boa e variação finita', () => {
    expect(d.kpis.map((k) => [k.id, k.unit, k.goodWhen])).toEqual([
      ['assetsOnline', 'count', 'up'],
      ['pendingAlerts', 'count', 'down'],
      ['avgLatency', 'ms', 'down'],
      ['ingestRate', 'eventsPerSec', 'up'],
    ])
    expect(d.kpis.every((k) => Number.isFinite(k.delta))).toBe(true)
  })

  it('status do sistema reflete alertas críticos pendentes', () => {
    const pendingCritical = d.alerts.some((a) => a.severity === 'critical' && !a.acknowledged)
    expect(d.systemStatus).toBe(pendingCritical ? 'degraded' : 'operational')
  })

  it('alertas críticos e de aviso apontam para ativos com problema', () => {
    const byId = new Map(d.assets.map((a) => [a.id, a]))
    const serious = d.alerts.filter((a) => a.severity !== 'info')
    expect(serious.every((a) => byId.get(a.assetId)!.status !== 'online')).toBe(true)
  })

  it('eventos críticos e de aviso citam ativos com problema', () => {
    const troubled = d.assets.filter((a) => a.status !== 'online').map((a) => a.name)
    const serious = d.events.filter((e) => e.severity !== 'info')
    expect(serious.length).toBeGreaterThan(0)
    expect(serious.every((e) => troubled.some((name) => e.message.includes(name)))).toBe(true)
  })

  it('ativos têm latência positiva e foram vistos até o instante de referência', () => {
    expect(d.assets.every((a) => Number.isFinite(a.latencyMs) && a.latencyMs > 0)).toBe(true)
    expect(d.assets.every((a) => Date.parse(a.lastSeen) <= now)).toBe(true)
  })

  it('ativos online foram vistos há menos de 5 minutos; offline, há mais de 15', () => {
    const age = (iso: string) => now - Date.parse(iso)
    expect(d.assets.filter((a) => a.status === 'online').every((a) => age(a.lastSeen) < 5 * 60_000)).toBe(true)
    expect(d.assets.filter((a) => a.status === 'offline').every((a) => age(a.lastSeen) > 15 * 60_000)).toBe(true)
  })
})

describe('createThroughputSeries', () => {
  it('a série do período anterior termina onde a atual começa', () => {
    const current = createThroughputSeries('24h', 42, now)
    const previous = createThroughputSeries('24h', 42, now - PERIOD_MS['24h'])
    expect(Date.parse(previous.at(-1)!.timestamp)).toBe(Date.parse(current[0].timestamp) - PERIOD_MS['24h'] / 24)
  })

  it('é a mesma série que createMockData usa', () => {
    expect(createThroughputSeries('7d', 42, now)).toEqual(createMockData('7d').throughput)
  })
})

describe('variedade dos dados', () => {
  const d = createMockData('24h')

  it('tem nomes com acento, para exercitar a busca', () => {
    expect(d.assets.some((a) => /[ãçéó]/i.test(a.name))).toBe(true)
  })

  it('tem os três tipos e os três status de ativo', () => {
    expect(new Set(d.assets.map((a) => a.type))).toEqual(new Set(['sensor', 'veiculo', 'estacao']))
    expect(new Set(d.assets.map((a) => a.status))).toEqual(new Set(['online', 'degraded', 'offline']))
  })

  it('a maioria dos ativos está online', () => {
    expect(d.assets.filter((a) => a.status === 'online').length).toBeGreaterThanOrEqual(28)
  })

  it('tem as três severidades nos alertas e alertas reconhecidos e pendentes', () => {
    expect(new Set(d.alerts.map((a) => a.severity))).toEqual(new Set(['info', 'warning', 'critical']))
    expect(new Set(d.alerts.map((a) => a.acknowledged))).toEqual(new Set([true, false]))
  })

  it('sementes diferentes produzem os dois status de sistema', () => {
    const statuses = new Set(Array.from({ length: 30 }, (_, seed) => createMockData('24h', seed).systemStatus))
    expect(statuses).toEqual(new Set(['operational', 'degraded']))
  })
})
