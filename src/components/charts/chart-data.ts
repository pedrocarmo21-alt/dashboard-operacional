import type { Alert, Period, Severity, ThroughputPoint } from '@/types/dashboard'

export function countBySeverity(alerts: Alert[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { info: 0, warning: 0, critical: 0 }
  for (const a of alerts) counts[a.severity] += 1
  return counts
}

export function summarizeThroughput(points: ThroughputPoint[]): { min: number; max: number; avg: number } | null {
  if (points.length === 0) return null
  const values = points.map((p) => p.eventsPerSec)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((sum, v) => sum + v, 0) / values.length,
  }
}

/** Rótulo do eixo X: hora em 24h, dia nos períodos longos. */
export function formatAxisTime(iso: string, period: Period, timeZone?: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return '—'
  const options: Intl.DateTimeFormatOptions =
    period === '24h' ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: '2-digit' }
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone }).format(time)
}
