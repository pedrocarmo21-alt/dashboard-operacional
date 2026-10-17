export type Period = '24h' | '7d' | '30d'
export type Severity = 'info' | 'warning' | 'critical'
export type AssetStatus = 'online' | 'degraded' | 'offline'
export type AssetType = 'sensor' | 'veiculo' | 'estacao'
export type SystemStatus = 'operational' | 'degraded' | 'outage'
export type AsyncStatus = 'loading' | 'success' | 'empty' | 'error'
/** Status de uma requisição; `empty` só existe no nível do painel. */
export type RequestStatus = Exclude<AsyncStatus, 'empty'>
export type KpiId = 'assetsOnline' | 'pendingAlerts' | 'avgLatency' | 'ingestRate'

export interface Kpi {
  id: KpiId
  label: string
  value: number
  unit: 'count' | 'ms' | 'eventsPerSec'
  /** Variação percentual em relação ao período anterior. */
  delta: number
  goodWhen: 'up' | 'down'
}

export interface ThroughputPoint {
  timestamp: string
  eventsPerSec: number
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  region: string
  status: AssetStatus
  /** Última latência medida; em ativos offline, a medida antes de cair. */
  latencyMs: number
  lastSeen: string
}

export interface Alert {
  id: string
  title: string
  severity: Severity
  assetId: string
  createdAt: string
  acknowledged: boolean
}

export interface ActivityEvent {
  id: string
  message: string
  actor: string
  timestamp: string
  severity: Severity
}

export interface DashboardData {
  /** Período a que os dados se referem (pode diferir do filtro enquanto uma recarga não termina). */
  period: Period
  systemStatus: SystemStatus
  generatedAt: string
  kpis: Kpi[]
  throughput: ThroughputPoint[]
  assets: Asset[]
  alerts: Alert[]
  events: ActivityEvent[]
}
