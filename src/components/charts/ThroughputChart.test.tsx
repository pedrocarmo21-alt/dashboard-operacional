import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import { formatDateTime, formatNumber } from '@/lib/format'
import { ThroughputChart } from './ThroughputChart'

const points = createMockData('24h').throughput
const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')

describe('ThroughputChart', () => {
  it('é uma figura nomeada pelo que mostra e pelo período', () => {
    render(<ThroughputChart data={points} period="24h" />)
    expect(screen.getByRole('figure', { name: 'Ingestão de eventos por segundo, últimas 24 h' })).toBeInTheDocument()
  })

  it('o nome acompanha o período', () => {
    render(<ThroughputChart data={createMockData('7d').throughput} period="7d" />)
    expect(screen.getByRole('figure', { name: 'Ingestão de eventos por segundo, últimos 7 dias' })).toBeInTheDocument()
  })

  it('resume mínimo, média e máximo em texto', () => {
    const values = points.map((p) => p.eventsPerSec)
    render(<ThroughputChart data={points} period="24h" />)
    const summary = norm(screen.getByTestId('throughput-summary').textContent)
    expect(summary).toContain(`Mín. ${formatNumber(Math.min(...values))} ev/s`)
    expect(summary).toContain(`Máx. ${formatNumber(Math.max(...values))} ev/s`)
    expect(summary).toMatch(/Média [\d.]+ ev\/s/)
  })

  it('desenha o gráfico, escondido de leitores de tela', () => {
    const { container } = render(<ThroughputChart data={points} period="24h" />)
    const chart = screen.getByTestId('throughput-chart')
    expect(chart).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
  })

  it('o gráfico não cria foco de teclado escondido', () => {
    render(<ThroughputChart data={points} period="24h" />)
    expect(within(screen.getByTestId('throughput-chart')).queryAllByRole('application')).toHaveLength(0)
    expect(screen.getByTestId('throughput-chart').querySelector('[tabindex]:not([tabindex="-1"])')).toBeNull()
  })

  it('alterna para uma tabela com todos os pontos e volta', async () => {
    const user = userEvent.setup()
    render(<ThroughputChart data={points} period="24h" />)
    await user.click(screen.getByRole('button', { name: 'Ver como tabela' }))

    const table = screen.getByRole('table', { name: 'Ingestão de eventos por segundo, últimas 24 h' })
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(points.length + 1)
    expect(within(rows[1]).getAllByRole('cell').map((c) => norm(c.textContent))).toEqual([
      norm(formatDateTime(points[0].timestamp)),
      formatNumber(points[0].eventsPerSec),
    ])
    expect(screen.queryByTestId('throughput-chart')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver como gráfico' }))
    expect(screen.getByTestId('throughput-chart')).toBeInTheDocument()
  })

  it('a tabela rola pelo teclado: a área de rolagem recebe foco e tem nome', async () => {
    const user = userEvent.setup()
    render(<ThroughputChart data={points} period="24h" />)
    await user.click(screen.getByRole('button', { name: 'Ver como tabela' }))
    const scroller = screen.getByRole('region', { name: 'Ingestão de eventos por segundo, últimas 24 h' })
    expect(scroller).toHaveAttribute('tabindex', '0')
    expect(scroller).toContainElement(screen.getByRole('table'))
  })

  it('sem pontos, avisa em vez de desenhar', () => {
    render(<ThroughputChart data={[]} period="24h" />)
    expect(screen.getByText('Sem dados de ingestão no período.')).toBeInTheDocument()
    expect(screen.queryByTestId('throughput-chart')).not.toBeInTheDocument()
  })
})
