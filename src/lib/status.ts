import type { AsyncStatus, RequestStatus } from '@/types/dashboard'

/** Status de um painel: uma requisição bem-sucedida sem itens vira `empty`. */
export function derivePanelStatus(status: RequestStatus, count: number): AsyncStatus {
  return status === 'success' && count === 0 ? 'empty' : status
}

/**
 * Estado de um painel considerando recargas. Com dados anteriores na tela, uma nova carga
 * os mantém (`refreshing`) e um erro também (`stale`, desatualizados): o esqueleto e o erro
 * só aparecem quando não há nada para mostrar.
 */
export function panelState(
  status: RequestStatus,
  hasData: boolean,
  count: number,
): { status: AsyncStatus; refreshing: boolean; stale: boolean } {
  const refreshing = status === 'loading' && hasData
  const stale = status === 'error' && hasData
  return { status: derivePanelStatus(refreshing || stale ? 'success' : status, count), refreshing, stale }
}
