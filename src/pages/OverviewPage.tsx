import { AlertsBySeverityChart, ThroughputChart } from '@/components/charts/lazy'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { AssetsTable } from '@/components/dashboard/AssetsTable'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { DataStatus } from '@/components/dashboard/DataStatus'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDashboardPanels } from '@/hooks/useDashboardPanels'
import { useFilters } from '@/hooks/filters'
import { PERIOD_LABEL } from '@/lib/labels'

export function OverviewPage() {
  const { period, severity, query } = useFilters()
  const { data, now, panel, acknowledgeAlert, dataStatus } = useDashboardPanels()
  // Durante uma recarga, os dados ainda são do período anterior: rótulos seguem os dados.
  const dataPeriod = data?.period ?? period
  const kpis = data?.kpis ?? []
  const throughput = data?.throughput ?? []
  const assets = data?.assets ?? []
  const alerts = data?.alerts ?? []
  const events = data?.events ?? []

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Visão geral">
        <FilterBar />
      </PageHeader>
      <DataStatus {...dataStatus} />

      <KpiGrid kpis={kpis} {...panel(kpis.length)} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel
          title="Ingestão de eventos"
          description={PERIOD_LABEL[dataPeriod]}
          emptyMessage="Sem dados de ingestão no período."
          className="lg:col-span-2"
          {...panel(throughput.length)}
        >
          <ThroughputChart data={throughput} period={dataPeriod} />
        </Panel>

        <Panel title="Alertas por severidade" emptyMessage="Nenhum alerta no período." {...panel(alerts.length)}>
          <AlertsBySeverityChart alerts={alerts} />
        </Panel>

        <Panel title="Ativos" emptyMessage="Nenhum ativo cadastrado." className="lg:col-span-2" {...panel(assets.length)}>
          <AssetsTable assets={assets} query={query} limit={8} now={now} />
        </Panel>

        <Panel title="Alertas" emptyMessage="Nenhum alerta no período." {...panel(alerts.length)}>
          <AlertsPanel
            alerts={alerts}
            severity={severity}
            query={query}
            onAcknowledge={acknowledgeAlert}
            limit={5}
            now={now}
          />
        </Panel>

        <Panel title="Eventos" emptyMessage="Nenhum evento registrado." className="lg:col-span-3" {...panel(events.length)}>
          <ActivityFeed events={events} severity={severity} query={query} limit={8} now={now} />
        </Panel>
      </div>
    </div>
  )
}
