import type { AsyncStatus, RequestStatus } from '@/types/dashboard'

/** Status de um painel: uma requisição bem-sucedida sem itens vira `empty`. */
export function derivePanelStatus(status: RequestStatus, count: number): AsyncStatus {
  return status === 'success' && count === 0 ? 'empty' : status
}
