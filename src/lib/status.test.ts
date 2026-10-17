import { describe, expect, it } from 'vitest'
import { derivePanelStatus } from './status'

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
