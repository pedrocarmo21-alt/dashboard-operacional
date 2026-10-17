# Plano de implementação do Dashboard Operacional

> **Para agentes:** SUB-SKILL OBRIGATÓRIO: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** construir um dashboard operacional escuro e denso, com sidebar, header, KPIs, gráficos, tabela de ativos, alertas e eventos, filtros funcionais e layout responsivo, usando dados fictícios.

**Arquitetura:** SPA em Vite. Um `DashboardDataProvider` no topo busca os dados de uma API simulada (com latência, modo erro e modo vazio) conforme o período escolhido. As páginas e o header leem esse contexto. Os filtros (período, severidade e busca) ficam num `FiltersProvider`. Cada painel usa o componente `Panel`, que centraliza os estados de carregamento, vazio e erro. A navegação entre seções usa React Router.

**Stack:** Vite, React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui, lucide-react, Recharts, React Router, Vitest, React Testing Library, user-event, jest-dom, vitest-axe.

**Spec:** [`docs/design.md`](design.md) · regras do projeto em [`CLAUDE.md`](../CLAUDE.md)

## Restrições globais

- Node.js 22 LTS (≥ 22.22, mínimo do React Router 8) é pré-requisito, fixado em `.nvmrc`. O Node 20 está sem suporte desde abril de 2026. Nesta máquina, o Node é instalado via nvm.
- Só tema escuro: preto, grafite e tons de cinza. Verde e âmbar são os únicos acentos, usados para destacar informação. Vermelho aparece apenas na severidade crítica e, nos componentes shadcn, em campo de formulário inválido (`--destructive`). Não usar `variant="destructive"` em painéis de erro de carregamento.
- Sem gradientes exagerados, sem decoração desnecessária, sem aparência de template genérico.
- Nada de nomes, logos ou layouts copiados da Palantir ou da Anduril. Elas não aparecem na interface.
- Textos da interface em português do Brasil. Números e datas formatados em `pt-BR`.
- Testes ficam ao lado do código (`X.tsx` + `X.test.tsx`). Toda funcionalidade é entregue com testes.
- Um commit por tarefa, no formato `tipo: descrição` (ver `CLAUDE.md`).
- Tokens de cor (CSS variables em `src/index.css`):

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#0a0a0b` | fundo da página |
| `--card` | `#111113` | painéis |
| `--muted` | `#1a1a1d` | hover, linhas zebradas, skeleton |
| `--border` | `#26262b` | bordas de 1px |
| `--foreground` | `#e4e4e7` | texto principal |
| `--muted-foreground` | `#8b8b94` | texto secundário (contraste ≥ 4.5:1 sobre `--background`) |
| `--signal-ok` | `#3ddc84` | verde: online, variação favorável |
| `--signal-warn` | `#f5a623` | âmbar: aviso, degradado, variação desfavorável |
| `--signal-critical` | `#ef4444` | crítico, offline |

- Foco visível: anel sólido de 1px em `--ring` (verde), sem opacidade. Itens de menu e select destacados (`[data-highlighted]`) ganham contorno de 1px em `--ring` além do fundo `--accent`.
- Tipografia: Inter para a interface e JetBrains Mono para números, IDs e timestamps, via `@fontsource` (sem CDN). `--radius: 0.25rem`.
- Rótulos fixos:
  - Severidade: `info → "Info"`, `warning → "Aviso"`, `critical → "Crítico"`.
  - Status do ativo: `online → "Online"`, `degraded → "Degradado"`, `offline → "Offline"`.
  - Status do sistema: `operational → "Operacional"`, `degraded → "Degradado"`, `outage → "Interrompido"`.

## Foco de revisão

Situações que a spec implica, mas que é fácil esquecer. Cada uma tem um teste na tarefa responsável.

1. **Busca com acento, maiúsculas ou sem resultado.** "ESTACAO" deve encontrar "Estação Norte-03". Sem resultado, aparece o estado vazio, sem erro. (Tarefas 2 e 11)
2. **Troca rápida de filtro com requisição em andamento.** Uma resposta antiga não pode sobrescrever a mais nova. (Tarefa 4)
3. **Números extremos.** `0`, valores grandes, variação negativa, `NaN` e `Infinity` nunca aparecem como "NaN" na tela; aparece "—". (Tarefas 2 e 9)
4. **Tela estreita (360px).** A tabela rola dentro do próprio painel, não a página inteira. (Tarefa 11)
5. **Teclado.** `Esc` fecha o menu mobile e o foco volta ao botão que o abriu. "Tentar novamente" após um erro busca de novo e volta ao estado de sucesso. (Tarefas 5, 6 e 13)

---

## Estrutura de arquivos

```
src/
├── main.tsx, App.tsx, index.css
├── types/dashboard.ts            # tipos de domínio
├── lib/
│   ├── utils.ts                  # cn() (gerado pelo shadcn)
│   ├── format.ts                 # formatação pt-BR
│   ├── text.ts                   # normalização e busca
│   ├── status.ts                 # derivePanelStatus
│   ├── labels.ts                 # rótulos pt-BR
│   └── assets.ts                 # filtrar e ordenar ativos
├── data/
│   ├── mock.ts                   # gerador determinístico
│   └── api.ts                    # API simulada
├── hooks/
│   ├── useAsync.ts
│   ├── filters.tsx               # FiltersProvider, useFilters
│   └── dashboard-data.tsx        # DashboardDataProvider, useDashboardData
├── components/
│   ├── ui/                       # shadcn
│   ├── layout/                   # AppShell, Sidebar, MobileNav, Header, NotificationsMenu, ProfileMenu, SystemStatusBadge
│   ├── charts/                   # ThroughputChart, IncidentsBySeverityChart
│   └── dashboard/                # Panel, FilterBar, KpiCard, KpiGrid, AssetsTable, AlertsPanel, ActivityFeed
├── pages/                        # OverviewPage, AssetsPage, AlertsPage, EventsPage, NotFoundPage
└── test/
    ├── setup.ts
    └── render.tsx                # renderWithProviders
```

