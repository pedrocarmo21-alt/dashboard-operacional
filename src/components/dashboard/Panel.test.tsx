import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

  it('carregando marca a região como ocupada, mostra esqueleto e esconde o conteúdo', () => {
    render(
      <Panel title="Ativos" status="loading">
        conteúdo
      </Panel>,
    )
    expect(screen.getByRole('region', { name: 'Ativos' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('panel-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })

  it('carregando não faz anúncio próprio (a página anuncia uma vez só)', () => {
    render(
      <Panel title="Ativos" status="loading">
        conteúdo
      </Panel>,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
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

  it('erro mostra texto estático, sem alerta nem botão (a página tem o aviso único)', () => {
    render(
      <Panel title="Ativos" status="error">
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('Dados indisponíveis.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })

  it('desatualizado mantém o conteúdo esmaecido, sem marcar como ocupado', () => {
    render(
      <Panel title="Ativos" status="success" stale>
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
    expect(screen.getByTestId('panel-body')).toHaveClass('opacity-50')
    expect(screen.getByRole('region', { name: 'Ativos' })).not.toHaveAttribute('aria-busy')
  })

  it('mostra a descrição no cabeçalho', () => {
    render(
      <Panel title="Ativos" description="Últimas 24 h" status="success">
        conteúdo
      </Panel>,
    )
    expect(screen.getByText('Últimas 24 h')).toBeInTheDocument()
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
