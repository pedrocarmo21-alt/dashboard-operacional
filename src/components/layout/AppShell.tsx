import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

/** Estrutura de todas as páginas: link de pular, sidebar, header, conteúdo e notificações toast. */
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
        <Header />
        <main id="conteudo" tabIndex={-1} className="flex-1 p-4 outline-none md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
