import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataStatus } from './DataStatus'

describe('DataStatus', () => {
  it('carregando: um único anúncio, sem aviso de erro', () => {
    render(<DataStatus status="loading" hasData={false} onRetry={() => {}} />)
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados…')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('a região de anúncio existe mesmo sem nada a anunciar, para os leitores de tela a acompanharem', () => {
    render(<DataStatus status="success" hasData onRetry={() => {}} />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('erro na primeira carga: um aviso com "Tentar novamente"', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn<() => void>()
    render(<DataStatus status="error" hasData={false} onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('erro numa recarga: avisa que os dados na tela são os anteriores', () => {
    render(<DataStatus status="error" hasData onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar os dados. Mostrando os dados anteriores.',
    )
  })

  it('"Tentar novamente" leva o foco ao início do conteúdo, em vez de deixá-lo cair no <body>', async () => {
    const user = userEvent.setup()
    render(
      <main id="conteudo" tabIndex={-1}>
        <DataStatus status="error" hasData={false} onRetry={() => {}} />
      </main>,
    )
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(screen.getByRole('main')).toHaveFocus()
  })
})
