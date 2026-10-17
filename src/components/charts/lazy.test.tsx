import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import { renderWithProviders } from '@/test/render'
import { IncidentsBySeverityChart, ThroughputChart } from './lazy'

describe('gráficos sob demanda', () => {
  it('mostra um esqueleto anunciado enquanto o gráfico carrega, depois o gráfico', async () => {
    render(<ThroughputChart data={createMockData('24h').throughput} period="24h" />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando gráfico')
    expect(await screen.findByRole('figure', { name: /Ingestão de eventos/ })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('o de severidade também carrega', async () => {
    renderWithProviders(<IncidentsBySeverityChart alerts={createMockData('24h').alerts} />)
    expect(await screen.findByRole('figure', { name: 'Alertas por severidade' })).toBeInTheDocument()
  })
})
