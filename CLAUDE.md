# CLAUDE.md

## Objetivo do projeto

Dashboard operacional com tema escuro, denso e orientado a dados, inspirado na experiência visual da Palantir e da Anduril, sem copiar layouts ou marcas. Inclui sidebar, header com pesquisa/notificações/status, cards de KPI, gráficos interativos, tabelas, feed de atividades e alertas, filtros funcionais e layout responsivo. Enquanto não houver API, usa dados fictícios realistas.

A especificação completa de design está em [`docs/design.md`](docs/design.md).

## Stack

- **Vite** — build e servidor de desenvolvimento
- **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** — estilos e componentes de interface
- **Recharts** — gráficos
- **Vitest** + **React Testing Library** — testes
- **ESLint** — lint
- **npm** — gerenciador de pacotes

## Comandos

> O projeto ainda não foi inicializado. Estes são os scripts previstos para o `package.json`.

```bash
npm install          # instalar dependências
npm run dev          # servidor de desenvolvimento
npm run build        # type-check + build de produção
npm run preview      # servir o build localmente
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest em modo watch
npm test -- --run    # Vitest uma vez (CI / verificação)
```

Antes de considerar uma tarefa concluída, rode `npm run lint`, `npm run typecheck` e `npm test -- --run`.

## Estrutura de pastas

```
.
├── docs/
│   └── design.md            # especificação de design
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # componentes gerados pelo shadcn/ui
│   │   ├── layout/          # Sidebar, Header, AppShell
│   │   ├── charts/          # wrappers de gráficos Recharts
│   │   └── dashboard/       # KPIs, tabelas, feed de atividades, alertas
│   ├── data/                # dados fictícios (mocks)
│   ├── hooks/               # hooks reutilizáveis (filtros, fetch simulado)
│   ├── lib/                 # utilitários (cn, formatadores)
│   ├── pages/               # seções navegáveis do dashboard
│   ├── types/               # tipos TypeScript compartilhados
│   ├── test/                # setup do Vitest
│   ├── App.tsx
│   └── main.tsx
├── CLAUDE.md
└── package.json
```

Testes ficam ao lado do código que testam: `Componente.tsx` e `Componente.test.tsx`.

## Regras

- **Explique as decisões em português.** Isso vale para respostas, descrições de PR e comentários que justificam uma escolha.
- **Escreva testes junto com cada funcionalidade.** Nenhuma funcionalidade é entregue sem testes que cubram o comportamento principal e os estados de carregamento, vazio e erro, quando existirem.
- **Faça commits pequenos com mensagens claras.** Um commit por mudança lógica. A mensagem diz o que mudou e por quê, no formato `tipo: descrição` (ex.: `feat: adiciona filtro por período nos KPIs`).
