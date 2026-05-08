import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const monitor = vi.fn()
const cancel = vi.fn()
const cancelAll = vi.fn()
const activeMonitors: Array<{ hash: string; status: string }> = []

const klever = {
  isConnected: true,
  address: 'klv1user',
  connect: vi.fn(),
  disconnect: vi.fn(),
  provider: {},
}

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => klever,
    useTransactionMonitor: () => ({
      monitor,
      cancel,
      cancelAll,
      getStatus: vi.fn(),
      activeMonitors,
      isMonitoring: activeMonitors.length > 0,
    }),
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const { App } = await import('../App')

describe('react-tx-monitor-multi', () => {
  beforeEach(() => {
    activeMonitors.length = 0
    monitor.mockClear()
    cancel.mockClear()
    cancelAll.mockClear()
  })

  it('shows the empty state by default', () => {
    render(<App />)
    expect(screen.getByTestId('no-monitors')).toBeInTheDocument()
  })

  it('calls monitor() when Watch is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('hash-input'), '0xabc')
    await user.click(screen.getByTestId('add-monitor'))
    expect(monitor).toHaveBeenCalledWith('0xabc')
  })

  it('renders status badges for active monitors', () => {
    activeMonitors.push({ hash: '0xaaaa', status: 'pending' })
    activeMonitors.push({ hash: '0xbbbb', status: 'success' })
    render(<App />)
    expect(screen.getByTestId('badge-0xaaaa').textContent).toBe('pending')
    expect(screen.getByTestId('badge-0xbbbb').textContent).toBe('success')
  })

  it('cancels a single hash', async () => {
    const user = userEvent.setup()
    activeMonitors.push({ hash: '0xaaaa', status: 'pending' })
    render(<App />)
    await user.click(screen.getByTestId('cancel-0xaaaa'))
    expect(cancel).toHaveBeenCalledWith('0xaaaa')
  })
})
