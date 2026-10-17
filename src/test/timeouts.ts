// O primeiro import de um gráfico sob demanda transforma o Recharts inteiro; com a suíte
// rodando em paralelo, isso passa do 1 s padrão do findBy.
export const LAZY_CHART = { timeout: 8_000 }
