import { ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { type AssetSortKey, filterAssets, type SortDirection, sortAssets } from '@/lib/assets'
import { formatDateTime, formatMs, formatRelativeTime } from '@/lib/format'
import { ASSET_STATUS_LABEL, ASSET_TYPE_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'
import type { Asset, AssetStatus } from '@/types/dashboard'

const STATUS_FILTERS: (AssetStatus | 'all')[] = ['all', 'online', 'degraded', 'offline']
const statusFilterLabel = (s: AssetStatus | 'all') => (s === 'all' ? 'Todos' : ASSET_STATUS_LABEL[s])
const parseStatus = (value: string | null): AssetStatus | 'all' =>
  STATUS_FILTERS.find((s) => s === value) ?? 'all'

const STATUS_DOT: Record<AssetStatus, string> = {
  online: 'bg-signal-ok',
  degraded: 'bg-signal-warn',
  offline: 'bg-signal-critical',
}

interface AssetsTableProps {
  assets: Asset[]
  query: string
  /** Mostra só as primeiras linhas e um link para a página de ativos. */
  limit?: number
  /** Referência do tempo relativo: o `generatedAt` dos dados, não o relógio da máquina. */
  now: Date
}

export function AssetsTable({ assets, query, limit, now }: AssetsTableProps) {
  // O status fica na URL (?status=): o link "Ver todos" leva o filtro para /ativos.
  const [params, setParams] = useSearchParams()
  const status = parseStatus(params.get('status'))
  const setStatus = (next: AssetStatus | 'all') =>
    setParams(
      (prev) => {
        const updated = new URLSearchParams(prev)
        if (next === 'all') updated.delete('status')
        else updated.set('status', next)
        return updated
      },
      { replace: true },
    )
  const [sort, setSort] = useState<{ key: AssetSortKey; dir: SortDirection }>({ key: 'status', dir: 'asc' })

  const counts = useMemo(() => {
    const byStatus = filterAssets(assets, { query, status: 'all' })
    return Object.fromEntries(
      STATUS_FILTERS.map((s) => [s, s === 'all' ? byStatus.length : byStatus.filter((a) => a.status === s).length]),
    ) as Record<AssetStatus | 'all', number>
  }, [assets, query])

  const rows = useMemo(
    () => sortAssets(filterAssets(assets, { query, status }), sort.key, sort.dir),
    [assets, query, status, sort],
  )
  const visible = limit === undefined ? rows : rows.slice(0, limit)

  const toggleSort = (key: AssetSortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Status"
        value={status}
        onValueChange={(value) => value && setStatus(value as AssetStatus | 'all')}
        // Quebra linha em telas estreitas: em 360px os quatro filtros não cabem numa linha só.
        className="flex-wrap self-start"
      >
        {STATUS_FILTERS.map((s) => (
          <ToggleGroupItem key={s} value={s} aria-label={`${statusFilterLabel(s)}: ${counts[s]}`} className="gap-1.5 px-2.5 text-xs">
            {statusFilterLabel(s)}
            <span className="font-mono text-muted-foreground">{counts[s]}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum ativo corresponde aos filtros.</p>
      ) : (
        <Table aria-label="Ativos" className="min-w-[640px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead label="Ativo" sortKey="name" sort={sort} onSort={toggleSort} />
              <TableHead>Tipo</TableHead>
              <TableHead>Região</TableHead>
              <SortableHead label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
              <SortableHead label="Latência" sortKey="latencyMs" sort={sort} onSort={toggleSort} align="right" />
              <SortableHead label="Visto" sortKey="lastSeen" sort={sort} onSort={toggleSort} align="right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((asset) => (
              <TableRow key={asset.id} className="h-9">
                <TableCell className="py-1">
                  <span className="block">{asset.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{asset.id}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{ASSET_TYPE_LABEL[asset.type]}</TableCell>
                <TableCell className="text-muted-foreground">{asset.region}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[asset.status])} />
                    {ASSET_STATUS_LABEL[asset.status]}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatMs(asset.latencyMs)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  <time dateTime={asset.lastSeen} title={formatDateTime(asset.lastSeen)}>
                    {formatRelativeTime(asset.lastSeen, now)}
                  </time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {limit !== undefined && rows.length > limit && (
        <Link
          to={status === 'all' ? '/ativos' : `/ativos?status=${status}`}
          className="self-start text-xs text-signal-ok underline-offset-4 hover:underline"
        >
          Ver todos os {rows.length} ativos
        </Link>
      )}
    </div>
  )
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: AssetSortKey
  sort: { key: AssetSortKey; dir: SortDirection }
  onSort: (key: AssetSortKey) => void
  align?: 'left' | 'right'
}) {
  const active = sort.key === sortKey
  const Icon = sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      className={cn(align === 'right' && 'text-right')}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
          active && 'text-foreground',
        )}
      >
        {label}
        <Icon aria-hidden="true" className={cn('size-3', !active && 'invisible')} />
      </button>
    </TableHead>
  )
}
