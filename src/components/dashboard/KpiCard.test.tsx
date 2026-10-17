import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Kpi } from '@/types/dashboard'
import { KpiCard } from './KpiCard'

const latency: Kpi = { id: 'avgLatency', label: 'Latência média', value: 128.4, unit: 'ms', delta: 12.3, goodWhen: 'down' }
const online: Kpi = { id: 'assetsOnline', label: 'Ativos online', value: 31, unit: 'count', delta: 3, goodWhen: 'up' }
const ingest: Kpi = { id: 'ingestRate', label: 'Taxa de ingestão', value: 1234.6, unit: 'eventsPerSec', delta: -4, goodWhen: 'up' }

const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')

describe('KpiCard', () => {
  it('mostra rótulo e valor formatado por unidade', () => {
    render(<KpiCard kpi={latency} />)
    expect(screen.getByRole('term')).toHaveTextContent('Latência média')
    expect(norm(screen.getByTestId('kpi-value').textContent)).toBe('128 ms')
  })

  it('contagem usa separador de milhar', () => {
    render(<KpiCard kpi={{ ...online, value: 1500 }} />)
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('1.500')
  })

  it('ingestão mostra eventos por segundo inteiros', () => {
    render(<KpiCard kpi={ingest} />)
    expect(norm(screen.getByTestId('kpi-value').textContent)).toBe('1.235 ev/s')
  })

  it('subir quando o bom é cair é desfavorável', () => {
    render(<KpiCard kpi={latency} />)
    expect(screen.getByText('+12,3%')).toHaveAttribute('data-trend', 'bad')
  })

  it('subir quando o bom é subir é favorável', () => {
    render(<KpiCard kpi={online} />)
    expect(screen.getByText('+3,0%')).toHaveAttribute('data-trend', 'good')
  })

  it('cair quando o bom é subir é desfavorável', () => {
    render(<KpiCard kpi={ingest} />)
    expect(screen.getByText('−4,0%')).toHaveAttribute('data-trend', 'bad')
  })

  it('cair quando o bom é cair é favorável', () => {
    render(<KpiCard kpi={{ ...latency, delta: -7.5 }} />)
    expect(screen.getByText('−7,5%')).toHaveAttribute('data-trend', 'good')
  })

  it('variação que arredonda para zero é neutra', () => {
    render(<KpiCard kpi={{ ...latency, delta: 0.04 }} />)
    expect(screen.getByText('0,0%')).toHaveAttribute('data-trend', 'neutral')
  })

  it('descreve a variação em palavras para leitores de tela', () => {
    render(<KpiCard kpi={latency} />)
    expect(screen.getByText('aumento de 12,3% em relação ao período anterior')).toHaveClass('sr-only')
  })

  it('descreve redução e ausência de variação', () => {
    const { unmount } = render(<KpiCard kpi={ingest} />)
    expect(screen.getByText('redução de 4,0% em relação ao período anterior')).toBeInTheDocument()
    unmount()
    render(<KpiCard kpi={{ ...ingest, delta: 0 }} />)
    expect(screen.getByText('sem variação em relação ao período anterior')).toBeInTheDocument()
  })

  it('a variação visual não é lida em dobro', () => {
    render(<KpiCard kpi={latency} />)
    expect(screen.getByText('+12,3%').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('valor inválido mostra travessão e variação neutra', () => {
    render(<KpiCard kpi={{ ...latency, value: NaN, delta: 0 }} />)
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('—')
    expect(screen.getByText('0,0%')).toHaveAttribute('data-trend', 'neutral')
  })

  it('ingestão inválida mostra só o travessão, sem unidade', () => {
    render(<KpiCard kpi={{ ...ingest, value: Infinity }} />)
    expect(screen.getByTestId('kpi-value').textContent).toBe('—')
  })

  it('variação inválida mostra travessão, neutra e explicada', () => {
    render(<KpiCard kpi={{ ...latency, delta: NaN }} />)
    expect(screen.getByText('—')).toHaveAttribute('data-trend', 'neutral')
    expect(screen.getByText('variação indisponível')).toBeInTheDocument()
  })
})
