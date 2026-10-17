import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('quebrou')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sem erro, mostra os filhos', () => {
    render(
      <ErrorBoundary fallback={<p>falhou</p>}>
        <p>ok</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('com erro, mostra o fallback no lugar dos filhos', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary fallback={<p>falhou</p>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('falhou')).toBeInTheDocument()
  })

  it('uma nova resetKey limpa o erro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(
      <ErrorBoundary fallback={<p>falhou</p>} resetKey="/a">
        <Boom />
      </ErrorBoundary>,
    )
    rerender(
      <ErrorBoundary fallback={<p>falhou</p>} resetKey="/b">
        <p>outra página</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('outra página')).toBeInTheDocument()
  })
})
