import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

describe('setup do jsdom', () => {
  it('ResizeObserver informa um tamanho fixo ao observar', () => {
    const callback = vi.fn<ResizeObserverCallback>()
    new ResizeObserver(callback).observe(document.body)
    const [entries] = callback.mock.calls[0]
    expect(entries[0].contentRect.width).toBeGreaterThan(0)
    expect(entries[0].contentRect.height).toBeGreaterThan(0)
  })

  it('matchMedia responde sem casar e aceita listeners', () => {
    const mql = window.matchMedia('(min-width: 768px)')
    expect(mql.matches).toBe(false)
    expect(() => mql.addEventListener('change', () => {})).not.toThrow()
  })

  it('tem as APIs de ponteiro e rolagem que o Radix usa', () => {
    const el = document.createElement('div')
    expect(el.hasPointerCapture(1)).toBe(false)
    expect(() => el.releasePointerCapture(1)).not.toThrow()
    expect(() => el.scrollIntoView()).not.toThrow()
  })

  it('um Select do Radix abre e seleciona uma opção', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: string) => void>()
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Severidade">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="critical">Crítico</SelectItem>
          <SelectItem value="warning">Aviso</SelectItem>
        </SelectContent>
      </Select>,
    )
    await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
    await user.click(screen.getByRole('option', { name: 'Crítico' }))
    expect(onValueChange).toHaveBeenCalledWith('critical')
  })
})

// Sem cleanup entre testes, o segundo getByText acharia dois elementos e falharia.
describe('cleanup entre testes', () => {
  it('primeiro render', () => {
    render(<p>único</p>)
    expect(screen.getByText('único')).toBeInTheDocument()
  })

  it('segundo render', () => {
    render(<p>único</p>)
    expect(screen.getByText('único')).toBeInTheDocument()
  })
})
