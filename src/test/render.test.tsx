import { screen, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { useDashboardData } from '@/hooks/dashboard-data'
import type { Fetcher } from '@/hooks/dashboard-data'
import { useFilters } from '@/hooks/filters'
import { renderWithProviders } from './render'

function Probe() {
  const { pathname } = useLocation()
  const { period } = useFilters()
  const { status, data } = useDashboardData()
  return (
    <p>
      {pathname} {period} {status} {data?.assets.length ?? 0}
    </p>
  )
}

describe('renderWithProviders', () => {
  it('fornece rota, filtros e dados fictícios', async () => {
    renderWithProviders(<Probe />, { route: '/ativos' })
    expect(await screen.findByText('/ativos 24h success 40')).toBeInTheDocument()
  })

  it('usa "/" como rota padrão', async () => {
    renderWithProviders(<Probe />)
    expect(await screen.findByText(/^\/ 24h/)).toBeInTheDocument()
  })

  it('aceita um fetcher próprio', async () => {
    const fetcher = vi.fn<Fetcher>().mockRejectedValue(new Error('x'))
    renderWithProviders(<Probe />, { fetcher })
    await waitFor(() => expect(screen.getByText(/error/)).toBeInTheDocument())
  })

  it('devolve um user do user-event', () => {
    const { user } = renderWithProviders(<Probe />)
    expect(user.click).toBeTypeOf('function')
  })
})
