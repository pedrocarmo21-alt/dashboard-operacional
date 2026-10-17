import type { Asset, AssetStatus } from '@/types/dashboard'
import { ASSET_TYPE_LABEL } from './labels'
import { matchesQuery } from './text'

export type AssetSortKey = 'name' | 'status' | 'latencyMs' | 'lastSeen'
export type SortDirection = 'asc' | 'desc'

// Em ordem crescente, os ativos com problema vêm primeiro.
const STATUS_RANK: Record<AssetStatus, number> = { offline: 0, degraded: 1, online: 2 }

const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

export function filterAssets(assets: Asset[], { query, status }: { query: string; status: AssetStatus | 'all' }): Asset[] {
  return assets.filter(
    (a) =>
      (status === 'all' || a.status === status) &&
      matchesQuery([a.name, a.id, a.region, ASSET_TYPE_LABEL[a.type]], query),
  )
}

const COMPARE: Record<AssetSortKey, (a: Asset, b: Asset) => number> = {
  name: (a, b) => collator.compare(a.name, b.name),
  status: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
  latencyMs: (a, b) => a.latencyMs - b.latencyMs,
  lastSeen: (a, b) => Date.parse(a.lastSeen) - Date.parse(b.lastSeen),
}

/** Ordena sem alterar a lista recebida; empates são desfeitos pelo id, sempre crescente. */
export function sortAssets(assets: Asset[], key: AssetSortKey, dir: SortDirection): Asset[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...assets].sort((a, b) => sign * COMPARE[key](a, b) || a.id.localeCompare(b.id))
}
