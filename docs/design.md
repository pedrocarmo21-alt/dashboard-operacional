# Design do Dashboard

Dashboard moderno, profissional e tecnológico, com aparência de software operacional de alto nível. A inspiração é a identidade visual e a experiência de uso dos sites da Palantir e da Anduril Industries, **sem copiar diretamente seus layouts ou marcas**.

## Direção visual

- Design minimalista, sofisticado e orientado a dados.
- Tema escuro, com preto, grafite e tons de cinza.
- Tipografia moderna, hierarquia visual clara e espaçamento consistente.
- Detalhes em verde ou âmbar para destacar informações importantes.
- Painéis com bordas discretas, tabelas técnicas, gráficos e indicadores.
- Interface densa, mas organizada e fácil de navegar.
- Sem elementos decorativos desnecessários, gradientes exagerados ou aparência de template genérico.

## Estrutura

| Área | Conteúdo |
|------|----------|
| Sidebar | Navegação com ícones minimalistas |
| Header | Pesquisa, notificações, perfil e status do sistema |
| KPIs | Cards com indicadores importantes |
| Dados | Gráficos interativos e tabelas de dados |
| Atividade | Atividades recentes, alertas e eventos |
| Controles | Filtros funcionais e navegação entre seções |

O layout deve ser responsivo para desktop e dispositivos móveis.

## Stack

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts para os gráficos

## Diretrizes de implementação

1. Analisar o projeto existente antes de modificar qualquer arquivo.
2. Preservar a arquitetura e as funcionalidades já implementadas.
3. Reutilizar componentes e dependências existentes quando possível.
4. Criar componentes reutilizáveis e manter o código organizado.
5. Usar dados fictícios realistas enquanto não houver uma API.
6. Garantir que botões, filtros, menus e gráficos funcionem.
7. Implementar estados de carregamento, ausência de dados e erro quando necessário.
8. Priorizar acessibilidade, desempenho e consistência visual.

## Processo

Antes de implementar: inspecionar os arquivos do projeto, identificar a stack existente e apresentar um plano breve. Depois, implementar a solução e executar as verificações disponíveis (lint, type-check, build, testes).
