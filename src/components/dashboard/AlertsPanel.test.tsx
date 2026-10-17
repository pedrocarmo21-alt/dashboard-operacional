import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import type { Alert, Severity } from '@/types/dashboard'
import { AlertsPanel } from './AlertsPanel'

const NOW = new Date('2026-10-16T12:00:00Z')
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString()

const alert = (n: number, severity: Severity, overrides: Partial<Alert> = {}): Alert => ({
  id: `AL-${n}`,
  title: `Alerta ${n}`,
  severity,
  assetId: `AT-000${n}`,
  createdAt: minutesAgo(n * 10),
  acknowledged: false,
  ...overrides,
})

const alerts = [
  alert(1, 'critical', { acknowledged: true }),
  alert(2, 'warning'),
  alert(3, 'critical'),
  alert(4, 'info'),
  alert(5, 'critical', { title: 'Perda de sinal' }),
]

type Props = Parameters<typeof AlertsPanel>[0]

function setup(props: Partial<Props> = {}) {
  const onAcknowledge = vi.fn<(id: string) => void>()
  const view = renderWithProviders(
    <AlertsPanel alerts={alerts} severity="all" query="" onAcknowledge={onAcknowledge} now={NOW} {...props} />,
  )
  return { ...view, onAcknowledge }
}

const items = () => within(screen.getByRole('list', { name: 'Alertas' })).getAllByRole('listitem')

describe('AlertsPanel', () => {
  it('lista pendentes primeiro, depois por data, do mais recente ao mais antigo', () => {
    setup()
    expect(items().map((li) => within(li).getByTestId('alert-title').textContent)).toEqual([
      'Alerta 2',
      'Alerta 3',
      'Alerta 4',
      'Perda de sinal',
      'Alerta 1',
    ])
  })

  it('cada item mostra severidade em texto, ativo e tempo relativo', () => {
    setup()
    const first = items()[0]
    expect(first).toHaveTextContent('Aviso')
    expect(first).toHaveTextContent('AT-0002')
    expect(within(first).getByText('há 20 min').tagName).toBe('TIME')
  })

  it('filtra por severidade', () => {
    setup({ severity: 'critical' })
    expect(items()).toHaveLength(3)
    expect(items().every((li) => within(li).queryByText('Crítico'))).toBe(true)
  })

  it('filtra pela busca no título ou no ativo, sem acento', () => {
    setup({ query: 'PERDA' })
    expect(items()).toHaveLength(1)
    setup({ query: 'at-0004' })
    expect(screen.getAllByRole('list', { name: 'Alertas' })[1].querySelectorAll('li')).toHaveLength(1)
  })

  it('reconhecer chama onAcknowledge com o id do alerta', async () => {
    const { user, onAcknowledge } = setup()
    await user.click(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 3 (AT-0003)' }))
    expect(onAcknowledge).toHaveBeenCalledWith('AL-3')
  })

  it('depois de reconhecer, o foco vai para o item, não se perde', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 3 (AT-0003)' }))
    const item = items().find((li) => li.textContent?.includes('Alerta 3'))!
    expect(item).toHaveFocus()
  })

  it('alerta reconhecido mostra "Reconhecido" e não tem botão', () => {
    setup()
    const done = items().at(-1)!
    expect(done).toHaveTextContent('Reconhecido')
    expect(within(done).queryByRole('button')).not.toBeInTheDocument()
  })

  it('nomes dos botões são únicos mesmo com títulos repetidos', () => {
    setup({ alerts: [alert(1, 'warning', { title: 'Igual' }), alert(2, 'warning', { title: 'Igual' })] })
    const names = screen.getAllByRole('button', { name: /^Reconhecer/ }).map((b) => b.getAttribute('aria-label'))
    expect(new Set(names).size).toBe(2)
  })

  it('com limite, mostra os primeiros e um link para ver todos', () => {
    setup({ limit: 2 })
    expect(items()).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Ver todos os 5 alertas' })).toHaveAttribute('href', '/alertas')
  })

  it('sem link quando tudo cabe no limite', () => {
    setup({ limit: 10 })
    expect(screen.queryByRole('link', { name: /^Ver todos/ })).not.toBeInTheDocument()
  })

  it('sem resultados para os filtros, avisa', () => {
    setup({ query: 'zzz' })
    expect(screen.getByText('Nenhum alerta para os filtros atuais.')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Alertas' })).not.toBeInTheDocument()
  })

  it('sem nenhum alerta no período, diz isso', () => {
    setup({ alerts: [] })
    expect(screen.getByText('Nenhum alerta no período.')).toBeInTheDocument()
  })
})
