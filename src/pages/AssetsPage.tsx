import { AssetsTable } from '@/components/dashboard/AssetsTable'
import { DataStatus } from '@/components/dashboard/DataStatus'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDashboardPanels } from '@/hooks/useDashboardPanels'
import { useFilters } from '@/hooks/filters'

// Sem barra de filtros: a frota é a mesma em qualquer período e ativos não têm severidade.
// A busca do header e o filtro de status da tabela continuam valendo.
export function AssetsPage() {
  const { query } = useFilters()
  const { data, now, panel, dataStatus } = useDashboardPanels()
  const assets = data?.assets ?? []

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Ativos" />
      <DataStatus {...dataStatus} />
      <Panel title="Todos os ativos" emptyMessage="Nenhum ativo no período." {...panel(assets.length)}>
        <AssetsTable assets={assets} query={query} now={now} />
      </Panel>
    </div>
  )
}
