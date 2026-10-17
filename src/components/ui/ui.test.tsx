import { act, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it } from 'vitest'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './sheet'
import { Toaster } from './sonner'

const sources = import.meta.glob<string>('./*.tsx', { query: '?raw', import: 'default', eager: true })
const componentSources = Object.entries(sources).filter(([file]) => !file.endsWith('.test.tsx'))

describe('componentes shadcn (ajustes do projeto)', () => {
  it('o botão de fechar do Sheet está em português', () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navegação</SheetDescription>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })

  it('o Toaster usa sempre o tema escuro e rótulos em português', async () => {
    render(<Toaster closeButton />)
    act(() => {
      toast('Olá')
    })
    expect(await screen.findByRole('region', { name: /^Avisos do sistema/ })).toBeInTheDocument()
    expect(document.querySelector('[data-sonner-toaster]')).toHaveAttribute('data-sonner-theme', 'dark')
    expect(screen.getByRole('button', { name: 'Fechar notificação' })).toBeInTheDocument()
  })

  it.each(componentSources)('%s importa cn de @/lib/utils', (_file, source) => {
    expect(source).not.toMatch(/from ["']cn["']/)
  })

  it.each(componentSources)('%s usa anel de foco sólido de 1px', (_file, source) => {
    expect(source).not.toMatch(/focus-visible:ring-(3|\[3px\])\b/)
    expect(source).not.toMatch(/focus-visible:ring-ring\/50/)
  })

  it('nenhum componente depende de next-themes', () => {
    for (const [, source] of componentSources) expect(source).not.toMatch(/next-themes/)
  })
})
