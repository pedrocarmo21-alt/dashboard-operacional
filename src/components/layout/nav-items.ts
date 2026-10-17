import { Activity, Boxes, LayoutDashboard, type LucideIcon, TriangleAlert } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/ativos', label: 'Ativos', icon: Boxes },
  { to: '/alertas', label: 'Alertas', icon: TriangleAlert },
  { to: '/eventos', label: 'Eventos', icon: Activity },
]
