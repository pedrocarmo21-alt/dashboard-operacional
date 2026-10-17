import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import { renderWithProviders } from '@/test/render'
import { AssetsTable } from './AssetsTable'

const assets = createMockData('24h').assets
const NOW = new Date('2026-10-16T12:00:00Z')

const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
const column = (name: string) => screen.getByRole('columnheader', { name })

function setup(props: Partial<Parameters<typeof AssetsTable>[0]> = {}) {
  return renderWithProviders(<AssetsTable assets={assets} query="" now={NOW} {...props} />)
}

describe('AssetsTable', () => {
  it('mostra uma linha por ativo, com as colunas na ordem', () => {
    setup()
    expect(bodyRows()).toHaveLength(40)
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Ativo',
      'Tipo',
      'Região',
      'Status',
      'Latência',
      'Visto',
    ])
  })

  it('a tabela tem um nome acessível', () => {
    setup()
    expect(screen.getByRole('table', { name: 'Ativos' })).toBeInTheDocument()
  })

  it('por padrão, ordena por status: problemas primeiro', () => {
    setup()
    expect(column('Status')).toHaveAttribute('aria-sort', 'ascending')
    expect(bodyRows()[0]).toHaveTextContent('Offline')
  })

  it('só a coluna ordenada tem aria-sort', () => {
    setup()
    expect(column('Latência')).not.toHaveAttribute('aria-sort')
  })

  it('ordena por latência e inverte no segundo clique', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Latência' }))
    expect(column('Latência')).toHaveAttribute('aria-sort', 'ascending')
    expect(column('Status')).not.toHaveAttribute('aria-sort')
    const min = Math.min(...assets.map((a) => a.latencyMs))
    expect(bodyRows()[0]).toHaveTextContent(`${min}`)

    await user.click(screen.getByRole('button', { name: 'Latência' }))
    expect(column('Latência')).toHaveAttribute('aria-sort', 'descending')
  })

  it('filtra por status pelo grupo de opções', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /^Offline/ }))
    expect(bodyRows()).toHaveLength(2)
    expect(bodyRows().every((r) => within(r).queryByText('Offline'))).toBe(true)
  })

  it('cada opção de status mostra quantos ativos tem', () => {
    setup()
    expect(screen.getByRole('radio', { name: 'Todos: 40' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Online: 32' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Degradado: 6' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Offline: 2' })).toBeInTheDocument()
  })

  it('a busca filtra as linhas, ignorando acento', () => {
    setup({ query: 'ESTACAO' })
    expect(bodyRows().length).toBeGreaterThan(0)
    expect(bodyRows().every((r) => r.textContent?.includes('Estação'))).toBe(true)
  })

  it('sem correspondência, mostra estado vazio sem quebrar', () => {
    setup({ query: 'zzz' })
    expect(screen.getByText('Nenhum ativo corresponde aos filtros.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('com limite, mostra só as primeiras linhas e um link para ver todos', () => {
    setup({ limit: 8 })
    expect(bodyRows()).toHaveLength(8)
    expect(screen.getByRole('link', { name: 'Ver todos os 40 ativos' })).toHaveAttribute('href', '/ativos')
  })

  it('o link conta os ativos filtrados', () => {
    setup({ limit: 3, query: 'sensor' })
    const sensors = assets.filter((a) => a.type === 'sensor').length
    expect(screen.getByRole('link', { name: `Ver todos os ${sensors} ativos` })).toBeInTheDocument()
  })

  it('sem link quando tudo cabe no limite', () => {
    setup({ limit: 8, query: 'at-0001' })
    expect(screen.queryByRole('link', { name: /^Ver todos/ })).not.toBeInTheDocument()
  })

  it('mostra tempo relativo, com a data completa no elemento <time>', () => {
    setup()
    const time = bodyRows()[0].querySelector('time')!
    expect(time).toHaveAttribute('datetime')
    expect(time.textContent).toMatch(/^(agora|há \d+ (min|h|d))$/)
  })

  it('rola na horizontal dentro do próprio painel em telas estreitas', () => {
    setup()
    const table = screen.getByRole('table')
    expect(table).toHaveClass('min-w-[640px]')
    expect(table.parentElement).toHaveClass('overflow-x-auto')
  })

  it('status leva rótulo em texto, não só cor', () => {
    setup()
    expect(within(bodyRows()[0]).getByText('Offline')).toBeInTheDocument()
  })
})
