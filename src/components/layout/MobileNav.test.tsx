import { screen, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { MobileNav } from './MobileNav'

function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

function setup(route = '/') {
  return renderWithProviders(
    <>
      <MobileNav />
      <Location />
    </>,
    { route },
  )
}

describe('MobileNav', () => {
  it('começa fechado', () => {
    setup()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre com o botão e mostra as seções', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = screen.getByRole('dialog', { name: 'Navegação' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alertas' })).toBeInTheDocument()
  })

  it('Esc fecha o menu e devolve o foco ao botão', async () => {
    const { user } = setup()
    const trigger = screen.getByRole('button', { name: 'Abrir menu' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('escolher um destino navega e fecha o menu', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(screen.getByRole('link', { name: 'Alertas' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/alertas')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('o botão "Fechar" fecha o menu', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('marca a seção atual dentro do menu', async () => {
    const { user } = setup('/eventos')
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('link', { name: 'Eventos' })).toHaveAttribute('aria-current', 'page')
  })
})
