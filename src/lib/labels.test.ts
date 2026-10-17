import { describe, expect, it } from 'vitest'
import {
  acknowledgeLabel,
  ASSET_STATUS_LABEL,
  ASSET_TYPE_LABEL,
  PERIOD_LABEL,
  SEVERITY_LABEL,
  SYSTEM_STATUS_LABEL,
} from './labels'
import { formatDateTime } from './format'

// Rótulos fixados nas Restrições globais de docs/plano.md.
describe('rótulos', () => {
  it('severidade', () => {
    expect(SEVERITY_LABEL).toEqual({ info: 'Info', warning: 'Aviso', critical: 'Crítico' })
  })

  it('status do ativo', () => {
    expect(ASSET_STATUS_LABEL).toEqual({ online: 'Online', degraded: 'Degradado', offline: 'Offline' })
  })

  it('tipo do ativo', () => {
    expect(ASSET_TYPE_LABEL).toEqual({ sensor: 'Sensor', veiculo: 'Veículo', estacao: 'Estação' })
  })

  it('status do sistema', () => {
    expect(SYSTEM_STATUS_LABEL).toEqual({
      operational: 'Operacional',
      degraded: 'Degradado',
      outage: 'Interrompido',
    })
  })

  it('período', () => {
    expect(PERIOD_LABEL).toEqual({ '24h': 'Últimas 24 h', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias' })
  })

  it('botão de reconhecer nomeia o alerta, o ativo e o horário (únicos mesmo com título e ativo repetidos)', () => {
    const at = '2026-10-16T11:50:00Z'
    expect(acknowledgeLabel({ title: 'Falha de energia', assetId: 'AT-0007', createdAt: at })).toBe(
      `Reconhecer alerta Falha de energia (AT-0007, ${formatDateTime(at)})`,
    )
  })
})
