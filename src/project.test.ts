import { describe, expect, it } from 'vitest'
import nvmrc from '../.nvmrc?raw'
import pkg from '../package.json'

const nodeMajor = nvmrc.trim()

describe('projeto', () => {
  it('não tem sobras da demo do template Vite', () => {
    const leftovers = import.meta.glob(['./assets/**', './App.css'])
    expect(Object.keys(leftovers)).toEqual([])
  })

  it('engines.node aceita a versão do .nvmrc', () => {
    expect(pkg.engines.node).toMatch(new RegExp(`^>=${nodeMajor}\\.\\d+$`))
  })

  it('@types/node acompanha a versão do Node do .nvmrc', () => {
    expect(pkg.devDependencies['@types/node']).toMatch(new RegExp(`^\\^${nodeMajor}\\.`))
  })

  it('não depende de next-themes (tema único)', () => {
    expect(Object.keys(pkg.dependencies)).not.toContain('next-themes')
  })
})
