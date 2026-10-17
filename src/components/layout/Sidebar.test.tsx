import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('é a navegação principal', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('lista as quatro seções na ordem, com seus endereços', () => {
    renderWithProviders(<Sidebar />)
    const links = within(screen.getByRole('navigation', { name: 'Principal' })).getAllByRole('link')
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Visão geral', '/'],
      ['Ativos', '/ativos'],
      ['Alertas', '/alertas'],
      ['Eventos', '/eventos'],
    ])
  })

  it('marca a seção atual com aria-current', () => {
    renderWithProviders(<Sidebar />, { route: '/ativos' })
    expect(screen.getByRole('link', { name: 'Ativos' })).toHaveAttribute('aria-current', 'page')
  })

  it('"Visão geral" só fica ativa na raiz, não em outras seções', () => {
    renderWithProviders(<Sidebar />, { route: '/ativos' })
    expect(screen.getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current')
  })

  it('"Visão geral" fica ativa na raiz', () => {
    renderWithProviders(<Sidebar />, { route: '/' })
    expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute('aria-current', 'page')
  })

  it('mostra o nome do produto', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('Dashboard Operacional')).toBeInTheDocument()
  })
})
