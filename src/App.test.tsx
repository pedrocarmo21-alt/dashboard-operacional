import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMockData } from '@/data/mock'
import type { Fetcher } from '@/hooks/dashboard-data'
import { renderWithProviders } from '@/test/render'
import type { DashboardData } from '@/types/dashboard'
import App, { AppRoutes } from './App'

describe('App', () => {
  it('abre na visão geral', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).toBeInTheDocument()
  })
})

describe('rotas', () => {
  it.each([
    ['/', 'Visão geral'],
    ['/ativos', 'Ativos'],
    ['/alertas', 'Alertas'],
    ['/eventos', 'Eventos'],
  ])('%s mostra a seção %s', (route, title) => {
    renderWithProviders(<AppRoutes />, { route })
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it('navega para Alertas ao clicar no link da sidebar', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await user.click(screen.getByRole('link', { name: 'Alertas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Alertas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alertas' })).toHaveAttribute('aria-current', 'page')
  })

  it('rota desconhecida mostra a página 404 com caminho de volta', async () => {
    const { user } = renderWithProviders(<AppRoutes />, { route: '/nao-existe' })
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Voltar à visão geral' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).toBeInTheDocument()
  })

  it('a 404 mantém a navegação do shell', () => {
    renderWithProviders(<AppRoutes />, { route: '/nao-existe' })
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('tem link "Pular para o conteúdo" apontando para a área principal', () => {
    renderWithProviders(<AppRoutes />)
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(skip).toHaveAttribute('href', '#conteudo')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo')
  })

  it('o link de pular é o primeiro elemento focável', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await user.tab()
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus()
  })

  it('a área principal pode receber foco pelo link de pular', () => {
    renderWithProviders(<AppRoutes />)
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })

  it('o botão do menu mobile está no shell', () => {
    renderWithProviders(<AppRoutes />)
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument()
  })
})

describe('foco na troca de página', () => {
  it('navegar leva o foco ao título da nova página, para o leitor de tela anunciá-la', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await user.click(screen.getByRole('link', { name: 'Alertas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Alertas' })).toHaveFocus()
  })

  it('a primeira carga não move o foco', () => {
    renderWithProviders(<AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).not.toHaveFocus()
  })
})

describe('erro inesperado numa página', () => {
  it('fica dentro do shell: a navegação continua e trocar de rota limpa o erro', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // Uma página que quebra ao renderizar: dados com formato inesperado vindos da API.
    const broken: Fetcher = () => Promise.resolve({ ...createMockData('24h'), events: [null] } as unknown as DashboardData)
    const { user } = renderWithProviders(<AppRoutes />, { route: '/eventos', fetcher: broken })
    expect(await screen.findByText('Algo deu errado nesta página.')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ativos' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Ativos' })).toBeInTheDocument()
    expect(screen.queryByText('Algo deu errado nesta página.')).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
