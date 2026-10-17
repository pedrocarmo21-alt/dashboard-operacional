import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFilters } from '@/hooks/filters'
import { renderWithProviders } from '@/test/render'
import type { Alert, Severity } from '@/types/dashboard'
import { AlertsBySeverityChart } from './AlertsBySeverityChart'

const alert = (n: number, severity: Severity): Alert => ({
  id: `AL-${n}`,
  title: 't',
  severity,
  assetId: 'AT-0001',
  createdAt: '2026-10-16T12:00:00Z',
  acknowledged: false,
})

const alerts = [alert(1, 'critical'), alert(2, 'critical'), alert(3, 'warning'), alert(4, 'info'), alert(5, 'info'), alert(6, 'info')]

function SeverityProbe() {
  return <p data-testid="severity">{useFilters().severity}</p>
}

function setup(list: Alert[] = alerts) {
  return renderWithProviders(
    <>
      <AlertsBySeverityChart alerts={list} />
      <SeverityProbe />
    </>,
  )
}

describe('AlertsBySeverityChart', () => {
  it('é uma figura nomeada', () => {
    setup()
    expect(screen.getByRole('figure', { name: 'Alertas por severidade' })).toBeInTheDocument()
  })

  it('lista cada severidade com a contagem, da mais grave para a mais leve', () => {
    setup()
    const buttons = screen.getAllByRole('button', { name: /^(Crítico|Aviso|Info): \d+$/ })
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Crítico: 2', 'Aviso: 1', 'Info: 3'])
  })

  it('clicar numa severidade filtra por ela e marca o botão', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Crítico: 2' }))
    expect(screen.getByTestId('severity')).toHaveTextContent('critical')
    expect(screen.getByRole('button', { name: 'Crítico: 2' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Aviso: 1' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicar de novo na mesma severidade remove o filtro', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Crítico: 2' }))
    await user.click(screen.getByRole('button', { name: 'Crítico: 2' }))
    expect(screen.getByTestId('severity')).toHaveTextContent('all')
  })

  it('trocar de severidade troca o filtro', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Crítico: 2' }))
    await user.click(screen.getByRole('button', { name: 'Info: 3' }))
    expect(screen.getByTestId('severity')).toHaveTextContent('info')
  })

  it('os botões formam um grupo de filtro nomeado', () => {
    setup()
    expect(screen.getByRole('group', { name: 'Filtrar por severidade' })).toBeInTheDocument()
  })

  it('clicar numa barra também filtra', () => {
    const { container } = setup()
    const bars = container.querySelectorAll('.recharts-bar-rectangle')
    expect(bars).toHaveLength(3)
    fireEvent.click(bars[0])
    expect(screen.getByTestId('severity')).toHaveTextContent('critical')
  })

  it('desenha o gráfico escondido de leitores de tela, sem foco escondido', () => {
    setup()
    const chart = screen.getByTestId('severity-chart')
    expect(chart).toHaveAttribute('aria-hidden', 'true')
    expect(chart.querySelector('[tabindex]:not([tabindex="-1"])')).toBeNull()
  })

  it('sem alertas, avisa em vez de desenhar', () => {
    setup([])
    expect(screen.getByText('Nenhum alerta no período.')).toBeInTheDocument()
    expect(screen.queryByTestId('severity-chart')).not.toBeInTheDocument()
  })

  it('o gráfico conta todos os alertas do período, e diz isso', () => {
    setup()
    expect(screen.getByText('Todos os alertas do período, sem a busca.')).toBeInTheDocument()
  })
})
