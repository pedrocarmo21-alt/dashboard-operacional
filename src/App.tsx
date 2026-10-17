import { BrowserRouter, type RouteObject, useRoutes } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardDataProvider } from '@/hooks/dashboard-data'
import { FiltersProvider } from '@/hooks/filters'
import { AlertsPage } from '@/pages/AlertsPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { EventsPage } from '@/pages/EventsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OverviewPage } from '@/pages/OverviewPage'

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'ativos', element: <AssetsPage /> },
      { path: 'alertas', element: <AlertsPage /> },
      { path: 'eventos', element: <EventsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export function AppRoutes() {
  return useRoutes(routes)
}

function App() {
  return (
    <BrowserRouter>
      <FiltersProvider>
        <DashboardDataProvider>
          <AppRoutes />
        </DashboardDataProvider>
      </FiltersProvider>
    </BrowserRouter>
  )
}

export default App
