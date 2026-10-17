import { expect, type Page, test } from '@playwright/test'

const WIDTHS = [360, 768, 1440]
const ROUTES = [
  ['/', 'Visão geral'],
  ['/ativos', 'Ativos'],
  ['/alertas', 'Alertas'],
  ['/eventos', 'Eventos'],
] as const

async function open(page: Page, route: string, title: string) {
  await page.goto(route)
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  // Espera os dados (o status do sistema sai de "desconhecido") e, na visão geral, os gráficos.
  await expect(page.getByTestId('system-status')).not.toHaveAttribute('data-signal', 'unknown')
  if (route === '/') await expect(page.getByRole('figure', { name: /Ingestão de eventos/ })).toBeVisible()
}

const pageScrollsHorizontally = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    for (const [route, title] of ROUTES) {
      test(`${route} não rola na horizontal`, async ({ page }) => {
        await open(page, route, title)
        await page.screenshot({ path: `test-results/screens/${width}${route.replace(/\//g, '_') || '_'}.png`, fullPage: true })
        expect(await pageScrollsHorizontally(page)).toBe(false)
      })
    }

    test('a navegação certa aparece para a largura', async ({ page }) => {
      await open(page, '/', 'Visão geral')
      const sidebar = page.getByRole('navigation', { name: 'Principal' })
      const menuButton = page.getByRole('button', { name: 'Abrir menu' })
      if (width < 768) {
        await expect(sidebar).toBeHidden()
        await expect(menuButton).toBeVisible()
      } else {
        await expect(sidebar).toBeVisible()
        await expect(menuButton).toBeHidden()
      }
    })
  })
}

test.describe('360px: tabela larga', () => {
  test.use({ viewport: { width: 360, height: 900 } })

  test('a tabela de ativos rola dentro do próprio painel', async ({ page }) => {
    await open(page, '/ativos', 'Ativos')
    const container = page.getByRole('table', { name: 'Ativos' }).locator('..')
    const scrolls = await container.evaluate((el) => el.scrollWidth > el.clientWidth)
    expect(scrolls).toBe(true)
    expect(await pageScrollsHorizontally(page)).toBe(false)
  })
})

test.describe('foco visível', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('o primeiro Tab mostra o link de pular, com anel visível', async ({ page }) => {
    await open(page, '/', 'Visão geral')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    const box = await skip.boundingBox()
    expect(box!.width).toBeGreaterThan(40)
  })

  test('links e botões focados por teclado têm anel sólido (sem transparência)', async ({ page }) => {
    await open(page, '/', 'Visão geral')
    const link = page.getByRole('link', { name: 'Ver todos os 40 ativos' })
    await link.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()
    const ring = await link.evaluate((el) => {
      const s = getComputedStyle(el)
      return { outline: s.outlineStyle !== 'none' ? s.outlineColor : '', shadow: s.boxShadow }
    })
    const color = ring.outline || ring.shadow
    expect(color).not.toBe('')
    // Uma cor com canal alfa abaixo de 1 aparece como rgba(..., 0.x) ou color(... / 0.x).
    expect(color).not.toMatch(/rgba\([^)]*,\s*0?\.\d+\)|\/\s*0?\.\d+/)
  })
})