---

### Tarefa 1: Base do projeto, tema e testes

**Arquivos:**
- Criar: `package.json`, `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `components.json`, `src/lib/utils.ts`, `src/test/setup.ts`
- Teste: `src/App.test.tsx`

**Interfaces:**
- Produz: alias `@/` → `src/`; scripts `dev`, `build`, `preview`, `lint`, `typecheck`, `test`; tokens de cor e fontes das Restrições globais; `cn()` em `@/lib/utils`.

- [ ] **Passo 1: Instalar o Node da versão do `.nvmrc` e conferir**

O `.nvmrc` já existe na raiz, com `22`. Com o [nvm](https://github.com/nvm-sh/nvm) instalado:

```bash
nvm install    # lê o .nvmrc
nvm use
node -v
```

Esperado: `v22.12.0` ou maior dentro da linha 22. Se o Vite atual exigir outra versão (campo `engines` no `package.json` dele), atualizar o `.nvmrc` antes de seguir.

- [ ] **Passo 2: Gerar o template Vite numa pasta temporária e copiar para a raiz**

O diretório já tem `docs/`, `CLAUDE.md` e `.gitignore`. Gerar fora dele para não sobrescrever nada:

```bash
npm create vite@latest ../dashboard-scaffold -- --template react-ts
rsync -a --exclude .gitignore --exclude README.md ../dashboard-scaffold/ ./
rm -rf ../dashboard-scaffold
npm install
```

Depois, adicionar `"engines": { "node": ">=22.12" }` ao `package.json`.

Esperado: `git status` mostra só arquivos novos. `.gitignore`, `.nvmrc`, `CLAUDE.md` e `docs/` ficam intactos.

- [ ] **Passo 3: Adicionar Tailwind v4, o alias `@/` e o shadcn/ui**

Instalar `tailwindcss` e `@tailwindcss/vite`. Configurar `paths` em `tsconfig.json` e `tsconfig.app.json` e o `resolve.alias` no `vite.config.ts`. Rodar `npx shadcn@latest init` e depois `npx shadcn@latest add button input badge card skeleton table tabs select toggle-group sheet popover dropdown-menu separator tooltip sonner`.

- [ ] **Passo 4: Aplicar o tema**

Em `src/index.css`, mapear os tokens da tabela para as variáveis do shadcn e adicionar `--signal-ok`, `--signal-warn` e `--signal-critical` ao `@theme`. Colocar `class="dark"` e `lang="pt-BR"` no `<html>`. Instalar `@fontsource-variable/inter` e `@fontsource-variable/jetbrains-mono` e importar no `main.tsx`.

- [ ] **Passo 5: Configurar o Vitest**

Instalar `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` e `vitest-axe`. No `vite.config.ts`: `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: false }`. O `setup.ts` importa `@testing-library/jest-dom/vitest`, registra os matchers de `vitest-axe/matchers` e define stubs de `ResizeObserver` (que informa um tamanho fixo de 800×400), `window.matchMedia`, `hasPointerCapture`, `releasePointerCapture` e `scrollIntoView` (o Recharts e o Radix precisam deles no jsdom). Os tipos do `vitest-axe` 0.1 não servem para o Vitest 5, então a declaração fica em `src/test/vitest-axe.d.ts`. Adicionar `"typecheck": "tsc -b --noEmit"` e `"test": "vitest"` aos scripts.

- [ ] **Passo 6: Escrever o teste de fumaça**

```tsx
// src/App.test.tsx
it('renderiza sem quebrar', () => {
  render(<App />)
  expect(document.body).not.toBeEmptyDOMElement()
})
```

- [ ] **Passo 7: Verificar**

Rodar: `npm run lint && npm run typecheck && npm test -- --run && npm run build`. Esperado: tudo passa. Com `npm run dev`, a página abre com fundo `#0a0a0b`.

- [ ] **Passo 8: Commit** — `chore: inicializa projeto com Vite, Tailwind, shadcn/ui e Vitest`

---

### Tarefa 2: Formatação e busca de texto

**Arquivos:**
- Criar: `src/lib/format.ts`, `src/lib/text.ts`
- Teste: `src/lib/format.test.ts`, `src/lib/text.test.ts`

**Interfaces:**
- Produz:
  - `formatNumber(n: number): string`
  - `formatCompact(n: number): string`
  - `formatMs(n: number): string`
  - `formatPercentDelta(d: number): string`
  - `formatRelativeTime(iso: string, now: Date): string`
  - `formatDateTime(iso: string, timeZone?: string): string` (sem `timeZone`, usa o fuso do navegador; os testes passam `'UTC'`)
  - `normalizeText(s: string): string`
  - `matchesQuery(fields: string[], query: string): boolean` (cada palavra da busca precisa casar em algum campo)

- [ ] **Passo 1: Escrever os testes que falham**

O `Intl` usa espaço não separável, então os testes normalizam com `.replace(/\s/g, ' ')`.

```ts
expect(formatNumber(1234567)).toBe('1.234.567')
expect(formatNumber(NaN)).toBe('—')
expect(formatNumber(Infinity)).toBe('—')
expect(formatCompact(1200)).toBe('1,2 mil')
expect(formatMs(128.4)).toBe('128 ms')
expect(formatPercentDelta(12.34)).toBe('+12,3%')
expect(formatPercentDelta(-4)).toBe('−4,0%')   // sinal de menos U+2212
expect(formatPercentDelta(0)).toBe('0,0%')
expect(formatPercentDelta(NaN)).toBe('—')
const now = new Date('2026-10-16T12:00:00Z')
expect(formatRelativeTime('2026-10-16T11:55:00Z', now)).toBe('há 5 min')
expect(formatRelativeTime('2026-10-16T09:00:00Z', now)).toBe('há 3 h')
expect(formatRelativeTime('2026-10-14T12:00:00Z', now)).toBe('há 2 d')
expect(formatRelativeTime('2026-10-16T11:59:40Z', now)).toBe('agora')

expect(normalizeText('  Estação NORTE ')).toBe('estacao norte')
expect(matchesQuery(['Estação Norte-03', 'Sul'], 'ESTACAO')).toBe(true)
expect(matchesQuery(['Sensor A'], 'radar')).toBe(false)
expect(matchesQuery(['Sensor A'], '   ')).toBe(true)          // busca vazia casa tudo
expect(matchesQuery(['Sensor (A)'], '(a)')).toBe(true)        // caractere especial não quebra
```

