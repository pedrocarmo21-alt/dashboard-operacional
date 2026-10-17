import { useCallback, useEffect, useState } from 'react'
import type { RequestStatus } from '@/types/dashboard'

export interface AsyncState<T> {
  status: RequestStatus
  /** Último dado bem-sucedido; continua disponível enquanto uma nova busca carrega. */
  data: T | undefined
  error: Error | undefined
  retry: () => void
}

interface Settled<T> {
  fn: unknown
  attempt: number
  status: 'success' | 'error'
  data: T | undefined
  error: Error | undefined
}

const isAbortError = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'
const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

/**
 * Executa `fn` e acompanha seu resultado. Busca de novo quando a identidade de `fn` muda
 * (o chamador memoriza com `useCallback`) ou quando `retry` é chamado. A requisição
 * anterior é abortada, e uma resposta atrasada nunca sobrescreve a mais recente.
 */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>): AsyncState<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fn(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        setSettled({ fn, attempt, status: 'success', data, error: undefined })
      },
      (reason: unknown) => {
        if (controller.signal.aborted || isAbortError(reason)) return
        setSettled((prev) => ({ fn, attempt, status: 'error', data: prev?.data, error: toError(reason) }))
      },
    )
    return () => controller.abort()
  }, [fn, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // Sem resultado para a requisição atual, ela ainda está carregando.
  const current = settled !== null && settled.fn === fn && settled.attempt === attempt
  const status = current ? settled.status : 'loading'
  return {
    status,
    data: settled?.data,
    error: status === 'error' ? settled?.error : undefined,
    retry,
  }
}
