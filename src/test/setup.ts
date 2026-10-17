import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

afterEach(() => {
  cleanup()
})

// O jsdom não implementa estas APIs; Recharts e Radix dependem delas.

// Informa um tamanho fixo ao observar, para o ResponsiveContainer do Recharts ter onde desenhar.
class ResizeObserverStub {
  private callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    const contentRect = { x: 0, y: 0, top: 0, left: 0, width: 800, height: 400, right: 800, bottom: 400 }
    this.callback([{ target, contentRect } as unknown as ResizeObserverEntry], this)
  }
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub

window.matchMedia ??= (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})

Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}
