import type { AsyncStatus, RequestStatus } from '@/types/dashboard'

/** Status de um painel: uma requisição bem-sucedida sem itens vira `empty`. */
export function derivePanelStatus(status: RequestStatus, count: number): AsyncStatus {
  return status === 'success' && count === 0 ? 'empty' : status
}

/**
 * Estado de um painel considerando recargas: com dados anteriores, uma nova carga mantém
 * o conteúdo (marcado como `refreshing`) em vez de voltar ao esqueleto.
 */
export function panelState(
  status: RequestStatus,
  hasData: boolean,
  count: number,
): { status: AsyncStatus; refreshing: boolean } {
  const refreshing = status === 'loading' && hasData
  return { status: derivePanelStatus(refreshing ? 'success' : status, count), refreshing }
}
