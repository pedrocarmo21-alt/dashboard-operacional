import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  afterEach(() => {
    document.title = ''
  })

  it('mostra o título como h1', () => {
    render(<PageHeader title="Alertas" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Alertas' })).toBeInTheDocument()
  })

  it('atualiza o título da aba do navegador', () => {
    render(<PageHeader title="Alertas" />)
    expect(document.title).toBe('Alertas · Dashboard Operacional')
  })

  it('mostra os controles ao lado do título', () => {
    render(
      <PageHeader title="Alertas">
        <button type="button">filtro</button>
      </PageHeader>,
    )
    expect(screen.getByRole('button', { name: 'filtro' })).toBeInTheDocument()
  })
})
