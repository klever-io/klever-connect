import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const klever = {
  isConnected: false,
  address: undefined as string | undefined,
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

describe('react-staking-flow-end-to-end', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders all six stage entries with sibling paths', () => {
    render(<App />)
    expect(screen.getByTestId('stage-idle')).toBeInTheDocument()
    expect(screen.getByTestId('stage-frozen').textContent).toContain('freeze-for-staking')
    expect(screen.getByTestId('stage-delegated').textContent).toContain('delegate-to-validator')
    expect(screen.getByTestId('stage-claimed').textContent).toContain('claim-staking-rewards')
    expect(screen.getByTestId('stage-unfrozen-pending').textContent).toContain('unfreeze')
    expect(screen.getByTestId('stage-withdrawn').textContent).toContain('withdraw-after-cooldown')
  })

  it('advances stages when the button is clicked and persists to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('current-stage').textContent).toBe('Idle')
    await user.click(screen.getByTestId('advance'))
    expect(screen.getByTestId('current-stage').textContent).toBe('Frozen')
    expect(localStorage.getItem('staking-stage')).toBe('frozen')
  })

  it('reset returns to idle', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('advance'))
    await user.click(screen.getByTestId('advance'))
    expect(screen.getByTestId('current-stage').textContent).toBe('Delegated')
    await user.click(screen.getByTestId('reset'))
    expect(screen.getByTestId('current-stage').textContent).toBe('Idle')
  })
})
