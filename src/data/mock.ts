import type {
  ActivityEvent,
  Alert,
  Asset,
  AssetStatus,
  AssetType,
  DashboardData,
  Kpi,
  Period,
  Severity,
  ThroughputPoint,
} from '@/types/dashboard'

/** Instante fixo dos dados fictícios, para que telas e testes sejam reproduzíveis. */
export const REFERENCE_NOW = '2026-10-16T12:00:00Z'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const PERIODS: Record<Period, { durationMs: number; points: number; salt: number }> = {
  '24h': { durationMs: DAY, points: 24, salt: 1 },
  '7d': { durationMs: 7 * DAY, points: 28, salt: 2 },
  '30d': { durationMs: 30 * DAY, points: 30, salt: 3 },
}

const REGIONS = ['Norte', 'Sul', 'Leste', 'Oeste', 'Centro']
const ASSET_TYPES: AssetType[] = ['sensor', 'veiculo', 'estacao']
const SENSOR_KINDS = ['Óptico', 'Térmico', 'Acústico', 'Sísmico']
const VEHICLE_KINDS = ['Patrulha', 'Logística', 'Reconhecimento']
const OPERATORS = ['op.almeida', 'op.ribeiro', 'op.nakamura', 'op.souza']

// 40 ativos: 80% online, 15% degradado, 5% offline.
const STATUS_COUNTS: Record<AssetStatus, number> = { online: 32, degraded: 6, offline: 2 }
const ALERT_SEVERITIES = [...repeat<Severity>('critical', 3), ...repeat<Severity>('warning', 5), ...repeat<Severity>('info', 4)]
const EVENT_COUNT = 25

const ALERT_TITLES: Record<Severity, string[]> = {
  critical: ['Ativo sem resposta', 'Perda total de telemetria', 'Falha de energia'],
  warning: ['Latência acima do limite', 'Perda de pacotes acima de 2%', 'Bateria abaixo de 20%', 'Temperatura elevada'],
  info: ['Firmware atualizado', 'Manutenção programada', 'Reinício concluído'],
}

const EVENT_MESSAGES: Record<Severity, ((asset: string) => string)[]> = {
  info: [
    (a) => `${a} voltou a transmitir`,
    (a) => `Configuração de ${a} atualizada`,
    (a) => `Rota de ${a} recalculada`,
    (a) => `Calibração de ${a} concluída`,
  ],
  warning: [(a) => `${a} com latência elevada`, (a) => `${a} operando com bateria reduzida`],
  critical: [(a) => `${a} perdeu conexão`],
}

type Rng = () => number

/** PRNG mulberry32: rápido, determinístico e suficiente para dados de demonstração. */
function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

function repeat<T>(value: T, times: number): T[] {
  return Array.from({ length: times }, () => value)
}

const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min)
const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]
const pad = (n: number, size: number) => String(n).padStart(size, '0')
const iso = (ms: number) => new Date(ms).toISOString()
const round1 = (n: number) => Math.round(n * 10) / 10

