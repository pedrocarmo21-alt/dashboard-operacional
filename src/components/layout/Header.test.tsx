import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFilters } from '@/hooks/filters'
import { renderWithProviders } from '@/test/render'
import { Header } from './Header'

function QueryProbe() {
  return <p data-testid="query">{useFilters().query}</p>
}

function setup() {
  return renderWithProviders(
    <>
      <Header />
      <QueryProbe />
      <button type="button">outro</button>
    </>,
  )
}

const search = () => screen.getByRole('searchbox', { name: 'Buscar ativos, alertas e eventos' })

describe('Header', () => {
  it('a busca atualiza o filtro global', async () => {
    const { user } = setup()
    await user.type(search(), 'norte')
    expect(screen.getByTestId('query')).toHaveTextContent('norte')
  })

  it('a busca mostra o valor atual do filtro', async () => {
    const { user } = setup()
    await user.type(search(), 'sul')
    expect(search()).toHaveValue('sul')
  })

  it('"/" foca a busca sem digitar a barra', async () => {
    const { user } = setup()
    screen.getByRole('button', { name: 'outro' }).focus()
    await user.keyboard('/')
    expect(search()).toHaveFocus()
    expect(search()).toHaveValue('')
  })

  it('"/" dentro da busca é digitado normalmente', async () => {
    const { user } = setup()
    await user.type(search(), 'a/b')
    expect(search()).toHaveValue('a/b')
  })

  it('Esc na busca limpa o texto', async () => {
    const { user } = setup()
    await user.type(search(), 'norte')
    await user.keyboard('{Escape}')
    expect(search()).toHaveValue('')
    expect(screen.getByTestId('query')).toHaveTextContent('')
  })

  it('reúne status do sistema, notificações, perfil e menu mobile', async () => {
    setup()
    expect(screen.getByTestId('system-status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Notificações/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu do perfil' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument()
    expect(await screen.findByText('Degradado')).toBeInTheDocument()
  })

  it('é o banner da página', () => {
    setup()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