- [ ] **Passo 2: Rodar e ver falhar** — `npm test -- --run src/lib` → FAIL (módulos inexistentes)

- [ ] **Passo 3: Implementar**

Usar `Intl.NumberFormat('pt-BR')` (com `notation: 'compact'` no `formatCompact`). Qualquer valor não finito vira `'—'`. Em `formatRelativeTime`: menos de 60 s → `agora`; menos de 60 min → `há N min`; menos de 24 h → `há N h`; senão `há N d`. `normalizeText` faz `trim`, `toLowerCase`, `normalize('NFD')` e remove `\p{Diacritic}`. `matchesQuery` usa `includes`, nunca `RegExp`.

- [ ] **Passo 4: Rodar e ver passar** — `npm test -- --run src/lib` → PASS

- [ ] **Passo 5: Commit** — `feat: adiciona formatação pt-BR e busca sem acento`

---

### Tarefa 3: Tipos de domínio, rótulos e dados fictícios

**Arquivos:**
- Criar: `src/types/dashboard.ts`, `src/lib/labels.ts`, `src/data/mock.ts`
- Teste: `src/data/mock.test.ts`

**Interfaces:**
- Produz (`src/types/dashboard.ts`):

```ts
export type Period = '24h' | '7d' | '30d'
export type Severity = 'info' | 'warning' | 'critical'
export type AssetStatus = 'online' | 'degraded' | 'offline'
export type AssetType = 'sensor' | 'veiculo' | 'estacao'
export type SystemStatus = 'operational' | 'degraded' | 'outage'
export type AsyncStatus = 'loading' | 'success' | 'empty' | 'error'
export type RequestStatus = Exclude<AsyncStatus, 'empty'>
export type KpiId = 'assetsOnline' | 'openIncidents' | 'avgLatency' | 'ingestRate'
export interface Kpi { id: KpiId; label: string; value: number; unit: 'count' | 'ms' | 'eventsPerSec'; delta: number; goodWhen: 'up' | 'down' }
export interface ThroughputPoint { timestamp: string; eventsPerSec: number }
export interface Asset { id: string; name: string; type: AssetType; region: string; status: AssetStatus; latencyMs: number; lastSeen: string }
export interface Alert { id: string; title: string; severity: Severity; assetId: string; createdAt: string; acknowledged: boolean }
export interface ActivityEvent { id: string; message: string; actor: string; timestamp: string; severity: Severity }
export interface DashboardData { systemStatus: SystemStatus; generatedAt: string; kpis: Kpi[]; throughput: ThroughputPoint[]; assets: Asset[]; alerts: Alert[]; events: ActivityEvent[] }
```

- Produz também:
  - `SEVERITY_LABEL: Record<Severity, string>`, `ASSET_STATUS_LABEL`, `SYSTEM_STATUS_LABEL` e `PERIOD_LABEL: Record<Period, string>` (`'Últimas 24 h' | 'Últimos 7 dias' | 'Últimos 30 dias'`) em `labels.ts`
  - `REFERENCE_NOW = '2026-10-16T12:00:00Z'`
  - `createMockData(period: Period, seed = 42): DashboardData` em `mock.ts`. A frota de ativos é a mesma em todos os períodos; alertas e eventos vêm ordenados do mais recente para o mais antigo. Os ids de alerta incluem o período (`AL-24H-0001`), para que reconhecer um alerta de 24h não marque outro de 7d.

- [ ] **Passo 1: Escrever os testes que falham**

```ts
it('é determinístico para a mesma semente', () => {
  expect(createMockData('24h')).toEqual(createMockData('24h'))
})
it('gera a quantidade esperada de pontos por período', () => {
  expect(createMockData('24h').throughput).toHaveLength(24)
  expect(createMockData('7d').throughput).toHaveLength(28)
  expect(createMockData('30d').throughput).toHaveLength(30)
})
it('gera 40 ativos, 12 alertas, 25 eventos e os 4 KPIs', () => {
  const d = createMockData('24h')
  expect(d.assets).toHaveLength(40)
  expect(d.alerts).toHaveLength(12)
  expect(d.events).toHaveLength(25)
  expect(d.kpis.map(k => k.id)).toEqual(['assetsOnline', 'openIncidents', 'avgLatency', 'ingestRate'])
})
it('mantém consistência interna', () => {
  const d = createMockData('7d')
  const online = d.assets.filter(a => a.status === 'online').length
  expect(d.kpis.find(k => k.id === 'assetsOnline')!.value).toBe(online)
  const ids = new Set(d.assets.map(a => a.id))
  expect(d.alerts.every(a => ids.has(a.assetId))).toBe(true)
  expect(d.assets.some(a => /[ãçé]/.test(a.name))).toBe(true)  // nomes com acento para testar a busca
})
```

- [ ] **Passo 2: Rodar e ver falhar** — `npm test -- --run src/data` → FAIL

- [ ] **Passo 3: Implementar**

PRNG `mulberry32(seed)` local em `mock.ts`, com todos os timestamps relativos a `REFERENCE_NOW`. Intervalo dos pontos: 1 h (24h), 6 h (7d) e 1 dia (30d). Nomes realistas como `Estação Norte-03`, `Sensor Óptico 12` e `Veículo Patrulha 07`. Regiões: Norte, Sul, Leste, Oeste, Centro. Distribuição aproximada dos status: 80% online, 15% degradado, 5% offline. `openIncidents` = alertas não reconhecidos. `systemStatus` = `'degraded'` se houver alerta crítico não reconhecido; senão `'operational'`.

