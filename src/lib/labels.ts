import { formatDateTime } from './format'
import type { Alert, AssetStatus, AssetType, Period, Severity, SystemStatus } from '@/types/dashboard'

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

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  sensor: 'Sensor',
  veiculo: 'Veículo',
  estacao: 'Estação',
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

/**
 * Nome acessível do botão de reconhecer: título, ativo e horário. Título e ativo sozinhos
 * podem repetir (dois alertas iguais no mesmo ativo); com o horário, o nome é único na lista.
 */
export function acknowledgeLabel({ title, assetId, createdAt }: Pick<Alert, 'title' | 'assetId' | 'createdAt'>): string {
  return `Reconhecer alerta ${title} (${assetId}, ${formatDateTime(createdAt)})`
}
