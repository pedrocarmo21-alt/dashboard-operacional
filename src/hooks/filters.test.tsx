import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FiltersProvider, useFilters } from './filters'

const wrapper = FiltersProvider

describe('useFilters', () => {
  it('começa com os padrões: 24h, todas as severidades e busca vazia', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    expect(result.current).toMatchObject({ period: '24h', severity: 'all', query: '' })
  })

  it('setPeriod atualiza o período', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => result.current.setPeriod('7d'))
    expect(result.current.period).toBe('7d')
  })

  it('setSeverity atualiza a severidade', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => result.current.setSeverity('critical'))
    expect(result.current.severity).toBe('critical')
  })

  it('setQuery atualiza a busca', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => result.current.setQuery('norte'))
    expect(result.current.query).toBe('norte')
  })

  it('resetFilters volta aos padrões', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => {
      result.current.setPeriod('30d')
      result.current.setSeverity('warning')
      result.current.setQuery('sul')
    })
    expect(result.current.isDefault).toBe(false)
    act(() => result.current.resetFilters())
    expect(result.current).toMatchObject({ period: '24h', severity: 'all', query: '', isDefault: true })
  })

  it('isDefault só é verdadeiro com todos os filtros no padrão', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    expect(result.current.isDefault).toBe(true)
    act(() => result.current.setQuery('x'))
    expect(result.current.isDefault).toBe(false)
  })

  it('fora do provider lança erro explicativo', () => {
    expect(() => renderHook(() => useFilters())).toThrow('useFilters precisa estar dentro de <FiltersProvider>')
  })
})
