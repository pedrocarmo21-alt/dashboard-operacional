const LOCALE = 'pt-BR'
const EMPTY = '—'
const NBSP = ' '
const MINUS = '−'

const numberFormat = new Intl.NumberFormat(LOCALE)
const compactFormat = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
const deltaFormat = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function formatNumber(n: number): string {
  return Number.isFinite(n) ? numberFormat.format(n) : EMPTY
}

export function formatCompact(n: number): string {
  return Number.isFinite(n) ? compactFormat.format(n) : EMPTY
}

export function formatMs(n: number): string {
  return Number.isFinite(n) ? `${numberFormat.format(Math.round(n))}${NBSP}ms` : EMPTY
}

/** Variação percentual com sinal explícito: `+12,3%`, `−4,0%`, `0,0%`. */
export function formatPercentDelta(d: number): string {
  if (!Number.isFinite(d)) return EMPTY
  const rounded = Math.round(d * 10) / 10
  const abs = deltaFormat.format(Math.abs(rounded))
  if (rounded > 0) return `+${abs}%`
  if (rounded < 0) return `${MINUS}${abs}%`
  return `${abs}%`
}

/** Tempo decorrido até `now`: `agora`, `há 5 min`, `há 3 h`, `há 2 d`. */
export function formatRelativeTime(iso: string, now: Date): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return EMPTY
  const seconds = Math.floor((now.getTime() - time) / 1000)
  if (seconds < 60) return 'agora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  return `há ${Math.floor(hours / 24)} d`
}

/** Data e hora curtas (`16/10/2026, 12:00`). Sem `timeZone`, usa o fuso do navegador. */
export function formatDateTime(iso: string, timeZone?: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return EMPTY
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'short', timeZone }).format(time)
}
