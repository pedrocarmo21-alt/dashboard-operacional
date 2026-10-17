import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import App from './App'

describe('acessibilidade', () => {
  it('App sem violações do axe', async () => {
    const { container } = render(<App />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
