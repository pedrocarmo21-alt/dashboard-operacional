import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { createMockData } from '@/data/mock'
import { DashboardDataProvider, type Fetcher } from '@/hooks/dashboard-data'
import { FiltersProvider } from '@/hooks/filters'

interface Options {
  route?: string
  fetcher?: Fetcher
}

// Sem latência: os testes não esperam os 400 ms da API simulada.
const immediateFetcher: Fetcher = (period) => Promise.resolve(createMockData(period))

/** Renderiza dentro de rota, filtros e dados, como o app faz. */
export function renderWithProviders(ui: ReactElement, { route = '/', fetcher = immediateFetcher }: Options = {}) {
  const user = userEvent.setup()
  const result = render(
    <MemoryRouter initialEntries={[route]}>
      <FiltersProvider>
        <DashboardDataProvider fetcher={fetcher}>{ui}</DashboardDataProvider>
      </FiltersProvider>
    </MemoryRouter>,
  )
  return { ...result, user }
}