- [ ] **Passo 4: Rodar e ver passar** — `npm test -- --run src/data` → PASS

- [ ] **Passo 5: Commit** — `feat: adiciona tipos de domínio e gerador de dados fictícios`

---

### Tarefa 4: API simulada e `useAsync`

**Arquivos:**
- Criar: `src/data/api.ts`, `src/hooks/useAsync.ts`, `src/lib/status.ts`
- Teste: `src/data/api.test.ts`, `src/hooks/useAsync.test.ts`, `src/lib/status.test.ts`

**Interfaces:**
- Consome: `createMockData`, `Period`, `DashboardData`, `AsyncStatus`
- Produz:
  - `type SimulationMode = 'normal' | 'erro' | 'vazio' | 'lento'`
  - `getSimulationMode(search: string): SimulationMode`, que lê `?simular=`
  - `fetchDashboard(period: Period, signal?: AbortSignal, mode: SimulationMode = 'normal'): Promise<DashboardData>`, com latência de 400 ms (2000 ms no modo `lento`)
  - `useAsync<T>(fn: (signal: AbortSignal) => Promise<T>): { status: RequestStatus; data: T | undefined; error: Error | undefined; retry: () => void }`, que roda de novo quando a identidade de `fn` muda. Durante uma nova carga, `data` mantém o último resultado bem-sucedido.
  - `derivePanelStatus(status: RequestStatus, count: number): AsyncStatus`

- [ ] **Passo 1: Escrever os testes que falham** (com `vi.useFakeTimers()` na API)

```ts
expect(getSimulationMode('?simular=erro')).toBe('erro')
expect(getSimulationMode('?simular=xyz')).toBe('normal')
expect(getSimulationMode('')).toBe('normal')

// api
const p = fetchDashboard('24h'); vi.advanceTimersByTime(400)
await expect(p).resolves.toMatchObject({ assets: expect.any(Array) })
const e = fetchDashboard('24h', undefined, 'erro'); vi.advanceTimersByTime(400)
await expect(e).rejects.toThrow('Falha ao carregar dados')
const v = fetchDashboard('24h', undefined, 'vazio'); vi.advanceTimersByTime(400)
await expect(v).resolves.toMatchObject({ kpis: [], assets: [], alerts: [], events: [], throughput: [] })
const ctrl = new AbortController(); const a = fetchDashboard('24h', ctrl.signal); ctrl.abort()
await expect(a).rejects.toHaveProperty('name', 'AbortError')

// status
expect(derivePanelStatus('success', 0)).toBe('empty')
expect(derivePanelStatus('success', 3)).toBe('success')
expect(derivePanelStatus('loading', 0)).toBe('loading')
expect(derivePanelStatus('error', 5)).toBe('error')

// useAsync (renderHook)
it('vai de loading para success', ...)                 // status 'loading' → 'success', data definida
it('expõe erro e retry busca de novo', ...)           // 1ª chamada rejeita, 2ª resolve; após retry() status === 'success'
it('ignora resposta antiga quando fn muda', ...)      // fn A resolve depois de fn B → data === resultado de B (Foco de revisão 2)
it('aborta a requisição anterior ao trocar fn', ...)  // signal da 1ª chamada fica aborted
```

- [ ] **Passo 2: Rodar e ver falhar** — `npm test -- --run src/data src/hooks src/lib/status.test.ts` → FAIL

- [ ] **Passo 3: Implementar**

A cada execução, `useAsync` cria um `AbortController` dentro de um `useEffect([fn, attempt])` e aborta o anterior no cleanup. `retry` incrementa `attempt`. Um `AbortError` nunca vira estado de erro.

- [ ] **Passo 4: Rodar e ver passar** → PASS

- [ ] **Passo 5: Commit** — `feat: adiciona API simulada e hook useAsync com cancelamento`

---

### Tarefa 5: Providers de filtros e dados, helper de teste e `Panel`

**Arquivos:**
- Instalar: `react-router` (o helper de teste usa `MemoryRouter`; a Tarefa 6 só adiciona as rotas)
- Criar: `src/hooks/filters.tsx`, `src/hooks/dashboard-data.tsx`, `src/test/render.tsx`, `src/components/dashboard/Panel.tsx`
- Teste: `src/hooks/filters.test.tsx`, `src/hooks/dashboard-data.test.tsx`, `src/components/dashboard/Panel.test.tsx`

**Interfaces:**
- Consome: `useAsync`, `fetchDashboard`, `getSimulationMode`
- Produz:
  - `FiltersProvider({ children })` e `useFilters(): { period: Period; setPeriod(p: Period): void; severity: Severity | 'all'; setSeverity(s: Severity | 'all'): void; query: string; setQuery(q: string): void }`. Padrões: `'24h'`, `'all'` e `''`.
  - `type Fetcher = (period: Period, signal: AbortSignal) => Promise<DashboardData>`
  - `DashboardDataProvider({ children, fetcher? })`. Sem `fetcher`, usa `fetchDashboard` com `getSimulationMode(window.location.search)`.
  - `useDashboardData(): { status: 'loading' | 'success' | 'error'; data: DashboardData | undefined; error: Error | undefined; retry(): void; acknowledgeAlert(id: string): void }`. Os alertas em `data` já vêm com os reconhecimentos locais aplicados.
  - `renderWithProviders(ui: ReactElement, opts?: { route?: string; fetcher?: Fetcher })`. Envolve em `MemoryRouter`, `FiltersProvider` e `DashboardDataProvider`; o fetcher padrão resolve na hora com `createMockData(period)`. Retorna o `render` + `user` (`userEvent.setup()`).
  - `Panel({ title, description?, actions?, status, onRetry?, emptyMessage = 'Nenhum dado para exibir.', className?, children })`

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
// filters
it('setPeriod atualiza o período', ...)               // renderHook com wrapper; period: '24h' → '7d'

// dashboard-data
it('busca de novo ao trocar o período', ...)          // fetcher mock; setPeriod('30d') → fetcher chamado com '30d'
it('acknowledgeAlert marca o alerta como reconhecido', ...)

