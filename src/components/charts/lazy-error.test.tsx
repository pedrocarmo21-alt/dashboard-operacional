import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockData } from '@/data/mock'
import { LAZY_CHART } from '@/test/timeouts'
import { ThroughputChart } from './lazy'

// Simula a falha do import() sob demanda (rede instável, ou deploy novo com a aba aberta).
vi.mock('./ThroughputChart', () => {
  throw new Error('Failed to fetch dynamically imported module')
})

describe('gráfico sob demanda que não carrega', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra o erro dentro do painel, sem derrubar o resto da tela', async () => {
    // O React registra no console o erro capturado pelo boundary; aqui ele é esperado.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <p>resto da tela</p>
        <ThroughputChart data={createMockData('24h').throughput} period="24h" />
      </>,
    )
    expect(await screen.findByText('Não foi possível carregar o gráfico.', {}, LAZY_CHART)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recarregar a página' })).toBeInTheDocument()
    expect(screen.getByText('resto da tela')).toBeInTheDocument()
  })
})