function shuffle<T>(rng: Rng, list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function assetName(rng: Rng, type: AssetType, region: string, n: number): string {
  if (type === 'sensor') return `Sensor ${pick(rng, SENSOR_KINDS)} ${pad(n, 2)}`
  if (type === 'veiculo') return `Veículo ${pick(rng, VEHICLE_KINDS)} ${pad(n, 2)}`
  return `Estação ${region}-${pad(n, 2)}`
}

// A frota não depende do período: o mesmo ativo aparece igual em 24h, 7d e 30d.
function createAssets(rng: Rng, now: number): Asset[] {
  const statuses = shuffle(
    rng,
    (Object.entries(STATUS_COUNTS) as [AssetStatus, number][]).flatMap(([s, n]) => repeat(s, n)),
  )
  const perType: Record<AssetType, number> = { sensor: 0, veiculo: 0, estacao: 0 }

  return statuses.map((status, i) => {
    const type = ASSET_TYPES[i % ASSET_TYPES.length]
    const region = pick(rng, REGIONS)
    perType[type] += 1
    const [latency, seenAgo] = {
      online: [between(rng, 20, 120), between(rng, 5_000, 4 * MINUTE)],
      degraded: [between(rng, 180, 600), between(rng, MINUTE, 10 * MINUTE)],
      offline: [between(rng, 400, 1500), between(rng, 20 * MINUTE, 6 * HOUR)],
    }[status]
    return {
      id: `AT-${pad(i + 1, 4)}`,
      name: assetName(rng, type, region, perType[type]),
      type,
      region,
      status,
      latencyMs: Math.round(latency),
      lastSeen: iso(now - Math.round(seenAgo)),
    }
  })
}

/**
 * Série de ingestão da janela de um período que termina em `endMs`. Tem sequência aleatória
 * própria, derivada da janela: a mesma janela gera sempre a mesma série, o que permite
 * calcular o período anterior para a variação do KPI.
 */
export function createThroughputSeries(period: Period, seed: number, endMs: number): ThroughputPoint[] {
  const { durationMs, points, salt } = PERIODS[period]
  const rng = mulberry32(seed * 131 + salt * 7 + Math.floor(endMs / durationMs))
  const step = durationMs / points
  return Array.from({ length: points }, (_, i) => {
    const t = endMs - (points - 1 - i) * step
    const hourOfDay = new Date(t).getUTCHours()
    const daily = 1 + 0.25 * Math.sin((2 * Math.PI * (hourOfDay - 6)) / 24)
    return { timestamp: iso(t), eventsPerSec: Math.round(1200 * daily + between(rng, -80, 80)) }
  })
}

const meanRate = (points: ThroughputPoint[]) => points.reduce((sum, p) => sum + p.eventsPerSec, 0) / points.length

/** Instante aleatório dentro do período, nunca no início exato nem depois de `now`. */
function withinPeriod(rng: Rng, now: number, durationMs: number): number {
  return now - Math.round(between(rng, 0.002, 0.99) * durationMs)
}

// Ids incluem o período: o mesmo número em 24h e 7d seria outro alerta, e reconhecer um não pode marcar o outro.
function createAlerts(rng: Rng, period: Period, now: number, durationMs: number, assets: Asset[]): Alert[] {
  const troubled = assets.filter((a) => a.status !== 'online')
  // Em parte das sementes todos os críticos já foram tratados e o sistema fica operacional.
  const criticalsHandled = rng() < 0.35

  return shuffle(rng, ALERT_SEVERITIES)
    .map((severity, i) => ({
      id: `AL-${period.toUpperCase()}-${pad(i + 1, 4)}`,
      title: pick(rng, ALERT_TITLES[severity]),
      severity,
      // Críticos e avisos (sem resposta, latência alta...) só fazem sentido em ativos com problema.
      assetId: (severity === 'info' ? pick(rng, assets) : pick(rng, troubled)).id,
      createdAt: iso(withinPeriod(rng, now, durationMs)),
      acknowledged: severity === 'critical' ? criticalsHandled : rng() < 0.4,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function createEvents(rng: Rng, now: number, durationMs: number, assets: Asset[]): ActivityEvent[] {
  const troubled = assets.filter((a) => a.status !== 'online')
  return Array.from({ length: EVENT_COUNT }, (_, i) => {
    const roll = rng()
    const severity: Severity = roll < 0.7 ? 'info' : roll < 0.92 ? 'warning' : 'critical'
    const asset = severity === 'info' ? pick(rng, assets) : pick(rng, troubled)
    return {
      id: `EV-${pad(i + 1, 4)}`,
      message: pick(rng, EVENT_MESSAGES[severity])(asset.name),
      actor: severity === 'info' && rng() < 0.5 ? pick(rng, OPERATORS) : 'sistema',
      timestamp: iso(withinPeriod(rng, now, durationMs)),
      severity,
    }
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

function createKpis(rng: Rng, assets: Asset[], alerts: Alert[], throughput: ThroughputPoint[], previous: ThroughputPoint[]): Kpi[] {
  const reachable = assets.filter((a) => a.status !== 'offline')
  const current = meanRate(throughput)
  const before = meanRate(previous)
  return [
    {
      id: 'assetsOnline',
      label: 'Ativos online',
      value: assets.filter((a) => a.status === 'online').length,
      unit: 'count',
      delta: round1(between(rng, -5, 5)),
      goodWhen: 'up',
    },
    {
      id: 'pendingAlerts',
      label: 'Alertas pendentes',
      value: alerts.filter((a) => !a.acknowledged).length,
      unit: 'count',
      delta: round1(between(rng, -30, 30)),
      goodWhen: 'down',
    },
    {
      id: 'avgLatency',
      label: 'Latência média',
      value: reachable.reduce((sum, a) => sum + a.latencyMs, 0) / reachable.length,
      unit: 'ms',
      delta: round1(between(rng, -15, 15)),
      goodWhen: 'down',
    },
    {
      id: 'ingestRate',
      label: 'Ingestão média',
      value: current,
      unit: 'eventsPerSec',
      delta: round1(((current - before) / before) * 100),
      goodWhen: 'up',
    },
  ]
}

export function createMockData(period: Period, seed = 42): DashboardData {
  const { durationMs, salt } = PERIODS[period]
  const now = Date.parse(REFERENCE_NOW)
  const assets = createAssets(mulberry32(seed), now)
  const rng = mulberry32(seed * 31 + salt)

  const throughput = createThroughputSeries(period, seed, now)
  const previous = createThroughputSeries(period, seed, now - durationMs)
  const alerts = createAlerts(rng, period, now, durationMs, assets)
  const events = createEvents(rng, now, durationMs, assets)
  const pendingCritical = alerts.some((a) => a.severity === 'critical' && !a.acknowledged)

  return {
    period,
    systemStatus: pendingCritical ? 'degraded' : 'operational',
    generatedAt: REFERENCE_NOW,
    kpis: createKpis(rng, assets, alerts, throughput, previous),
    throughput,
    assets,
    alerts,
    events,
  }
}
