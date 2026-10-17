import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const SHORTCUTS = [
  ['Focar a busca', '/'],
  ['Limpar a busca', 'Esc'],
  ['Fechar menus', 'Esc'],
]

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
        {/* Um menu só pode conter itens: os atalhos são itens desabilitados, com a tecla ao lado. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Atalhos de teclado</DropdownMenuLabel>
          {SHORTCUTS.map(([action, key]) => (
            <DropdownMenuItem key={action} disabled className="text-xs data-disabled:opacity-100">
              {action}
              <DropdownMenuShortcut className="font-mono">{key}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast('Demonstração: autenticação não configurada.')}>
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
