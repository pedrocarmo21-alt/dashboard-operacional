import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDashboardPanels } from '@/hooks/useDashboardPanels'
import { useFilters } from '@/hooks/filters'

export function EventsPage() {
  const { severity, query } = useFilters()
  const { data, now, panel } = useDashboardPanels()
  const events = data?.events ?? []

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Eventos">
        <FilterBar />
      </PageHeader>
      <Panel title="Todos os eventos" emptyMessage="Nenhum evento registrado." {...panel(events.length)}>
        <ActivityFeed events={events} severity={severity} query={query} now={now} />
      </Panel>
    </div>
  )
}
