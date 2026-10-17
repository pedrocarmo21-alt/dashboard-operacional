import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('system-status')).not.toHaveAttribute('data-signal', 'unknown')
})

const focusIsOnBody = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.activeElement === document.body)

test('reconhecer pelo teclado na visão geral mantém o foco no painel de alertas', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Alertas', exact: true })
  const first = panel.getByRole('button', { name: /^Reconhecer alerta/ }).first()
  await first.focus()
  await page.keyboard.press('Enter')
  expect(await focusIsOnBody(page)).toBe(false)
  expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true)
})

test('reconhecer pelo teclado no sino leva o foco ao próximo alerta, com o menu aberto', async ({ page }) => {
  await page.getByRole('button', { name: /^Notificações/ }).click()
  const list = page.getByRole('list', { name: 'Alertas pendentes' })
  await list.getByRole('button').first().focus()
  await page.keyboard.press('Enter')
  await expect(list).toBeVisible()
  await expect(list.getByRole('button').first()).toBeFocused()
})

test('Esc fecha o menu do perfil e devolve o foco ao botão', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Menu do perfil' })
  await trigger.click()
  await expect(page.getByRole('menu')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('Esc fecha o sino e devolve o foco ao botão', async ({ page }) => {
  const trigger = page.getByRole('button', { name: /^Notificações/ })
  await trigger.click()
  await expect(page.getByRole('list', { name: 'Alertas pendentes' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('list', { name: 'Alertas pendentes' })).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('"/" foca a busca de qualquer lugar da página', async ({ page }) => {
  await page.getByRole('heading', { level: 1 }).click()
  await page.keyboard.press('/')
  await expect(page.getByRole('searchbox', { name: 'Buscar ativos, alertas e eventos' })).toBeFocused()
})

test('navegar pelo teclado leva o foco ao título da nova página', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Eventos' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Eventos' })).toBeFocused()
})
