import { describe, expect, it } from 'vitest'
import type { Alert } from '@/types/dashboard'
import { countBySeverity, formatAxisTime, summarizeThroughput } from './chart-data'

const alert = (severity: Alert['severity']): Alert => ({
  id: severity + Math.random(),
  title: 't',
  severity,
  assetId: 'AT-0001',
  createdAt: '2026-10-16T12:00:00Z',
  acknowledged: false,
})

describe('countBySeverity', () => {
  it('sem alertas, tudo zero', () => {
    expect(countBySeverity([])).toEqual({ info: 0, warning: 0, critical: 0 })
  })

  it('conta cada severidade, reconhecidos inclusive', () => {
    const alerts = [alert('critical'), alert('critical'), alert('info'), { ...alert('warning'), acknowledged: true }]
    expect(countBySeverity(alerts)).toEqual({ info: 1, warning: 1, critical: 2 })
  })
})

describe('summarizeThroughput', () => {
  it('sem pontos, null', () => {
    expect(summarizeThroughput([])).toBeNull()
  })

  it('mínimo, máximo e média', () => {
    expect(
      summarizeThroughput([
        { timestamp: 'a', eventsPerSec: 10 },
        { timestamp: 'b', eventsPerSec: 30 },
        { timestamp: 'c', eventsPerSec: 20 },
      ]),
    ).toEqual({ min: 10, max: 30, avg: 20 })
  })

  it('um único ponto', () => {
    expect(summarizeThroughput([{ timestamp: 'a', eventsPerSec: 7 }])).toEqual({ min: 7, max: 7, avg: 7 })
  })
})

describe('formatAxisTime', () => {
  it('24h mostra a hora', () => {
    expect(formatAxisTime('2026-10-16T09:00:00Z', '24h', 'UTC')).toBe('09:00')
  })

  it('7d e 30d mostram o dia', () => {
    expect(formatAxisTime('2026-10-16T09:00:00Z', '7d', 'UTC')).toBe('16/10')
    expect(formatAxisTime('2026-10-03T09:00:00Z', '30d', 'UTC')).toBe('03/10')
  })

  it('respeita o fuso', () => {
    expect(formatAxisTime('2026-10-16T01:00:00Z', '7d', 'America/Sao_Paulo')).toBe('15/10')
  })

  it('data inválida mostra travessão', () => {
    expect(formatAxisTime('x', '24h')).toBe('—')
  })
})
