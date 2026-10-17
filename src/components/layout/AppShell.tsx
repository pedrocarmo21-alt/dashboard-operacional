import { Outlet } from 'react-router'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

/** Estrutura de todas as páginas: link de pular, sidebar, barra superior e conteúdo. */
export function AppShell() {
  return (
    <div className="flex min-h-svh">
      <a
        href="#conteudo"
        className="sr-only rounded-sm bg-popover px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:ring-1 focus:ring-ring"
      >
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background px-2 md:px-6">
          <MobileNav />
        </div>
        <main id="conteudo" tabIndex={-1} className="flex-1 p-4 outline-none md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
