import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFilters } from '@/hooks/filters'
import { PERIOD_LABEL, SEVERITY_LABEL } from '@/lib/labels'
import type { Period, Severity } from '@/types/dashboard'

const PERIODS: Period[] = ['24h', '7d', '30d']
const SEVERITIES: (Severity | 'all')[] = ['all', 'info', 'warning', 'critical']
const severityLabel = (s: Severity | 'all') => (s === 'all' ? 'Todas' : SEVERITY_LABEL[s])

/** Filtros de período e severidade, compartilhados por todas as páginas. */
export function FilterBar({ showSeverity = true }: { showSeverity?: boolean }) {
  const { period, setPeriod, severity, setSeverity, isDefault, resetFilters } = useFilters()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Período"
        value={period}
        // O Radix permite desmarcar o item ativo; um período precisa estar sempre escolhido.
        onValueChange={(value) => value && setPeriod(value as Period)}
      >
        {PERIODS.map((p) => (
          <ToggleGroupItem key={p} value={p} aria-label={PERIOD_LABEL[p]} className="px-2.5 font-mono text-xs">
            {p}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {showSeverity && (
        <Select value={severity} onValueChange={(value) => setSeverity(value as Severity | 'all')}>
          <SelectTrigger size="sm" aria-label="Severidade" className="min-w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {severityLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isDefault && (
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground">
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
