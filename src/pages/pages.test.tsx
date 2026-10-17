import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '@/App'
import type { Fetcher } from '@/hooks/dashboard-data'
import { okFetcher } from '@/test/fetchers'
import { renderWithProviders } from '@/test/render'

describe.each([
  ['/', 'Visão geral'],
  ['/ativos', 'Ativos'],
  ['/alertas', 'Alertas'],
  ['/eventos', 'Eventos'],
])('página %s', (route, title) => {
  it(`tem h1 "${title}" e título de aba próprio`, async () => {
    renderWithProviders(<AppRoutes />, { route })
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(document.title).toBe(`${title} · Dashboard Operacional`)
    // Espera os dados chegarem, para o teste não terminar com atualizações pendentes.
    await waitFor(() => expect(screen.getByTestId('system-status')).not.toHaveAttribute('data-signal', 'unknown'))
  })
})

describe('página de ativos', () => {
  it('mostra a tabela completa, sem barra de período', async () => {
    renderWithProviders(<AppRoutes />, { route: '/ativos' })
    const table = await screen.findByRole('table', { name: 'Ativos' })
    expect(within(table).getAllByRole('row')).toHaveLength(41)
    expect(screen.queryByRole('radiogroup', { name: 'Período' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Ver todos/ })).not.toBeInTheDocument()
  })
})

describe('página de alertas', () => {
  it('mostra todos os alertas e a barra de filtros', async () => {
    renderWithProviders(<AppRoutes />, { route: '/alertas' })
    const list = await screen.findByRole('list', { name: 'Alertas' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(12)
    expect(screen.getByRole('combobox', { name: 'Severidade' })).toBeInTheDocument()
  })

  it('reconhecer na página atualiza o contador do sino', async () => {
    const { user } = renderWithProviders(<AppRoutes />, { route: '/alertas' })
    const list = await screen.findByRole('list', { name: 'Alertas' })
    const bell = screen.getByRole('button', { name: /^Notificações, \d+ pendentes?$/ })
    const before = Number(bell.getAttribute('aria-label')!.match(/\d+/)![0])
    await user.click(within(list).getAllByRole('button', { name: /^Reconhecer alerta/ })[0])
    expect(bell).toHaveAccessibleName(
      before - 1 === 1 ? 'Notificações, 1 pendente' : `Notificações, ${before - 1} pendentes`,
    )
  })
})

describe('página de eventos', () => {
  it('mostra todos os eventos e a barra de filtros', async () => {
    renderWithProviders(<AppRoutes />, { route: '/eventos' })
    const list = await screen.findByRole('list', { name: 'Eventos' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(25)
    expect(screen.getByRole('radiogroup', { name: 'Período' })).toBeInTheDocument()
  })
})

describe('erro na primeira carga, com o app inteiro', () => {
  it('o status do sistema diz "Indisponível", não "Verificando…"', async () => {
    renderWithProviders(<AppRoutes />, { fetcher: () => Promise.reject(new Error('x')) })
    await screen.findByRole('alert')
    expect(within(screen.getByTestId('system-status')).getByText('Indisponível')).toBeInTheDocument()
  })

  it('"Tentar novamente" leva o foco à área principal', async () => {
    const fetcher = vi.fn<Fetcher>().mockRejectedValueOnce(new Error('x')).mockImplementation(okFetcher)
    const { user } = renderWithProviders(<AppRoutes />, { fetcher })
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
    expect(screen.getByRole('main')).toHaveFocus()
  })
})
