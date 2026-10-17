import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import { renderWithProviders } from '@/test/render'
import { LAZY_CHART } from '@/test/timeouts'
import { IncidentsBySeverityChart, ThroughputChart } from './lazy'

describe('gráficos sob demanda', () => {
  it('mostra um esqueleto enquanto o gráfico carrega, depois o gráfico', async () => {
    render(<ThroughputChart data={createMockData('24h').throughput} period="24h" />)
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(await screen.findByRole('figure', { name: /Ingestão de eventos/ }, LAZY_CHART)).toBeInTheDocument()
    expect(screen.queryByTestId('chart-skeleton')).not.toBeInTheDocument()
  })

  it('o de severidade também carrega', async () => {
    renderWithProviders(<IncidentsBySeverityChart alerts={createMockData('24h').alerts} />)
    expect(await screen.findByRole('figure', { name: 'Alertas por severidade' }, LAZY_CHART)).toBeInTheDocument()
  })
})
