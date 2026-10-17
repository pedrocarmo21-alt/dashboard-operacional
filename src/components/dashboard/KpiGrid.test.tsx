import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createMockData } from '@/data/mock'
import { KpiGrid } from './KpiGrid'

const kpis = createMockData('24h').kpis

describe('KpiGrid', () => {
  it('é uma região "Indicadores" com um card por KPI, na ordem', () => {
    render(<KpiGrid kpis={kpis} status="success" />)
    expect(screen.getByRole('region', { name: 'Indicadores' })).toBeInTheDocument()
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual([
      'Ativos online',
      'Incidentes abertos',
      'Latência média',
      'Taxa de ingestão',
    ])
  })

  it('carregando mostra 4 esqueletos e anuncia uma vez', () => {
    render(<KpiGrid kpis={[]} status="loading" />)
    expect(screen.getAllByTestId('kpi-skeleton')).toHaveLength(4)
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando indicadores')
    expect(screen.getByRole('region', { name: 'Indicadores' })).toHaveAttribute('aria-busy', 'true')
  })

  it('carregando não mostra KPIs antigos', () => {
    render(<KpiGrid kpis={kpis} status="loading" />)
    expect(screen.queryByRole('term')).not.toBeInTheDocument()
  })

  it('vazio avisa que não há indicadores', () => {
    render(<KpiGrid kpis={[]} status="empty" />)
    expect(screen.getByText('Sem indicadores para o período.')).toBeInTheDocument()
  })

  it('erro avisa e permite tentar de novo', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn<() => void>()
    render(<KpiGrid kpis={[]} status="error" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os indicadores.')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
