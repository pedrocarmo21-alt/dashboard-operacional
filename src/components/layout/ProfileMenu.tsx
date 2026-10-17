import { Keyboard, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Perfil do operador. Sem autenticação real: "Sair" só avisa que é uma demonstração. */
export function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Menu do perfil">
          <span aria-hidden="true" className="font-mono text-xs">
            OP
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm text-foreground">Operador</span>
          <span className="font-mono text-xs font-normal text-muted-foreground">Turno A</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Um item de verdade, alcançável pelas setas; a lista aparece num aviso. */}
        <DropdownMenuItem
          onSelect={() =>
            toast('Atalhos de teclado', { description: '/ foca a busca · Esc limpa a busca e fecha menus' })
          }
        >
          <Keyboard aria-hidden="true" />
          Atalhos de teclado
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast('Demonstração: autenticação não configurada.')}>
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
