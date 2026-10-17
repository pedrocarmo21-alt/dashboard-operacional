import { describe, expect, it } from 'vitest'
import { SEVERITY_BG } from './severity'

describe('SEVERITY_BG', () => {
  it('usa as cores de sinal do tema, com info neutro', () => {
    expect(SEVERITY_BG).toEqual({ info: 'bg-chart-4', warning: 'bg-signal-warn', critical: 'bg-signal-critical' })
  })
})