// Panel
render(<Panel title="Ativos" status="loading">x</Panel>)
expect(screen.getByRole('status')).toHaveTextContent('Carregando')
expect(screen.getByRole('region', { name: 'Ativos' })).toHaveAttribute('aria-busy', 'true')

render(<Panel title="Ativos" status="empty" emptyMessage="Nenhum ativo encontrado.">x</Panel>)
expect(screen.getByText('Nenhum ativo encontrado.')).toBeInTheDocument()
expect(screen.queryByText('x')).not.toBeInTheDocument()

const onRetry = vi.fn()
render(<Panel title="Ativos" status="error" onRetry={onRetry}>x</Panel>)
expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar')
await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
expect(onRetry).toHaveBeenCalledOnce()

render(<Panel title="Ativos" status="success">conteúdo</Panel>)
expect(screen.getByText('conteúdo')).toBeInTheDocument()
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL

- [ ] **Passo 3: Implementar**

`Panel` é um `<section aria-labelledby>` com borda de 1px em `--border`, fundo `--card`, título em caixa-alta pequena (`text-xs tracking-wider text-muted-foreground`) e sem sombra. No estado de carregamento usa `Skeleton` do shadcn.

- [ ] **Passo 4: Rodar e ver passar** → PASS

- [ ] **Passo 5: Commit** — `feat: adiciona providers de filtros e dados e o componente Panel`

---

### Tarefa 6: Shell, sidebar, navegação e menu mobile

**Arquivos:**
- Criar: `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/MobileNav.tsx`, `src/pages/NotFoundPage.tsx`, e as páginas `Overview`, `Assets`, `Alerts` e `Events` como placeholders (só um `<h1>`)
- Modificar: `src/App.tsx` (rotas)
- Teste: `src/components/layout/Sidebar.test.tsx`, `src/components/layout/MobileNav.test.tsx`, `src/App.test.tsx`

**Interfaces:**
- Produz:
  - `NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[]` = `/` Visão geral (`LayoutDashboard`), `/ativos` Ativos (`Boxes`), `/alertas` Alertas (`TriangleAlert`), `/eventos` Eventos (`Activity`)
  - `Sidebar()`, `MobileNav()`, `AppShell()`. O `AppShell` renderiza a Sidebar (`md+`), um slot de header (preenchido na Tarefa 7) e o `<Outlet/>` dentro de `<main id="conteudo">`.
  - `AppRoutes()` (= `useRoutes(routes)`) em `src/App.tsx`; `routes` fica interno ao arquivo. `NAV_ITEMS` fica em `src/components/layout/nav-items.ts`, e o componente `NavLinks`, usado pela sidebar e pelo menu mobile, em `nav.tsx`. O `App` envolve `AppRoutes` com `BrowserRouter` e os providers. Os testes renderizam `<AppRoutes />` com `renderWithProviders`.

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
// Sidebar
renderWithProviders(<Sidebar />, { route: '/ativos' })
expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
expect(screen.getByRole('link', { name: 'Ativos' })).toHaveAttribute('aria-current', 'page')

// App / rotas
it('navega para Alertas ao clicar no link', ...)       // h1 "Alertas" aparece
it('rota desconhecida mostra página 404', ...)         // texto "Página não encontrada" + link "Voltar à visão geral"
it('tem link "Pular para o conteúdo"', ...)            // href="#conteudo"

// MobileNav (Foco de revisão 5)
const trigger = screen.getByRole('button', { name: 'Abrir menu' })
await user.click(trigger)
expect(screen.getByRole('dialog')).toBeInTheDocument()
await user.keyboard('{Escape}')
expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
expect(trigger).toHaveFocus()
it('fecha ao escolher um destino', ...)
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL

- [ ] **Passo 3: Implementar**

Sidebar fixa de 224px no `md+`, com ícone de 16px, rótulo e item ativo marcado por uma barra verde de 2px à esquerda. Em telas menores, o `MobileNav` usa o `Sheet` do shadcn com os mesmos `NAV_ITEMS`. Usar `NavLink` do React Router.

- [ ] **Passo 4: Rodar e ver passar** → PASS

- [ ] **Passo 5: Commit** — `feat: adiciona shell com sidebar, rotas e menu mobile`

---

### Tarefa 7: Header com busca, notificações, perfil e status

**Arquivos:**
- Criar: `src/components/layout/Header.tsx`, `NotificationsMenu.tsx`, `ProfileMenu.tsx`, `SystemStatusBadge.tsx`
- Modificar: `src/components/layout/AppShell.tsx` (incluir o Header)
- Teste: `Header.test.tsx`, `NotificationsMenu.test.tsx`, `SystemStatusBadge.test.tsx`

**Interfaces:**
- Consome: `useFilters().query/setQuery`, `useDashboardData()`, `SYSTEM_STATUS_LABEL`, `formatRelativeTime`
- Produz: `Header()`, `NotificationsMenu()`, `ProfileMenu()`, `SystemStatusBadge({ status }: { status: SystemStatus | undefined })`

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
// Header
await user.type(screen.getByRole('searchbox', { name: 'Buscar ativos, alertas e eventos' }), 'norte')
// o componente de teste lê useFilters().query → 'norte'
it('atalho "/" foca a busca', ...)

// SystemStatusBadge
render(<SystemStatusBadge status="operational" />)
expect(screen.getByText('Operacional')).toBeInTheDocument()
render(<SystemStatusBadge status={undefined} />)
expect(screen.getByText('Verificando…')).toBeInTheDocument()

// NotificationsMenu (com fetcher que retorna 3 alertas não reconhecidos)
expect(await screen.findByRole('button', { name: 'Notificações, 3 não lidas' })).toBeInTheDocument()
await user.click(screen.getByRole('button', { name: /Notificações/ }))
await user.click(screen.getByRole('button', { name: 'Reconhecer alerta Alerta 1' }))   // nome único por alerta
expect(screen.getByRole('button', { name: 'Notificações, 2 não lidas' })).toBeInTheDocument()
await user.click(screen.getByRole('link', { name: 'Ver todos os alertas' }))   // navega para /alertas
it('sem alertas pendentes mostra "Nenhuma notificação"', ...)

