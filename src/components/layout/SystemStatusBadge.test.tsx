import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SystemStatusBadge } from './SystemStatusBadge'

describe('SystemStatusBadge', () => {
  it.each([
    ['operational', 'Operacional', 'ok'],
    ['degraded', 'Degradado', 'warn'],
    ['outage', 'Interrompido', 'critical'],
  ] as const)('%s mostra "%s" com sinal %s', (status, label, signal) => {
    render(<SystemStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByTestId('system-status')).toHaveAttribute('data-signal', signal)
  })

  it('sem status ainda mostra "Verificando…"', () => {
    render(<SystemStatusBadge status={undefined} />)
    expect(screen.getByText('Verificando…')).toBeInTheDocument()
    expect(screen.getByTestId('system-status')).toHaveAttribute('data-signal', 'unknown')
  })

  it('o leitor de tela ouve o contexto, não só a palavra', () => {
    render(<SystemStatusBadge status="degraded" />)
    expect(screen.getByTestId('system-status')).toHaveTextContent('Status do sistema: Degradado')
  })
})
