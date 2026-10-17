import { describe, expect, it } from 'vitest'
import html from '../index.html?raw'
import css from './index.css?raw'
import main from './main.tsx?raw'
import { contrast, luminance } from './test/contrast'

// Valores fixados nas Restrições globais de docs/plano.md.
const TOKENS = {
  '--background': '#0a0a0b',
  '--card': '#111113',
  '--muted': '#1a1a1d',
  '--border': '#26262b',
  '--foreground': '#e4e4e7',
  '--muted-foreground': '#8b8b94',
  '--signal-ok': '#3ddc84',
  '--signal-warn': '#f5a623',
  '--signal-critical': '#ef4444',
  '--radius': '0.25rem',
}

function rootVars(): Record<string, string> {
  const block = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ''
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))
}

const vars = rootVars()
const doc = new DOMParser().parseFromString(html, 'text/html')

describe('tokens', () => {
  it.each(Object.entries(TOKENS))('%s vale %s no :root', (token, value) => {
    expect(vars[token]).toBe(value)
  })

  it.each(Object.keys(TOKENS))('%s é declarado uma única vez', (token) => {
    const declarations = css.match(new RegExp(`^\\s*${token}:`, 'gm')) ?? []
    expect(declarations).toHaveLength(1)
  })

  it('expõe os sinais como cores do Tailwind', () => {
    expect(css).toMatch(/--color-signal-ok:\s*var\(--signal-ok\)/)
    expect(css).toMatch(/--color-signal-warn:\s*var\(--signal-warn\)/)
    expect(css).toMatch(/--color-signal-critical:\s*var\(--signal-critical\)/)
  })
})

describe('só tema escuro', () => {
  it('não tem seletor ou media query de tema claro', () => {
    expect(css).not.toMatch(/\.light\b|prefers-color-scheme:\s*light/)
  })

  it.each(['--background', '--card', '--popover', '--muted', '--accent', '--secondary', '--sidebar'])(
    '%s é uma superfície escura',
    (token) => {
      expect(luminance(vars[token])).toBeLessThan(0.05)
    },
  )
})

describe('contraste (WCAG)', () => {
  it.each([
    ['--foreground', '--background', 4.5],
    ['--muted-foreground', '--background', 4.5],
    ['--muted-foreground', '--card', 4.5],
    ['--muted-foreground', '--popover', 4.5],
    ['--muted-foreground', '--muted', 4.5],
    ['--signal-ok', '--card', 4.5],
    ['--signal-warn', '--card', 4.5],
    ['--signal-critical', '--card', 4.5],
    ['--ring', '--background', 3],
    ['--ring', '--popover', 3],
    ['--input', '--background', 3],
    ['--input', '--card', 3],
    ['--chart-1', '--card', 3],
    ['--chart-2', '--card', 3],
    ['--chart-3', '--card', 3],
    ['--chart-4', '--card', 3],
    ['--chart-5', '--card', 3],
  ] as const)('%s sobre %s ≥ %d:1', (fg, bg, min) => {
    expect(contrast(vars[fg], vars[bg])).toBeGreaterThanOrEqual(min)
  })

  it('popover se distingue do card', () => {
    expect(vars['--popover']).not.toBe(vars['--card'])
  })

  it('item destacado de menu/select tem fundo próprio e contorno no anel', () => {
    expect(vars['--accent']).not.toBe(vars['--muted'])
    expect(css).toMatch(/\[data-highlighted\]\s*\{[^}]*outline:\s*1px solid var\(--ring\)/)
  })
})

describe('fontes', () => {
  it('usa Inter na interface e JetBrains Mono para dados', () => {
    expect(css).toMatch(/--font-sans:\s*'Inter Variable'/)
    expect(css).toMatch(/--font-mono:\s*'JetBrains Mono Variable'/)
    expect(css).not.toMatch(/geist/i)
  })

  it('carrega as fontes localmente pelo @fontsource', () => {
    expect(main).toMatch(/import '@fontsource-variable\/inter'/)
    expect(main).toMatch(/import '@fontsource-variable\/jetbrains-mono'/)
  })

  it('não carrega nada de CDN', () => {
    expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic|<link[^>]+rel="stylesheet"/)
  })
})

describe('index.html', () => {
  it('é pt-BR e escuro', () => {
    expect(doc.documentElement.lang).toBe('pt-BR')
    expect(doc.documentElement.classList.contains('dark')).toBe(true)
    expect(doc.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('dark')
  })

  it('tem título próprio', () => {
    expect(doc.title).toBe('Dashboard Operacional')
  })

  it('pinta o fundo escuro antes do bundle carregar', () => {
    expect(doc.head.querySelector('style')?.textContent).toMatch(/background:\s*#0a0a0b/)
  })
})
