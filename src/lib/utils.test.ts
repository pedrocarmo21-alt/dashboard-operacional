import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('a última classe conflitante vence', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignora valores falsos', () => {
    expect(cn('a', false, undefined, null)).toBe('a')
  })

  it('mescla as cores próprias do tema', () => {
    expect(cn('text-muted-foreground', 'text-signal-ok')).toBe('text-signal-ok')
    expect(cn('bg-card', 'bg-signal-critical')).toBe('bg-signal-critical')
  })

  it('não confunde cor própria com tamanho de texto', () => {
    expect(cn('text-sm', 'text-signal-ok')).toBe('text-sm text-signal-ok')
  })
})
