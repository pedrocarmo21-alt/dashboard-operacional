import { screen, waitFor, within } from '@testing-library/react'
import { useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import type { Fetcher } from '@/hooks/dashboard-data'
import { renderWithProviders } from '@/test/render'
import type { Alert } from '@/types/dashboard'
import { NotificationsMenu } from './NotificationsMenu'

const NOW = '2026-10-16T12:00:00Z'

const alert = (n: number, overrides: Partial<Alert> = {}): Alert => ({
  id: `AL-T-${n}`,
  title: `Alerta ${n}`,
  severity: 'warning',
  assetId: 'AT-0001',
  createdAt: new Date(Date.parse(NOW) - n * 60_000).toISOString(),
  acknowledged: false,
  ...overrides,
})

function fetcherWith(alerts: Alert[]): Fetcher {
  return (period) => Promise.resolve({ ...createMockData(period), generatedAt: NOW, alerts })
}

function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

function setup(alerts: Alert[]) {
  return renderWithProviders(
    <>
      <NotificationsMenu />
      <Location />
    </>,
    { fetcher: fetcherWith(alerts) },
  )
}

const trigger = () => screen.getByRole('button', { name: /^Notificações/ })

describe('NotificationsMenu', () => {
  it('o botão diz quantos alertas estão pendentes', async () => {
    setup([alert(1), alert(2), alert(3), alert(4, { acknowledged: true })])
    expect(await screen.findByRole('button', { name: 'Notificações, 3 não lidas' })).toBeInTheDocument()
  })

  it('singular com um alerta pendente', async () => {
    setup([alert(1)])
    expect(await screen.findByRole('button', { name: 'Notificações, 1 não lida' })).toBeInTheDocument()
  })

  it('sem pendentes, o botão não mostra contador', async () => {
    setup([alert(1, { acknowledged: true })])
    expect(await screen.findByRole('button', { name: 'Notificações, nenhuma não lida' })).toBeInTheDocument()
    expect(screen.queryByTestId('notifications-count')).not.toBeInTheDocument()
  })

  it('o contador visível para em 9+', async () => {
    setup(Array.from({ length: 12 }, (_, i) => alert(i + 1)))
    expect(await screen.findByTestId('notifications-count')).toHaveTextContent('9+')
  })

  it('lista os 5 pendentes mais recentes com tempo relativo', async () => {
    const { user } = setup(Array.from({ length: 7 }, (_, i) => alert(i + 1)))
    await user.click(await screen.findByRole('button', { name: 'Notificações, 7 não lidas' }))
    const items = within(screen.getByRole('list', { name: 'Alertas pendentes' })).getAllByRole('listitem')
    expect(items).toHaveLength(5)
    expect(items[0]).toHaveTextContent('Alerta 1')
    expect(items[0]).toHaveTextContent('há 1 min')
    expect(items[4]).toHaveTextContent('Alerta 5')
  })

  it('não lista alertas já reconhecidos', async () => {
    const { user } = setup([alert(1), alert(2, { acknowledged: true, title: 'Já visto' })])
    await user.click(await screen.findByRole('button', { name: 'Notificações, 1 não lida' }))
    expect(screen.queryByText('Já visto')).not.toBeInTheDocument()
  })

  it('reconhecer tira o alerta da lista e atualiza o contador', async () => {
    const { user } = setup([alert(1), alert(2), alert(3)])
    await user.click(await screen.findByRole('button', { name: 'Notificações, 3 não lidas' }))
    await user.click(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 1 (AT-0001)' }))
    expect(screen.queryByText('Alerta 1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notificações, 2 não lidas' })).toBeInTheDocument()
  })

  it('depois de reconhecer, o foco vai para o próximo alerta, com o menu aberto', async () => {
    const { user } = setup([alert(1), alert(2)])
    await user.click(await screen.findByRole('button', { name: 'Notificações, 2 não lidas' }))
    await user.click(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 1 (AT-0001)' }))
    expect(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 2 (AT-0001)' })).toHaveFocus()
    expect(screen.getByRole('list', { name: 'Alertas pendentes' })).toBeInTheDocument()
  })

  it('reconhecendo o último, o foco vai para "Ver todos os alertas"', async () => {
    const { user } = setup([alert(1)])
    await user.click(await screen.findByRole('button', { name: 'Notificações, 1 não lida' }))
    await user.click(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 1 (AT-0001)' }))
    expect(screen.getByRole('link', { name: 'Ver todos os alertas' })).toHaveFocus()
    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument()
  })

  it('"Ver todos os alertas" navega para /alertas e fecha o menu', async () => {
    const { user } = setup([alert(1)])
    await user.click(await screen.findByRole('button', { name: /^Notificações, 1/ }))
    await user.click(screen.getByRole('link', { name: 'Ver todos os alertas' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/alertas')
    await waitFor(() => expect(screen.queryByRole('list', { name: 'Alertas pendentes' })).not.toBeInTheDocument())
  })

  it('sem alertas pendentes mostra "Nenhuma notificação"', async () => {
    const { user } = setup([])
    await user.click(await screen.findByRole('button', { name: 'Notificações, nenhuma não lida' }))
    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument()
  })

  it('enquanto carrega, o botão existe e o menu avisa', async () => {
    const { user } = renderWithProviders(<NotificationsMenu />, { fetcher: () => new Promise(() => {}) })
    expect(trigger()).toHaveAccessibleName('Notificações')
    await user.click(trigger())
    expect(screen.getByText('Carregando…')).toBeInTheDocument()
  })

  it('com erro, o menu avisa', async () => {
    const { user } = renderWithProviders(<NotificationsMenu />, { fetcher: () => Promise.reject(new Error('x')) })
    await waitFor(() => expect(trigger()).toHaveAccessibleName('Notificações'))
    await user.click(trigger())
    expect(await screen.findByText('Não foi possível carregar as notificações.')).toBeInTheDocument()
  })
})
