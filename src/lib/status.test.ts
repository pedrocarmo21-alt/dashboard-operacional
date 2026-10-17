import { describe, expect, it } from 'vitest'
import { derivePanelStatus, panelState } from './status'

describe('derivePanelStatus', () => {
  it('sucesso sem itens é vazio', () => {
    expect(derivePanelStatus('success', 0)).toBe('empty')
  })

  it('sucesso com itens é sucesso', () => {
    expect(derivePanelStatus('success', 3)).toBe('success')
  })

  it('carregando continua carregando, mesmo com itens antigos', () => {
    expect(derivePanelStatus('loading', 0)).toBe('loading')
    expect(derivePanelStatus('loading', 5)).toBe('loading')
  })

  it('erro continua erro, mesmo com itens antigos', () => {
    expect(derivePanelStatus('error', 5)).toBe('error')
  })
})

describe('panelState', () => {
  it('primeira carga, sem dados: esqueleto', () => {
    expect(panelState('loading', false, 0)).toEqual({ status: 'loading', refreshing: false, stale: false })
  })

  it('recarga com dados anteriores: mostra o conteúdo, marcado como recarregando', () => {
    expect(panelState('loading', true, 5)).toEqual({ status: 'success', refreshing: true, stale: false })
  })

  it('recarga com dados anteriores vazios: vazio, recarregando', () => {
    expect(panelState('loading', true, 0)).toEqual({ status: 'empty', refreshing: true, stale: false })
  })

  it('sucesso', () => {
    expect(panelState('success', true, 3)).toEqual({ status: 'success', refreshing: false, stale: false })
    expect(panelState('success', true, 0)).toEqual({ status: 'empty', refreshing: false, stale: false })
  })

  it('erro na primeira carga: erro', () => {
    expect(panelState('error', false, 0)).toEqual({ status: 'error', refreshing: false, stale: false })
  })

  it('erro numa recarga: mantém o conteúdo anterior, marcado como desatualizado', () => {
    expect(panelState('error', true, 3)).toEqual({ status: 'success', refreshing: false, stale: true })
  })
})
