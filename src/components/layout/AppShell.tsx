import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

/** Estrutura de todas as páginas: link de pular, sidebar, header, conteúdo e notificações toast. */
export function AppShell() {
  const { pathname } = useLocation()

  // Numa SPA o leitor de tela não percebe a troca de página: ao navegar, o foco vai para o
  // título da nova página, que é lido. Compara com a rota anterior (e não com uma marca de
  // "primeira vez"), porque o StrictMode roda o efeito duas vezes na montagem.
  const previousPath = useRef(pathname)
  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    document.querySelector<HTMLElement>('#conteudo h1')?.focus()
  }, [pathname])

  return (
    <div className="flex min-h-svh">
      <a
        href="#conteudo"
        className="sr-only rounded-sm bg-popover px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:ring-1 focus:ring-ring focus:outline-none"
      >
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="conteudo" tabIndex={-1} className="flex-1 p-4 outline-none md:p-6">
          {/* Um erro numa página fica dentro do shell; trocar de rota tenta de novo. */}
          <ErrorBoundary resetKey={pathname} fallback={<PageError />}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

function PageError() {
  return (
    <div role="alert" className="flex flex-col items-start gap-2">
      <p className="text-lg font-medium">Algo deu errado nesta página.</p>
      <p className="text-sm text-muted-foreground">Escolha outra seção no menu ou recarregue a página.</p>
    </div>
  )
}
