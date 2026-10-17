import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import { KpiGrid } from './KpiGrid'

const kpis = createMockData('24h').kpis

describe('KpiGrid', () => {
  it('é uma região "Indicadores" com um card por KPI, na ordem', () => {
    render(<KpiGrid kpis={kpis} status="success" />)
    expect(screen.getByRole('region', { name: 'Indicadores' })).toBeInTheDocument()
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual([
      'Ativos online',
      'Alertas pendentes',
      'Latência média',
      'Taxa de ingestão',
    ])
  })

  it('carregando mostra 4 esqueletos, sem anúncio próprio', () => {
    render(<KpiGrid kpis={[]} status="loading" />)
    expect(screen.getAllByTestId('kpi-skeleton')).toHaveLength(4)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
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

  it('erro mostra texto estático, sem alerta nem botão', () => {
    render(<KpiGrid kpis={[]} status="error" />)
    expect(screen.getByText('Indicadores indisponíveis.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('desatualizado mantém os KPIs esmaecidos, sem marcar como ocupado', () => {
    render(<KpiGrid kpis={kpis} status="success" stale />)
    expect(screen.getAllByRole('term')).toHaveLength(4)
    expect(screen.getByTestId('kpi-grid')).toHaveClass('opacity-50')
    expect(screen.getByRole('region', { name: 'Indicadores' })).not.toHaveAttribute('aria-busy')
  })

  it('recarregando mantém os KPIs esmaecidos, sem esqueleto', () => {
    render(<KpiGrid kpis={kpis} status="success" refreshing />)
    expect(screen.getAllByRole('term')).toHaveLength(4)
    expect(screen.queryByTestId('kpi-skeleton')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Indicadores' })).toHaveAttribute('aria-busy', 'true')
  })
})
