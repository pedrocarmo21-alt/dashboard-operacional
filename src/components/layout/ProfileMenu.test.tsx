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

  it('"Atalhos de teclado" é um item alcançável e mostra a lista', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
    const item = screen.getByRole('menuitem', { name: 'Atalhos de teclado' })
    expect(item).not.toHaveAttribute('aria-disabled')
    await user.click(item)
    expect(await screen.findByText('/ foca a busca · Esc limpa a busca e fecha menus')).toBeInTheDocument()
  })

  it('todos os itens do menu são alcançáveis (nenhum desabilitado)', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
    for (const item of screen.getAllByRole('menuitem')) expect(item).not.toHaveAttribute('aria-disabled')
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
