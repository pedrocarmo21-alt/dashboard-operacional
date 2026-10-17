import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '@/App'
import { createMockData } from '@/data/mock'
import type { Fetcher } from '@/hooks/dashboard-data'
import { controlledFetcher, emptyData, okFetcher } from '@/test/fetchers'
import { renderWithProviders } from '@/test/render'
import { LAZY_CHART } from '@/test/timeouts'
import { OverviewPage } from './OverviewPage'

const REGIONS = ['Indicadores', 'Ingestão de eventos', 'Alertas por severidade', 'Ativos', 'Alertas', 'Eventos']

const region = (name: string) => screen.getByRole('region', { name })
const kpiValue = (label: string) => {
  const term = screen.getAllByRole('term').find((t) => t.textContent === label)!
  return within(term.closest('dl')!).getByTestId('kpi-value').textContent
}

describe('OverviewPage', () => {
  it('tem o título e a barra de filtros', async () => {
    renderWithProviders(<OverviewPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Período' })).toBeInTheDocument()
    await screen.findByText('Latência média')
  })

  it('mostra carregando em todos os painéis e depois o conteúdo', async () => {
    const { fetcher, calls } = controlledFetcher()
    renderWithProviders(<OverviewPage />, { fetcher })
    for (const name of REGIONS) expect(region(name)).toHaveAttribute('aria-busy', 'true')

    await act(async () => calls[0].resolve(createMockData('24h')))
    for (const name of REGIONS) expect(region(name)).not.toHaveAttribute('aria-busy')
    expect(within(region('Ativos')).getByRole('table')).toBeInTheDocument()
    expect(within(region('Alertas')).getByRole('list', { name: 'Alertas' })).toBeInTheDocument()
    expect(within(region('Eventos')).getByRole('list', { name: 'Eventos' })).toBeInTheDocument()
  })

  it('a visão geral mostra amostras com link para as páginas completas', async () => {
    renderWithProviders(<OverviewPage />)
    expect(await screen.findByRole('link', { name: 'Ver todos os 40 ativos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos os 12 alertas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos os 25 eventos' })).toBeInTheDocument()
  })

  it('erro e "Tentar novamente" recuperam todos os painéis', async () => {
    const fetcher = vi.fn<Fetcher>().mockRejectedValueOnce(new Error('x')).mockImplementation(okFetcher)
    const { user } = renderWithProviders(<OverviewPage />, { fetcher })
    const retry = await screen.findAllByRole('button', { name: 'Tentar novamente' })
    expect(retry.length).toBe(REGIONS.length)

    await user.click(retry[0])
    expect(await screen.findByText('Latência média')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it('dados vazios mostram o estado vazio de cada painel', async () => {
    renderWithProviders(<OverviewPage />, { fetcher: (p) => Promise.resolve(emptyData(p)) })
    expect(await screen.findByText('Sem indicadores para o período.')).toBeInTheDocument()
    expect(within(region('Ingestão de eventos')).getByText('Sem dados de ingestão no período.')).toBeInTheDocument()
    expect(within(region('Alertas por severidade')).getByText('Nenhum alerta no período.')).toBeInTheDocument()
    expect(within(region('Ativos')).getByText('Nenhum ativo no período.')).toBeInTheDocument()
    expect(within(region('Alertas')).getByText('Nenhum alerta no período.')).toBeInTheDocument()
    expect(within(region('Eventos')).getByText('Nenhum evento registrado.')).toBeInTheDocument()
  })

  it('trocar o período refaz a busca e mantém o conteúdo anterior esmaecido enquanto carrega', async () => {
    const { fetcher, calls } = controlledFetcher()
    const { user } = renderWithProviders(<OverviewPage />, { fetcher })
    await act(async () => calls[0].resolve(createMockData('24h')))

    await user.click(screen.getByRole('radio', { name: 'Últimos 7 dias' }))
    expect(calls.at(-1)!.period).toBe('7d')
    expect(region('Ativos')).toHaveAttribute('aria-busy', 'true')
    expect(within(region('Ativos')).getByRole('table')).toBeInTheDocument()
    expect(screen.queryAllByTestId('kpi-skeleton')).toHaveLength(0)
    // Os dados na tela ainda são de 24h: o rótulo não pode dizer 7 dias antes de eles chegarem.
    expect(await within(region('Ingestão de eventos')).findByRole('figure', {}, LAZY_CHART)).toHaveAccessibleName(
      'Ingestão de eventos por segundo, últimas 24 h',
    )

    await act(async () => calls.at(-1)!.resolve(createMockData('7d')))
    expect(region('Ativos')).not.toHaveAttribute('aria-busy')
    expect(await within(region('Ingestão de eventos')).findByRole('figure', {}, LAZY_CHART)).toHaveAccessibleName(
      'Ingestão de eventos por segundo, últimos 7 dias',
    )
  })

  it('severidade crítica filtra a lista de alertas e marca a barra do gráfico', async () => {
    const { user } = renderWithProviders(<OverviewPage />)
    await screen.findByText('Latência média')
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    await user.click(screen.getByRole('option', { name: 'Crítico' }))

    const items = within(within(region('Alertas')).getByRole('list', { name: 'Alertas' })).getAllByRole('listitem')
    expect(items.every((li) => li.textContent?.includes('Crítico'))).toBe(true)
    expect(within(region('Alertas por severidade')).getByRole('button', { name: /^Crítico:/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('reconhecer um alerta atualiza o KPI de incidentes abertos', async () => {
    const { user } = renderWithProviders(<OverviewPage />)
    await screen.findByText('Latência média')
    const before = Number(kpiValue('Incidentes abertos'))
    await user.click(within(region('Alertas')).getAllByRole('button', { name: /^Reconhecer alerta/ })[0])
    expect(Number(kpiValue('Incidentes abertos'))).toBe(before - 1)
  })

  it('a busca do header filtra a tabela da visão geral', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await screen.findByText('Latência média')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar ativos, alertas e eventos' }), 'ESTACAO')
    const rows = within(within(region('Ativos')).getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((r) => r.textContent?.includes('Estação'))).toBe(true)
  })

  it('erro numa recarga aparece, mesmo com dados anteriores', async () => {
    const { fetcher, calls } = controlledFetcher()
    const { user } = renderWithProviders(<OverviewPage />, { fetcher })
    await act(async () => calls[0].resolve(createMockData('24h')))
    await user.click(screen.getByRole('radio', { name: 'Últimos 30 dias' }))
    await act(async () => calls.at(-1)!.reject(new Error('x')))
    await waitFor(() => expect(within(region('Ativos')).getByRole('alert')).toBeInTheDocument())
  })
})
