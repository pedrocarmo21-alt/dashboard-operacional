// Gera docs/apresentacao_projeto.pdf a partir de docs/apresentacao/modelo.html.
//
// Uso (na raiz do projeto, com o Node do .nvmrc):  node docs/apresentacao/gerar-pdf.mjs
// Prévia em PNG de cada página (opcional):           APRESENTACAO_PREVIEW=<pasta> node docs/apresentacao/gerar-pdf.mjs
//
// Passos: sobe o app com o Vite, tira as capturas de tela com o Playwright (incluindo os
// estados ?simular=), conta os testes, preenche o modelo e imprime o PDF no Chromium.
// No fim, confere se nenhuma página transborda, para não sair texto cortado.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const output = join(root, 'docs/apresentacao_projeto.pdf')

const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

// ---------- Números do projeto (lidos, não digitados) ----------
function countTests() {
  const dir = mkdtempSync(join(tmpdir(), 'apresentacao-'))
  const report = join(dir, 'vitest.json')
  try {
    try {
      run('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${report}`])
    } catch {
      // Falha de teste também gera o relatório; o número de aprovados é o que vai para o PDF.
    }
    const json = JSON.parse(readFileSync(report, 'utf8'))
    if (json.numFailedTests > 0) console.warn(`Aviso: ${json.numFailedTests} testes falhando.`)
    const list = run('npx', ['playwright', 'test', '--list'])
    const e2e = Number(list.match(/Total: (\d+) tests?/)?.[1] ?? 0)
    return { unitTests: json.numPassedTests, unitFiles: json.testResults.length, e2eTests: e2e }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// ---------- Capturas de tela ----------
async function captureScreens(browser, baseUrl) {
  const shots = {}
  const ready = async (page) => {
    await page.locator('[data-testid="system-status"]:not([data-signal="unknown"])').waitFor()
  }
  const snap = async (name, page, opts = {}) => {
    const buffer = await page.screenshot({ type: 'jpeg', quality: 88, ...opts })
    shots[name] = `data:image/jpeg;base64,${buffer.toString('base64')}`
  }
  const open = async (path, viewport, scale = 2) => {
    const context = await browser.newContext({ viewport, deviceScaleFactor: scale, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(baseUrl + path)
    return { page, context }
  }

  // Visão geral: capa (recorte do topo) e página inteira.
  {
    const { page, context } = await open('/', { width: 1440, height: 900 })
    await ready(page)
    await page.getByRole('figure', { name: /Ingestão de eventos/ }).waitFor()
    await page.getByRole('figure', { name: 'Alertas por severidade' }).waitFor()
    await page.waitForTimeout(600)
    await snap('overview-hero', page, { clip: { x: 0, y: 0, width: 1440, height: 760 } })
    await snap('overview-full', page, { fullPage: true })
    await context.close()
  }

  // Alertas, depois de reconhecer dois, para mostrar os dois grupos.
  {
    const { page, context } = await open('/alertas', { width: 1100, height: 900 })
    await ready(page)
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: /^Reconhecer alerta/ }).first().click()
    await snap('alerts', page, { clip: { x: 0, y: 0, width: 1100, height: 700 } })
    await context.close()
  }

  // Menu de notificações aberto.
  {
    const { page, context } = await open('/', { width: 1100, height: 900 })
    await ready(page)
    await page.getByRole('button', { name: /^Notificações/ }).click()
    await page.getByRole('list', { name: 'Alertas pendentes' }).waitFor()
    await page.waitForTimeout(300)
    await snap('notifications', page, { clip: { x: 560, y: 0, width: 540, height: 620 } })
    await context.close()
  }

  // Celular.
  {
    const { page, context } = await open('/', { width: 390, height: 844 }, 3)
    await ready(page)
    await page.waitForTimeout(400)
    await snap('mobile', page)
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await page.getByRole('dialog').waitFor()
    await page.waitForTimeout(400)
    await snap('mobile-menu', page)
    await context.close()
  }

  // Estados: carregando (modo lento), vazio e erro.
  const stateViewport = { width: 960, height: 560 }
  {
    const { page, context } = await open('/?simular=lento', stateViewport)
    await page.getByTestId('panel-skeleton').first().waitFor()
    await snap('loading', page)
    await context.close()
  }
  {
    const { page, context } = await open('/?simular=vazio', stateViewport)
    await page.getByText('Nenhum ativo cadastrado.').waitFor()
    await snap('empty', page)
    await context.close()
  }
  {
    const { page, context } = await open('/?simular=erro', stateViewport)
    await page.getByRole('button', { name: 'Tentar novamente' }).waitFor()
    await snap('error', page)
    await context.close()
  }
  return shots
}

// ---------- Fontes do app, embutidas ----------
function fontFaces() {
  const face = (family, file) => {
    const data = readFileSync(join(root, 'node_modules/@fontsource-variable', file)).toString('base64')
    return `@font-face { font-family: '${family}'; font-style: normal; font-weight: 100 900; font-display: block; src: url(data:font/woff2;base64,${data}) format('woff2'); }`
  }
  return [
    face('Inter Variable', 'inter/files/inter-latin-wght-normal.woff2'),
    face('JetBrains Mono Variable', 'jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'),
  ].join('\n')
}

// ---------- Principal ----------
console.log('Contando testes…')
const counts = countTests()
const commits = run('git', ['rev-list', '--count', 'HEAD']).trim()
const date = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())

console.log('Subindo o app…')
const server = await createServer({ root, logLevel: 'error', server: { port: 5190, strictPort: false } })
await server.listen()
const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '')

const browser = await chromium.launch()
try {
  console.log('Capturando telas…')
  const shots = await captureScreens(browser, baseUrl)

  const values = {
    fonts: fontFaces(),
    date: date.charAt(0).toUpperCase() + date.slice(1),
    unitTests: String(counts.unitTests),
    unitTestsRounded: String(Math.floor(counts.unitTests / 100) * 100),
    unitFiles: String(counts.unitFiles),
    e2eTests: String(counts.e2eTests),
    commits,
  }
  let html = readFileSync(join(here, 'modelo.html'), 'utf8')
  html = html.replace(/\{\{shot:([\w-]+)\}\}/g, (_, name) => {
    if (!shots[name]) throw new Error(`Captura inexistente: ${name}`)
    return shots[name]
  })
  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Valor inexistente no modelo: ${key}`)
    return values[key]
  })

  console.log('Gerando o PDF…')
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.emulateMedia({ media: 'print' })

  // Numeração: rodapés e sumário a partir da posição real de cada seção.
  await page.evaluate(() => {
    const pages = [...document.querySelectorAll('.page')]
    const pad = (n) => String(n).padStart(2, '0')
    pages.forEach((el, i) => el.querySelectorAll('.pgnum').forEach((n) => (n.textContent = pad(i + 1))))
    document.querySelectorAll('[data-for]').forEach((n) => {
      const target = document.getElementById(n.dataset.for)
      n.textContent = pad(pages.indexOf(target.closest('.page')) + 1)
    })
  })

  // Prévia opcional das páginas em PNG, para revisão visual.
  const preview = process.env.APRESENTACAO_PREVIEW
  if (preview) {
    const pageEls = await page.locator('.page').all()
    for (const [i, el] of pageEls.entries()) await el.screenshot({ path: join(preview, `pagina-${String(i + 1).padStart(2, '0')}.png`) })
  }

  // Verificação: nenhuma página com conteúdo além do limite da folha A4.
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll('.page')].flatMap((pageEl, i) => {
      const limit = pageEl.getBoundingClientRect().bottom
      const footer = pageEl.querySelector('.footer')?.getBoundingClientRect().top ?? limit
      const worst = Math.max(
        ...[...pageEl.querySelectorAll(':scope > *:not(.footer)')].map((el) => el.getBoundingClientRect().bottom),
      )
      return worst > footer - 2 ? [`página ${i + 1}: conteúdo ${Math.ceil(worst - footer + 2)}px além do rodapé`] : []
    }),
  )
  if (overflow.length) throw new Error(`Conteúdo transbordando:\n${overflow.join('\n')}`)

  await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true })
  console.log(`PDF salvo em ${output}`)
} finally {
  await browser.close()
  await server.close()
}
