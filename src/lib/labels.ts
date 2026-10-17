import type { AssetStatus, Period, Severity, SystemStatus } from '@/types/dashboard'

export const SEVERITY_LABEL: Record<Severity, string> = {
  info: 'Info',
  warning: 'Aviso',
  critical: 'Crítico',
}

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  online: 'Online',
  degraded: 'Degradado',
  offline: 'Offline',
}

export const SYSTEM_STATUS_LABEL: Record<SystemStatus, string> = {
  operational: 'Operacional',
  degraded: 'Degradado',
  outage: 'Interrompido',
}

export const PERIOD_LABEL: Record<Period, string> = {
  '24h': 'Últimas 24 h',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
}
