import { describe, expect, it } from 'vitest'
import {
  formatCompact,
  formatDateTime,
  formatMs,
  formatNumber,
  formatPercentDelta,
  formatRelativeTime,
} from './format'

// O Intl usa espaço não separável; os testes comparam com espaço comum.
const norm = (s: string) => s.replace(/\s/g, ' ')

describe('formatNumber', () => {
  it('usa separador de milhar pt-BR', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })

  it('usa vírgula decimal', () => {
    expect(formatNumber(12.5)).toBe('12,5')
  })

  it('formata zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it.each([NaN, Infinity, -Infinity])('mostra travessão para %s', (n) => {
    expect(formatNumber(n)).toBe('—')
  })
})

describe('formatCompact', () => {
  it('abrevia milhares', () => {
    expect(norm(formatCompact(1200))).toBe('1,2 mil')
  })

  it('abrevia milhões', () => {
    expect(norm(formatCompact(3_400_000))).toBe('3,4 mi')
  })

  it('não abrevia valores pequenos', () => {
    expect(formatCompact(950)).toBe('950')
  })

  it('mostra travessão para NaN', () => {
    expect(formatCompact(NaN)).toBe('—')
  })
})

describe('formatMs', () => {
  it('arredonda e acrescenta a unidade', () => {
    expect(norm(formatMs(128.4))).toBe('128 ms')
  })

  it('usa separador de milhar', () => {
    expect(norm(formatMs(1500))).toBe('1.500 ms')
  })

  it('não separa número e unidade em quebra de linha', () => {
    expect(formatMs(128)).toBe('128\u00a0ms')
  })

  it('mostra travessão para NaN', () => {
    expect(formatMs(NaN)).toBe('—')
  })
})

describe('formatPercentDelta', () => {
  it('positivo leva sinal de mais e uma casa decimal', () => {
    expect(formatPercentDelta(12.34)).toBe('+12,3%')
  })

  it('negativo usa o sinal de menos tipográfico (U+2212)', () => {
    expect(formatPercentDelta(-4)).toBe('−4,0%')
  })

  it('zero não leva sinal', () => {
    expect(formatPercentDelta(0)).toBe('0,0%')
  })

  it.each([0.04, -0.04, -0])('valor que arredonda para zero (%s) não leva sinal', (d) => {
    expect(formatPercentDelta(d)).toBe('0,0%')
  })

  it('valores grandes têm separador de milhar', () => {
    expect(formatPercentDelta(1234.5)).toBe('+1.234,5%')
  })

  it.each([NaN, Infinity])('mostra travessão para %s', (d) => {
    expect(formatPercentDelta(d)).toBe('—')
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-16T12:00:00Z')

  it('menos de um minuto é "agora"', () => {
    expect(formatRelativeTime('2026-10-16T11:59:40Z', now)).toBe('agora')
  })

  it('minutos', () => {
    expect(formatRelativeTime('2026-10-16T11:55:00Z', now)).toBe('há 5 min')
  })

  it('horas', () => {
    expect(formatRelativeTime('2026-10-16T09:00:00Z', now)).toBe('há 3 h')
  })

  it('dias', () => {
    expect(formatRelativeTime('2026-10-14T12:00:00Z', now)).toBe('há 2 d')
  })

  it('arredonda para baixo (59 min 59 s ainda é minutos)', () => {
    expect(formatRelativeTime('2026-10-16T11:00:01Z', now)).toBe('há 59 min')
  })

  it('data no futuro (relógio adiantado) é "agora"', () => {
    expect(formatRelativeTime('2026-10-16T12:05:00Z', now)).toBe('agora')
  })

  it('data inválida mostra travessão', () => {
    expect(formatRelativeTime('não é data', now)).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('mostra data e hora curtas em pt-BR', () => {
    expect(norm(formatDateTime('2026-10-16T12:00:00Z', 'UTC'))).toBe('16/10/2026, 12:00')
  })

  it('respeita o fuso informado', () => {
    expect(norm(formatDateTime('2026-10-16T12:00:00Z', 'America/Sao_Paulo'))).toBe('16/10/2026, 09:00')
  })

  it('data inválida mostra travessão', () => {
    expect(formatDateTime('não é data')).toBe('—')
  })
})