// ProfileMenu
await user.click(screen.getByRole('button', { name: 'Menu do perfil' }))
await user.click(screen.getByRole('menuitem', { name: 'Sair' }))
expect(await screen.findByText('Demonstração: autenticação não configurada.')).toBeInTheDocument()  // toast
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL

- [ ] **Passo 3: Implementar**

O header tem 48px de altura e borda inferior. O status do sistema é um ponto de 6px na cor do sinal + rótulo em mono. O menu de notificações mostra os 5 alertas não reconhecidos mais recentes. O perfil mostra "Operador · Turno A", a lista de atalhos de teclado dentro do próprio menu (`/` foca a busca, `Esc` limpa a busca e fecha menus) e o item "Sair" (toast via `sonner`). O tempo relativo das notificações é calculado a partir de `data.generatedAt`, não do relógio da máquina. O `<Toaster/>` fica no `AppShell`.

- [ ] **Passo 4: Rodar e ver passar** → PASS

- [ ] **Passo 5: Commit** — `feat: adiciona header com busca, notificações, perfil e status`

---

### Tarefa 8: Barra de filtros

**Arquivos:**
- Criar: `src/components/dashboard/FilterBar.tsx`
- Teste: `src/components/dashboard/FilterBar.test.tsx`

**Interfaces:**
- Consome: `useFilters()`, `PERIOD_LABEL`, `SEVERITY_LABEL`
- Produz: `FilterBar({ showSeverity = true }: { showSeverity?: boolean })`

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
await user.click(screen.getByRole('radio', { name: 'Últimos 7 dias' }))
// useFilters().period → '7d'
expect(screen.getByRole('radio', { name: 'Últimos 7 dias' })).toHaveAttribute('aria-checked', 'true')
await user.click(screen.getByRole('combobox', { name: 'Severidade' }))
await user.click(screen.getByRole('option', { name: 'Crítico' }))
// useFilters().severity → 'critical'
it('botão "Limpar filtros" aparece só com filtro ativo e restaura os padrões', ...)
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL
- [ ] **Passo 3: Implementar** com `ToggleGroup type="single"` (rótulos curtos visíveis `24h`/`7d`/`30d`, `aria-label` com o `PERIOD_LABEL`) e `Select` (Todas / Info / Aviso / Crítico).
- [ ] **Passo 4: Rodar e ver passar** → PASS
- [ ] **Passo 5: Commit** — `feat: adiciona barra de filtros de período e severidade`

---

### Tarefa 9: Cards de KPI

**Arquivos:**
- Criar: `src/components/dashboard/KpiCard.tsx`, `src/components/dashboard/KpiGrid.tsx`
- Teste: `KpiCard.test.tsx`, `KpiGrid.test.tsx`

**Interfaces:**
- Consome: `Kpi`, `AsyncStatus`, `formatNumber`, `formatMs`, `formatCompact`, `formatPercentDelta`
- Produz: `KpiCard({ kpi }: { kpi: Kpi })`, `KpiGrid({ kpis, status }: { kpis: Kpi[]; status: AsyncStatus })`

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
const kpi: Kpi = { id: 'avgLatency', label: 'Latência média', value: 128.4, unit: 'ms', delta: 12.3, goodWhen: 'down' }
render(<KpiCard kpi={kpi} />)
expect(screen.getByText('128 ms')).toBeInTheDocument()
const delta = screen.getByText('+12,3%')
expect(delta).toHaveAttribute('data-trend', 'bad')              // subiu, mas o bom é cair → âmbar
expect(screen.getByText('aumento de 12,3% em relação ao período anterior')).toHaveClass('sr-only')

render(<KpiCard kpi={{ ...kpi, id: 'assetsOnline', unit: 'count', value: 31, delta: 3, goodWhen: 'up' }} />)
expect(screen.getByText('+3,0%')).toHaveAttribute('data-trend', 'good')

render(<KpiCard kpi={{ ...kpi, value: NaN, delta: 0 }} />)       // Foco de revisão 3
expect(screen.getByText('—')).toBeInTheDocument()
expect(screen.getByText('0,0%')).toHaveAttribute('data-trend', 'neutral')

render(<KpiGrid kpis={[]} status="loading" />)                    // 4 skeletons com role="status"
render(<KpiGrid kpis={[]} status="empty" />)                      // "Sem indicadores para o período."
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL
- [ ] **Passo 3: Implementar**

Valor em JetBrains Mono, `text-2xl tabular-nums`. Tendência `good` em `--signal-ok`, `bad` em `--signal-warn` e `neutral` em `--muted-foreground`, com ícone de seta `aria-hidden`. A grade é de 4 colunas no `lg`, 2 no `sm` e 1 abaixo disso.

- [ ] **Passo 4: Rodar e ver passar** → PASS
- [ ] **Passo 5: Commit** — `feat: adiciona cards de KPI com indicação de tendência`

---

### Tarefa 10: Gráficos

**Arquivos:**
- Criar: `src/components/charts/ThroughputChart.tsx`, `src/components/charts/IncidentsBySeverityChart.tsx`, `src/components/charts/chart-data.ts`
- Teste: `src/components/charts/chart-data.test.ts`, `ThroughputChart.test.tsx`, `IncidentsBySeverityChart.test.tsx`

**Interfaces:**
- Consome: `ThroughputPoint`, `Alert`, `Period`, `Severity`, `PERIOD_LABEL`, `SEVERITY_LABEL`, `useFilters()`
- Produz:
  - `countBySeverity(alerts: Alert[]): Record<Severity, number>`
  - `summarizeThroughput(points: ThroughputPoint[]): { min: number; max: number; avg: number } | null`
  - `ThroughputChart({ data, period }: { data: ThroughputPoint[]; period: Period })`
  - `IncidentsBySeverityChart({ alerts }: { alerts: Alert[] })`, que lê e altera `useFilters().severity`

