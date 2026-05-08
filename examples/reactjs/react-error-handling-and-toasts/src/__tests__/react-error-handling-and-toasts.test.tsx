import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const klever = {
  isConnected: false,
  address: undefined,
  connect: vi.fn(),
  disconnect: vi.fn(),
}

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => klever,
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const { App } = await import('../App')

describe('react-error-handling-and-toasts', () => {
  it('shows a warn toast for ValidationError', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('trigger-validation'))
    const toasts = screen.getByTestId('toasts')
    expect(toasts.textContent).toContain('Invalid input')
    expect(toasts.querySelector('[data-severity="warn"]')).not.toBeNull()
  })

  it('shows an error toast for NetworkError', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('trigger-network'))
    const toasts = screen.getByTestId('toasts')
    expect(toasts.textContent).toContain('Network problem')
    expect(toasts.querySelector('[data-severity="error"]')).not.toBeNull()
  })

  it('handles plain Error as Unknown error', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('trigger-unknown'))
    expect(screen.getByTestId('toasts').textContent).toContain('Unknown error')
  })

  it('dismisses a toast', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('trigger-tx'))
    const dismissButton = await screen.findByText('×')
    await user.click(dismissButton)
    expect(screen.getByTestId('toasts').textContent).not.toContain('Transaction failed')
  })
})
