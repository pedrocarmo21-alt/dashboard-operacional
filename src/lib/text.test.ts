import { describe, expect, it } from 'vitest'
import { matchesQuery, normalizeText } from './text'

describe('normalizeText', () => {
  it('remove acentos, caixa e espaços das pontas', () => {
    expect(normalizeText('  Estação NORTE ')).toBe('estacao norte')
  })

  it('junta espaços repetidos', () => {
    expect(normalizeText('Sensor    Óptico\t12')).toBe('sensor optico 12')
  })

  it('remove cedilha e til', () => {
    expect(normalizeText('Ação Ãç')).toBe('acao ac')
  })
})

describe('matchesQuery', () => {
  it('ignora acento e caixa', () => {
    expect(matchesQuery(['Estação Norte-03', 'Sul'], 'ESTACAO')).toBe(true)
  })

  it('retorna falso sem correspondência', () => {
    expect(matchesQuery(['Sensor A'], 'radar')).toBe(false)
  })

  it('busca vazia ou só com espaços casa tudo', () => {
    expect(matchesQuery(['Sensor A'], '')).toBe(true)
    expect(matchesQuery(['Sensor A'], '   ')).toBe(true)
  })

  it('caracteres especiais de regex não quebram a busca', () => {
    expect(matchesQuery(['Sensor (A)'], '(a)')).toBe(true)
    expect(matchesQuery(['Sensor A'], '.*')).toBe(false)
    expect(matchesQuery(['Sensor A'], '[')).toBe(false)
  })

  it('cada palavra da busca pode casar em qualquer campo', () => {
    expect(matchesQuery(['Estação Norte-03', 'Norte'], 'estacao 03')).toBe(true)
    expect(matchesQuery(['Estação Norte-03', 'Centro'], 'norte centro')).toBe(true)
  })

  it('todas as palavras da busca precisam casar', () => {
    expect(matchesQuery(['Estação Norte-03'], 'estacao sul')).toBe(false)
  })

  it('sem campos não casa uma busca real', () => {
    expect(matchesQuery([], 'norte')).toBe(false)
  })
})
