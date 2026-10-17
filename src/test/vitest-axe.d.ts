// Os tipos do vitest-axe 0.1 estendem o namespace `Vi`, que o Vitest 5 não usa mais.
import type { AxeMatchers } from 'vitest-axe/matchers'

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
