import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockData } from '@/data/mock'
import type { ActivityEvent } from '@/types/dashboard'
import { ActivityFeed } from './ActivityFeed'

const NOW = new Date('2026-10-16T12:00:00Z')
const events = createMockData('24h').events

type Props = Parameters<typeof ActivityFeed>[0]

function setup(props: Partial<Props> = {}) {
  return render(
    <MemoryRouter>
      <ActivityFeed events={events} severity="all" query="" now={NOW} {...props} />
    </MemoryRouter>,
  )
}

const items = () => within(screen.getByRole('list', { name: 'Eventos' })).getAllByRole('listitem')

const event = (n: number, minutesAgo: number, overrides: Partial<ActivityEvent> = {}): ActivityEvent => ({
  id: `EV-${n}`,
  message: `Evento ${n}`,
  actor: 'sistema',
  timestamp: new Date(NOW.getTime() - minutesAgo * 60_000).toISOString(),
  severity: 'info',
  ...overrides,
})

describe('ActivityFeed', () => {
  it('lista todos os eventos', () => {
    setup()
    expect(items()).toHaveLength(25)
  })

  it('ordena do mais recente ao mais antigo, mesmo que a entrada venha fora de ordem', () => {
    setup({ events: [event(1, 30), event(2, 5), event(3, 60)] })
    expect(items().map((li) => within(li).getByTestId('event-message').textContent)).toEqual([
      'Evento 2',
      'Evento 1',
      'Evento 3',
    ])
  })

  it('cada item tem <time> com datetime, ator e severidade em texto', () => {
    setup({ events: [event(1, 5, { actor: 'op.souza', severity: 'warning' })] })
    const [li] = items()
    expect(li.querySelector('time')).toHaveAttribute('datetime', event(1, 5).timestamp)
    expect(li).toHaveTextContent('há 5 min')
    expect(li).toHaveTextContent('op.souza')
    expect(li).toHaveTextContent('Aviso')
  })

  it('com limite, mostra os primeiros e um link para ver todos', () => {
    setup({ limit: 8 })
    expect(items()).toHaveLength(8)
    expect(screen.getByRole('link', { name: 'Ver todos os 25 eventos' })).toHaveAttribute('href', '/eventos')
  })

  it('sem link quando tudo cabe no limite', () => {
    setup({ limit: 30 })
    expect(screen.queryByRole('link', { name: /^Ver todos/ })).not.toBeInTheDocument()
  })

  it('sem limite, sem link', () => {
    setup()
    expect(screen.queryByRole('link', { name: /^Ver todos/ })).not.toBeInTheDocument()
  })

  it('filtra por severidade', () => {
    setup({ severity: 'warning' })
    expect(items().length).toBeGreaterThan(0)
    expect(items().every((li) => li.textContent?.includes('Aviso'))).toBe(true)
  })

  it('busca na mensagem, sem acento', () => {
    setup({ events: [event(1, 5, { message: 'Estação Sul voltou' }), event(2, 6)], query: 'estacao' })
    expect(items()).toHaveLength(1)
  })

  it('busca no ator, sem diferenciar maiúsculas', () => {
    setup({ events: [event(1, 5, { actor: 'op.ribeiro' }), event(2, 6)], query: 'RIBEIRO' })
    expect(items()).toHaveLength(1)
  })

  it('sem resultados para os filtros, avisa', () => {
    setup({ query: 'zzz' })
    expect(screen.getByText('Nenhum evento para os filtros atuais.')).toBeInTheDocument()
  })

  it('sem eventos, diz que nada foi registrado', () => {
    setup({ events: [] })
    expect(screen.getByText('Nenhum evento registrado.')).toBeInTheDocument()
  })
})
