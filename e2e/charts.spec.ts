import { expect, test } from '@playwright/test'

for (const width of [360, 1440]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    test('nenhum rótulo de eixo do gráfico de ingestão fica cortado', async ({ page }) => {
      await page.goto('/')
      const figure = page.getByRole('figure', { name: /Ingestão de eventos/ })
      await expect(figure).toBeVisible()
      const clipped = await figure.evaluate((fig) => {
        const svg = fig.querySelector('svg.recharts-surface')!.getBoundingClientRect()
        return [...fig.querySelectorAll('.recharts-cartesian-axis-tick-value')]
          .map((t) => ({ text: t.textContent, box: t.getBoundingClientRect() }))
          .filter(({ box }) => box.left < svg.left - 0.5 || box.right > svg.right + 0.5)
          .map(({ text }) => text)
      })
      expect(clipped).toEqual([])
    })
  })
}
