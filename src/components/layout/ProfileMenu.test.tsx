import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Toaster } from '@/components/ui/sonner'
import { ProfileMenu } from './ProfileMenu'

function setup() {
  const user = userEvent.setup()
  render(
    <>
      <ProfileMenu />
      <Toaster />
    </>,
  )
  return { user }
}

describe('ProfileMenu', () => {
  it('mostra quem está operando e o turno', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
    expect(screen.getByRole('menu')).toHaveTextContent('Operador')
    expect(screen.getByRole('menu')).toHaveTextContent('Turno A')
  })

  it('lista os atalhos de teclado', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
    expect(screen.getByRole('menu')).toHaveTextContent('Focar a busca')
    expect(screen.getByRole('menu')).toHaveTextContent('/')
  })

  it('"Sair" avisa que a autenticação é de demonstração', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
    await user.click(screen.getByRole('menuitem', { name: 'Sair' }))
    expect(await screen.findByText('Demonstração: autenticação não configurada.')).toBeInTheDocument()
  })

  it('abre pelo teclado', async () => {
    const { user } = setup()
    screen.getByRole('button', { name: 'Menu do perfil' }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})
