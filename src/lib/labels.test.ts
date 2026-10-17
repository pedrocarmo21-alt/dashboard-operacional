import { describe, expect, it } from 'vitest'
import { ASSET_STATUS_LABEL, PERIOD_LABEL, SEVERITY_LABEL, SYSTEM_STATUS_LABEL } from './labels'

// Rótulos fixados nas Restrições globais de docs/plano.md.
describe('rótulos', () => {
  it('severidade', () => {
    expect(SEVERITY_LABEL).toEqual({ info: 'Info', warning: 'Aviso', critical: 'Crítico' })
  })

  it('status do ativo', () => {
    expect(ASSET_STATUS_LABEL).toEqual({ online: 'Online', degraded: 'Degradado', offline: 'Offline' })
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
})
