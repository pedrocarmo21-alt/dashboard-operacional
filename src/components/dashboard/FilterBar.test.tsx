import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFilters } from '@/hooks/filters'
import { renderWithProviders } from '@/test/render'
import { FilterBar } from './FilterBar'

function Probe() {
  const { period, severity, query } = useFilters()
  return <p data-testid="filters">{`${period}|${severity}|${query}`}</p>
}

function SetQuery() {
  const { setQuery } = useFilters()
  return (
    <button type="button" onClick={() => setQuery('norte')}>
      buscar
    </button>
  )
}

function setup(props: { showSeverity?: boolean } = {}) {
  return renderWithProviders(
    <>
      <FilterBar {...props} />
      <Probe />
      <SetQuery />
    </>,
  )
}

const filters = () => screen.getByTestId('filters')

describe('FilterBar', () => {
  it('o período começa em 24h, marcado', () => {
    setup()
    expect(screen.getByRole('radio', { name: 'Últimas 24 h' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Últimos 7 dias' })).toHaveAttribute('aria-checked', 'false')
  })

  it('os períodos formam um grupo nomeado', () => {
    setup()
    expect(screen.getByRole('radiogroup', { name: 'Período' })).toBeInTheDocument()
  })

  it('escolher um período atualiza o filtro', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: 'Últimos 7 dias' }))
    expect(filters()).toHaveTextContent('7d|all|')
    expect(screen.getByRole('radio', { name: 'Últimos 7 dias' })).toHaveAttribute('aria-checked', 'true')
  })

  it('clicar no período já marcado não o desmarca', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: 'Últimas 24 h' }))
    expect(filters()).toHaveTextContent('24h|all|')
    expect(screen.getByRole('radio', { name: 'Últimas 24 h' })).toHaveAttribute('aria-checked', 'true')
  })

  it('escolher uma severidade atualiza o filtro', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    await user.click(screen.getByRole('option', { name: 'Crítico' }))
    expect(filters()).toHaveTextContent('24h|critical|')
    expect(screen.getByRole('combobox', { name: 'Severidade' })).toHaveTextContent('Crítico')
  })

  it('a severidade oferece todas as opções na ordem', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Todas', 'Info', 'Aviso', 'Crítico'])
  })

  it('voltar para "Todas" remove o filtro de severidade', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    await user.click(screen.getByRole('option', { name: 'Aviso' }))
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    await user.click(screen.getByRole('option', { name: 'Todas' }))
    expect(filters()).toHaveTextContent('24h|all|')
  })

  it('showSeverity={false} esconde a severidade', () => {
    setup({ showSeverity: false })
    expect(screen.queryByRole('combobox', { name: 'Severidade' })).not.toBeInTheDocument()
  })

  it('"Limpar filtros" só aparece com filtro ativo', async () => {
    const { user } = setup()
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Últimos 30 dias' }))
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
  })

  it('"Limpar filtros" aparece também quando só a busca está ativa', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'buscar' }))
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
  })

  it('"Limpar filtros" restaura período, severidade e busca', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: 'Últimos 30 dias' }))
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    await user.click(screen.getByRole('option', { name: 'Info' }))
    await user.click(screen.getByRole('button', { name: 'buscar' }))
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(filters()).toHaveTextContent('24h|all|')
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
  })

  it('setas do teclado trocam o período', async () => {
    const { user } = setup()
    screen.getByRole('radio', { name: 'Últimas 24 h' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Últimos 7 dias' })).toHaveFocus()
  })
})
