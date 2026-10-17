import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAsync } from './useAsync'

type Fn<T> = (signal: AbortSignal) => Promise<T>

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const abortError = () => new DOMException('Requisição cancelada', 'AbortError')

describe('useAsync', () => {
  it('começa carregando e passa para sucesso com os dados', async () => {
    const d = deferred<string>()
    const fn: Fn<string> = () => d.promise
    const { result } = renderHook(() => useAsync(fn))
    expect(result.current.status).toBe('loading')
    expect(result.current.data).toBeUndefined()

    await act(async () => d.resolve('ok'))
    expect(result.current).toMatchObject({ status: 'success', data: 'ok', error: undefined })
  })

  it('expõe o erro quando a promessa rejeita', async () => {
    const fn: Fn<string> = () => Promise.reject(new Error('falhou'))
    const { result } = renderHook(() => useAsync(fn))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toEqual(new Error('falhou'))
  })

  it('converte rejeições que não são Error', async () => {
    const fn: Fn<string> = () => Promise.reject('texto solto')
    const { result } = renderHook(() => useAsync(fn))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('texto solto')
  })

  it('retry busca de novo e se recupera do erro', async () => {
    const fn = vi.fn<Fn<string>>().mockRejectedValueOnce(new Error('falhou')).mockResolvedValue('ok')
    const { result } = renderHook(() => useAsync(fn))
    await waitFor(() => expect(result.current.status).toBe('error'))

    act(() => result.current.retry())
    expect(result.current.status).toBe('loading')
    expect(result.current.error).toBeUndefined()
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.data).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('busca de novo quando a função muda e fica carregando até a nova resposta', async () => {
    const second = deferred<string>()
    const { result, rerender } = renderHook(({ fn }) => useAsync(fn), {
      initialProps: { fn: (() => Promise.resolve('24h')) as Fn<string> },
    })
    await waitFor(() => expect(result.current.data).toBe('24h'))

    rerender({ fn: () => second.promise })
    expect(result.current.status).toBe('loading')
    // Mantém os últimos dados enquanto carrega, para a interface não piscar.
    expect(result.current.data).toBe('24h')

    await act(async () => second.resolve('7d'))
    expect(result.current).toMatchObject({ status: 'success', data: '7d' })
  })

  it('ignora a resposta antiga que chega depois da nova', async () => {
    const slow = deferred<string>()
    const fast = deferred<string>()
    // As funções ignoram o sinal de propósito: o hook precisa descartar a resposta mesmo assim.
    const { result, rerender } = renderHook(({ fn }) => useAsync(fn), {
      initialProps: { fn: (() => slow.promise) as Fn<string> },
    })
    rerender({ fn: () => fast.promise })

    await act(async () => fast.resolve('novo'))
    await act(async () => slow.resolve('antigo'))
    expect(result.current).toMatchObject({ status: 'success', data: 'novo' })
  })

  it('ignora o erro da requisição antiga', async () => {
    const slow = deferred<string>()
    const { result, rerender } = renderHook(({ fn }) => useAsync(fn), {
      initialProps: { fn: (() => slow.promise) as Fn<string> },
    })
    rerender({ fn: () => Promise.resolve('novo') })
    await waitFor(() => expect(result.current.data).toBe('novo'))

    await act(async () => slow.reject(new Error('antigo falhou')))
    expect(result.current).toMatchObject({ status: 'success', data: 'novo', error: undefined })
  })

  it('aborta o sinal da requisição anterior ao trocar a função', () => {
    const signals: AbortSignal[] = []
    const fn: Fn<string> = (signal) => {
      signals.push(signal)
      return new Promise(() => {})
    }
    const { rerender } = renderHook(({ f }) => useAsync(f), { initialProps: { f: fn } })
    rerender({ f: (signal) => fn(signal) })
    expect(signals).toHaveLength(2)
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  it('aborta o sinal ao desmontar', () => {
    let captured: AbortSignal | undefined
    const fn: Fn<string> = (signal) => {
      captured = signal
      return new Promise(() => {})
    }
    const { unmount } = renderHook(() => useAsync(fn))
    unmount()
    expect(captured?.aborted).toBe(true)
  })

  it('AbortError não vira estado de erro', async () => {
    const d = deferred<string>()
    const fn: Fn<string> = () => d.promise
    const { result } = renderHook(() => useAsync(fn))
    await act(async () => d.reject(abortError()))
    expect(result.current.status).toBe('loading')
    expect(result.current.error).toBeUndefined()
  })

  it('retry mantém a mesma identidade entre renders', () => {
    const fn: Fn<string> = () => new Promise(() => {})
    const { result, rerender } = renderHook(() => useAsync(fn))
    const first = result.current.retry
    rerender()
    expect(result.current.retry).toBe(first)
  })
})
