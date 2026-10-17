import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Panel } from './Panel'

describe('Panel', () => {
  it('é uma região nomeada pelo título', () => {
    render(
      <Panel title="Ativos" status="success">
        conteúdo
      </Panel>,
    )
    expect(screen.getByRole('region', { name: 'Ativos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Ativos' })).toBeInTheDocument()
  })

  it('sucesso mostra o conteúdo', () => {
    render(
      <Panel title="Ativos" status="success">
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Ativos' })).not.toHaveAttribute('aria-busy')
  })

  it('carregando anuncia o estado e esconde o conteúdo', () => {
    render(
      <Panel title="Ativos" status="loading">
        conteúdo
      </Panel>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(screen.getByRole('region', { name: 'Ativos' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })

  it('vazio mostra a mensagem informada', () => {
    render(
      <Panel title="Ativos" status="empty" emptyMessage="Nenhum ativo encontrado.">
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('Nenhum ativo encontrado.')).toBeInTheDocument()
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })

  it('vazio sem mensagem usa o texto padrão', () => {
    render(
      <Panel title="Ativos" status="empty">
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('Nenhum dado para exibir.')).toBeInTheDocument()
  })

  it('erro anuncia a falha e "Tentar novamente" chama onRetry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn<() => void>()
    render(
      <Panel title="Ativos" status="error" onRetry={onRetry}>
        conteúdo
      </Panel>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar')
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('erro sem onRetry não mostra o botão', () => {
    render(
      <Panel title="Ativos" status="error">
        conteúdo
      </Panel>,
    )
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it('mostra descrição e ações no cabeçalho', () => {
    render(
      <Panel title="Ativos" description="Últimas 24 h" actions={<button type="button">Exportar</button>} status="success">
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('Últimas 24 h')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument()
  })

  it('as ações continuam disponíveis enquanto carrega', () => {
    render(
      <Panel title="Ativos" actions={<button type="button">Exportar</button>} status="loading">
        conteúdo
      </Panel>,
    )
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument()
  })

  it('dois painéis com o mesmo título têm ids de título distintos', () => {
    render(
      <>
        <Panel title="Ativos" status="success">
          a
        </Panel>
        <Panel title="Ativos" status="success">
          b
        </Panel>
      </>,
    )
    const [first, second] = screen.getAllByRole('region', { name: 'Ativos' })
    expect(first.getAttribute('aria-labelledby')).not.toBe(second.getAttribute('aria-labelledby'))
  })

  it('recarregando mantém o conteúdo esmaecido e marca a região como ocupada', () => {
    render(
      <Panel title="Ativos" status="success" refreshing>
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Ativos' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('panel-body')).toHaveClass('opacity-50')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('sem recarga, o conteúdo fica com opacidade normal', () => {
    render(
      <Panel title="Ativos" status="success">
        conteúdo
      </Panel>,
    )
    expect(screen.getByTestId('panel-body')).not.toHaveClass('opacity-50')
  })
})