- [ ] **Passo 1: Escrever os testes que falham**

```ts
expect(countBySeverity([])).toEqual({ info: 0, warning: 0, critical: 0 })
expect(summarizeThroughput([])).toBeNull()
expect(summarizeThroughput([{ timestamp: 'a', eventsPerSec: 10 }, { timestamp: 'b', eventsPerSec: 30 }]))
  .toEqual({ min: 10, max: 30, avg: 20 })
```
```tsx
renderWithProviders(<ThroughputChart data={pts} period="24h" />)
expect(screen.getByRole('img', { name: /Ingestão de eventos por segundo, últimas 24 h/ })).toBeInTheDocument()
expect(screen.getByText(/Média/)).toBeInTheDocument()            // resumo textual (min/média/máx) visível

renderWithProviders(<IncidentsBySeverityChart alerts={alerts} />)
await user.click(screen.getByRole('button', { name: 'Crítico: 2' }))
// useFilters().severity → 'critical'; o botão fica com aria-pressed="true"
await user.click(screen.getByRole('button', { name: 'Crítico: 2' }))
// clicar de novo volta para 'all'
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL
- [ ] **Passo 3: Implementar**

`ThroughputChart` é um `LineChart` com linha verde de 1.5px, sem preenchimento em gradiente, grid horizontal em `--border`, eixos em mono 11px e `Tooltip` escuro com borda. `IncidentsBySeverityChart` é um `BarChart` horizontal (Info em cinza, Aviso em âmbar, Crítico em vermelho); clicar na barra alterna o filtro. Abaixo dele ficam botões-legenda com `aria-pressed`, que fazem a mesma coisa pelo teclado. Os dois ficam num wrapper `role="img"` com `aria-label` descritivo, dentro de um `ResponsiveContainer` de altura 220.

- [ ] **Passo 4: Rodar e ver passar** → PASS
- [ ] **Passo 5: Commit** — `feat: adiciona gráficos de ingestão e incidentes por severidade`

---

### Tarefa 11: Tabela de ativos

**Arquivos:**
- Criar: `src/lib/assets.ts`, `src/components/dashboard/AssetsTable.tsx`
- Teste: `src/lib/assets.test.ts`, `src/components/dashboard/AssetsTable.test.tsx`

**Interfaces:**
- Consome: `Asset`, `AssetStatus`, `matchesQuery`, `formatMs`, `formatRelativeTime`, `ASSET_STATUS_LABEL`, `REFERENCE_NOW`
- Produz:
  - `type AssetSortKey = 'name' | 'status' | 'latencyMs' | 'lastSeen'`
  - `filterAssets(assets: Asset[], opts: { query: string; status: AssetStatus | 'all' }): Asset[]`. A busca olha `name`, `id`, `region` e `type`.
  - `sortAssets(assets: Asset[], key: AssetSortKey, dir: 'asc' | 'desc'): Asset[]`, sem mutar a entrada. Ordem de status: `offline` < `degraded` < `online` em `asc`.
  - `AssetsTable({ assets, query, limit?, now? }: { assets: Asset[]; query: string; limit?: number; now?: Date })`

- [ ] **Passo 1: Escrever os testes que falham**

```ts
expect(filterAssets(assets, { query: 'ESTACAO', status: 'all' }).every(a => a.type === 'estacao')).toBe(true)  // Foco 1
expect(filterAssets(assets, { query: 'zzz', status: 'all' })).toEqual([])
expect(filterAssets(assets, { query: '', status: 'offline' }).every(a => a.status === 'offline')).toBe(true)
const copy = [...assets]; sortAssets(assets, 'latencyMs', 'desc'); expect(assets).toEqual(copy)
expect(sortAssets(assets, 'latencyMs', 'desc')[0].latencyMs).toBe(Math.max(...assets.map(a => a.latencyMs)))
```
```tsx
renderWithProviders(<AssetsTable assets={assets} query="" />)
await user.click(screen.getByRole('button', { name: 'Ordenar por latência' }))
expect(screen.getByRole('columnheader', { name: /Latência/ })).toHaveAttribute('aria-sort', 'ascending')
await user.click(screen.getByRole('tab', { name: 'Offline' }))
// todas as linhas do corpo mostram "Offline"
renderWithProviders(<AssetsTable assets={assets} query="zzz" />)
expect(screen.getByText('Nenhum ativo corresponde aos filtros.')).toBeInTheDocument()
renderWithProviders(<AssetsTable assets={assets} query="" limit={8} />)
expect(screen.getAllByRole('row')).toHaveLength(9)                     // cabeçalho + 8
expect(screen.getByRole('link', { name: 'Ver todos os 40 ativos' })).toHaveAttribute('href', '/ativos')
expect(screen.getByTestId('assets-scroll')).toHaveClass('overflow-x-auto')  // Foco 4
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL
- [ ] **Passo 3: Implementar**

`Table` do shadcn, linhas de 36px, ID e latência em mono, cabeçalho fixo (`sticky top-0`). Status com ponto colorido + rótulo, nunca só cor. Abas de status via `Tabs`. A tabela fica dentro de `<div data-testid="assets-scroll" class="overflow-x-auto">` com `min-w-[640px]`.

- [ ] **Passo 4: Rodar e ver passar** → PASS
- [ ] **Passo 5: Commit** — `feat: adiciona tabela de ativos com busca, filtro e ordenação`

---

### Tarefa 12: Alertas e feed de atividades

**Arquivos:**
- Criar: `src/components/dashboard/AlertsPanel.tsx`, `src/components/dashboard/ActivityFeed.tsx`
- Teste: `AlertsPanel.test.tsx`, `ActivityFeed.test.tsx`

