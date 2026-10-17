import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDashboardPanels } from '@/hooks/useDashboardPanels'
import { useFilters } from '@/hooks/filters'

export function AlertsPage() {
  const { severity, query } = useFilters()
  const { data, now, panel, acknowledgeAlert } = useDashboardPanels()
  const alerts = data?.alerts ?? []

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Alertas">
        <FilterBar />
      </PageHeader>
      <Panel title="Todos os alertas" emptyMessage="Nenhum alerta no período." {...panel(alerts.length)}>
        <AlertsPanel alerts={alerts} severity={severity} query={query} onAcknowledge={acknowledgeAlert} now={now} />
      </Panel>
    </div>
  )
}
