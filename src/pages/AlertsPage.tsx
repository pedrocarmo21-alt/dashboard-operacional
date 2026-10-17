import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { DataStatus } from '@/components/dashboard/DataStatus'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDashboardPanels } from '@/hooks/useDashboardPanels'
import { useFilters } from '@/hooks/filters'

export function AlertsPage() {
  const { severity, query } = useFilters()
  const { data, now, panel, acknowledgeAlert, dataStatus } = useDashboardPanels()
  const alerts = data?.alerts ?? []

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Alertas">
        <FilterBar />
      </PageHeader>
      <DataStatus {...dataStatus} />
      <Panel title="Todos os alertas" emptyMessage="Nenhum alerta no período." {...panel(alerts.length)}>
        <AlertsPanel alerts={alerts} severity={severity} query={query} onAcknowledge={acknowledgeAlert} now={now} />
      </Panel>
    </div>
  )
}