**Interfaces:**
- Consome: `Alert`, `ActivityEvent`, `Severity`, `SEVERITY_LABEL`, `matchesQuery`, `formatRelativeTime`, `formatDateTime`
- Produz:
  - `AlertsPanel({ alerts, severity, query, onAcknowledge, limit?, now? }: { alerts: Alert[]; severity: Severity | 'all'; query: string; onAcknowledge(id: string): void; limit?: number; now?: Date })`
  - `ActivityFeed({ events, severity, query, limit?, now? }: { events: ActivityEvent[]; severity: Severity | 'all'; query: string; limit?: number; now?: Date })`

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
render(<AlertsPanel alerts={alerts} severity="critical" query="" onAcknowledge={fn} now={NOW} />)
// todos os itens listados têm o selo "Crítico"
await user.click(screen.getAllByRole('button', { name: /^Reconhecer alerta/ })[0])
expect(fn).toHaveBeenCalledWith(alerts.find(a => a.severity === 'critical' && !a.acknowledged)!.id)
it('alerta reconhecido mostra "Reconhecido" e não tem botão', ...)
it('ordena não reconhecidos primeiro, depois por data desc', ...)
it('sem resultados mostra "Nenhum alerta para os filtros atuais."', ...)

render(<ActivityFeed events={events} severity="all" query="" limit={8} now={NOW} />)
expect(screen.getAllByRole('listitem')).toHaveLength(8)
expect(screen.getAllByRole('listitem')[0].querySelector('time')).toHaveAttribute('datetime')
it('filtra por severidade e busca', ...)
it('sem eventos mostra "Nenhum evento registrado."', ...)
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL
- [ ] **Passo 3: Implementar**

Listas `<ol>` densas. Cada item tem uma barra de 2px na cor da severidade, título, ID do ativo em mono e um `<time>` com tempo relativo (data completa no `title`). O botão de reconhecer tem `aria-label="Reconhecer alerta {título}"`.

- [ ] **Passo 4: Rodar e ver passar** → PASS
- [ ] **Passo 5: Commit** — `feat: adiciona painel de alertas e feed de atividades`

---

### Tarefa 13: Montagem das páginas

**Arquivos:**
- Modificar: `src/pages/OverviewPage.tsx`, `AssetsPage.tsx`, `AlertsPage.tsx`, `EventsPage.tsx`
- Teste: `src/pages/OverviewPage.test.tsx`, `src/pages/pages.test.tsx`

**Interfaces:**
- Consome: tudo das Tarefas 5 a 12. Cada painel recebe `status={derivePanelStatus(status, itens.length)}` e `onRetry={retry}`.

Composição:
- **Visão geral:** `FilterBar`, `KpiGrid`, `ThroughputChart` (2/3) + `IncidentsBySeverityChart` (1/3), `AssetsTable limit={8}` (2/3) + `AlertsPanel limit={5}` (1/3), `ActivityFeed limit={8}`.
- **Ativos:** `FilterBar showSeverity={false}` + `AssetsTable`.
- **Alertas:** `FilterBar` + `AlertsPanel`.
- **Eventos:** `FilterBar` + `ActivityFeed`.

Em telas abaixo de `lg`, as colunas viram uma só.

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
it('mostra carregando e depois os painéis', async () => {
  renderWithProviders(<OverviewPage />, { fetcher: delayedFetcher })
  expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  expect(await screen.findByRole('region', { name: 'Ativos' })).not.toHaveAttribute('aria-busy', 'true')
})
it('erro e "Tentar novamente" recupera', async () => {                   // Foco 5
  const fetcher = vi.fn().mockRejectedValueOnce(new Error('x')).mockImplementation(okFetcher)
  renderWithProviders(<OverviewPage />, { fetcher })
  await user.click((await screen.findAllByRole('button', { name: 'Tentar novamente' }))[0])
  expect(await screen.findByText('Latência média')).toBeInTheDocument()
})
it('dados vazios mostram estado vazio em cada painel', ...)              // fetcher retorna o modo 'vazio'
it('trocar período refaz a busca com o novo período', ...)
it('busca no header filtra a tabela da visão geral', ...)               // usa routes completas
it('severidade crítica filtra alertas e destaca a barra do gráfico', ...)
it('cada página tem um h1 com o nome da seção', ...)                     // pages.test.tsx
```

- [ ] **Passo 2: Rodar e ver falhar** → FAIL
- [ ] **Passo 3: Implementar** a composição acima. Espaçamento: grid com `gap-3` e padding da página `p-4 md:p-6`.
- [ ] **Passo 4: Rodar e ver passar** → PASS
- [ ] **Passo 5: Conferir manualmente** com `npm run dev`: `/?simular=erro`, `/?simular=vazio` e `/?simular=lento` mostram os estados certos.
- [ ] **Passo 6: Commit** — `feat: monta páginas de visão geral, ativos, alertas e eventos`

---

### Tarefa 14: Acessibilidade e verificação final

**Arquivos:**
- Teste: `src/a11y.test.tsx`
- Modificar: o que o teste ou a revisão manual apontarem

- [ ] **Passo 1: Escrever o teste com axe**

```tsx
import { axe } from 'vitest-axe'
it.each(['/', '/ativos', '/alertas', '/eventos'])('%s sem violações de acessibilidade', async (route) => {
  const { container } = renderWithProviders(<AppRoutes />, { route })
  await screen.findByRole('heading', { level: 1 })
  expect(await axe(container)).toHaveNoViolations()
})
```

- [ ] **Passo 2: Rodar** — `npm test -- --run src/a11y.test.tsx`. Corrigir as violações até passar.
- [ ] **Passo 3: Revisar manualmente** com `npm run dev`:
  - Em 360px, 768px e 1440px, a página não tem scroll horizontal e a tabela rola dentro do painel.
  - Navegação só por teclado (Tab, Enter, Esc, `/`) com foco sempre visível (`ring` verde de 1px).
  - Sem gradientes e só com os acentos permitidos.
- [ ] **Passo 4: Verificação completa** — `npm run lint && npm run typecheck && npm test -- --run && npm run build`. Esperado: tudo passa, sem warnings de TypeScript.
- [ ] **Passo 5: Commit** — `test: adiciona verificação de acessibilidade com axe`
