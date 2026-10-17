import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import App, { AppRoutes } from './App'
import { emptyData } from './test/fetchers'
import { renderWithProviders } from './test/render'
import { LAZY_CHART } from './test/timeouts'

// O jsdom não calcula cores; o contraste é verificado pelos testes de tema (theme.test.ts).
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false } } }

async function dataLoaded() {
  await waitFor(() => expect(screen.getByTestId('system-status')).not.toHaveAttribute('data-signal', 'unknown'))
}

describe('acessibilidade (axe)', () => {
  it.each(['/', '/ativos', '/alertas', '/eventos', '/nao-existe'])('%s com dados, sem violações', async (route) => {
    const { container } = renderWithProviders(<AppRoutes />, { route })
    await dataLoaded()
    if (route === '/') {
      // Os gráficos carregam sob demanda; a análise precisa deles já desenhados.
      await screen.findByRole('figure', { name: /Ingestão de eventos/ }, LAZY_CHART)
      await screen.findByRole('figure', { name: 'Alertas por severidade' }, LAZY_CHART)
    }
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    // O mais pesado da suíte (dados, import do Recharts, gráficos e axe na página inteira):
    // sob carga da máquina chegou a passar dos 15 s padrão.
  }, 30_000)

  it('carregando, sem violações', async () => {
    const { container } = renderWithProviders(<AppRoutes />, { fetcher: () => new Promise(() => {}) })
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('erro, sem violações', async () => {
    const { container } = renderWithProviders(<AppRoutes />, { fetcher: () => Promise.reject(new Error('x')) })
    await screen.findAllByRole('button', { name: 'Tentar novamente' })
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('vazio, sem violações', async () => {
    const { container } = renderWithProviders(<AppRoutes />, { fetcher: (p) => Promise.resolve(emptyData(p)) })
    await screen.findByText('Sem indicadores para o período.')
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('tabela de ingestão aberta, sem violações', async () => {
    const { container, user } = renderWithProviders(<AppRoutes />)
    await dataLoaded()
    await user.click(await screen.findByRole('button', { name: 'Ver como tabela' }, LAZY_CHART))
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  // Menus abrem em portais, fora do contêiner: a análise é feita no <body> inteiro.
  it('menu de notificações aberto, sem violações', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await dataLoaded()
    await user.click(screen.getByRole('button', { name: /^Notificações/ }))
    await screen.findByRole('list', { name: 'Alertas pendentes' })
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('menu do perfil aberto, sem violações', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await dataLoaded()
    await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
    await screen.findByRole('menu')
    // O Radix põe o menu num portal direto no <body>, fora dos landmarks, como é padrão para
    // sobreposições temporárias. A regra "region" é de boas práticas, não do WCAG.
    const options = { rules: { ...AXE_OPTIONS.rules, region: { enabled: false } } }
    expect(await axe(document.body, options)).toHaveNoViolations()
  })

  it('menu mobile aberto, sem violações', async () => {
    const { user } = renderWithProviders(<AppRoutes />)
    await dataLoaded()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await screen.findByRole('dialog', { name: 'Navegação' })
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('o App real (BrowserRouter e API simulada) monta sem violações', async () => {
    const { container } = render(<App />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })
})
