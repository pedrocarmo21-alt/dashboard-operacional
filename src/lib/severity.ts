import type { Severity } from '@/types/dashboard'

/** Cor de fundo de marcadores de severidade (pontos, barras, amostras). Info é neutro. */
export const SEVERITY_BG: Record<Severity, string> = {
  info: 'bg-chart-4',
  warning: 'bg-signal-warn',
  critical: 'bg-signal-critical',
}
