// sc-invoke-mutable (React)
//
// Form-driven mutable smart-contract invoke.
//
// Background:
//   - Read-only: `Contract.call(fn, ...args)` -> uses provider.queryContract.
//   - Mutable:   `Contract.invoke(fn, ...args, opts?)` -> builds, signs, broadcasts.
//
// We assume the counter Rust fixture (examples/_fixtures/counter/) is already
// deployed and its address available via VITE_COUNTER_ADDRESS or pasted at
// runtime. For the test path we don't compile real Rust — we just mock
// Contract.invoke.

import { useMemo, useState } from 'react'
import { useKlever, isValidContractAddress } from '@klever/connect'
import { Contract } from '@klever/connect'

// Minimal hand-crafted ABI snippet for the counter fixture. In a real app
// you'd `import counterAbi from '../public/counter.abi.json'` or fetch it.
const counterAbi = {
  name: 'counter',
  endpoints: [
    { name: 'increment', mutability: 'mutable', inputs: [], outputs: [] },
    {
      name: 'add',
      mutability: 'mutable',
      inputs: [{ name: 'value', type: 'u32' }],
      outputs: [],
    },
    {
      name: 'get_value',
      mutability: 'readonly',
      inputs: [],
      outputs: [{ type: 'u32' }],
    },
  ],
} as const

export function App() {
  const { wallet, isConnected, address, connect, disconnect, extensionInstalled } = useKlever()

  const [contractAddress, setContractAddress] = useState(
    (import.meta.env.VITE_COUNTER_ADDRESS as string) ?? ''
  )
  const [addValue, setAddValue] = useState('1')
  const [busy, setBusy] = useState<'increment' | 'add' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastHash, setLastHash] = useState<string | null>(null)

  const validation = useMemo(() => {
    if (!contractAddress) return 'Contract address required'
    if (!isValidContractAddress(contractAddress))
      return 'Not a valid contract address (expected klv1qqqqqqqqqq...)'
    return null
  }, [contractAddress])

  const invoke = async (fn: 'increment' | 'add') => {
    if (!wallet || validation) return
    setBusy(fn)
    setError(null)
    setLastHash(null)
    try {
      // `Contract` accepts a wallet-like signer for invoke calls. The wallet
      // routes signing through the extension when present.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new Contract(contractAddress, counterAbi as any, wallet as any)
      const args = fn === 'add' ? [Number(addValue)] : []
      const result = await contract.invoke(fn, ...args)
      setLastHash(result?.hash ?? '(no hash returned)')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>SC Invoke (mutable)</h1>
      <p>
        Calls the counter fixture's mutable methods. <code>increment()</code> bumps by 1;{' '}
        <code>add(u32)</code> bumps by N.
      </p>

      {!extensionInstalled && (
        <p data-testid="no-extension" style={{ color: 'crimson' }}>
          Klever Web Extension not detected.
        </p>
      )}

      {isConnected ? (
        <p>
          Connected as <code data-testid="address">{address}</code>{' '}
          <button data-testid="disconnect" onClick={disconnect}>
            Disconnect
          </button>
        </p>
      ) : (
        <button data-testid="connect" onClick={() => void connect()}>
          Connect Klever Extension
        </button>
      )}

      <fieldset disabled={!isConnected}>
        <label>
          Counter contract address:
          <input
            data-testid="contract-address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="klv1qqqqqqqqqq..."
            style={{ width: '100%' }}
          />
        </label>
        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}

        <button
          data-testid="increment"
          onClick={() => void invoke('increment')}
          disabled={!!validation || busy !== null}
        >
          {busy === 'increment' ? 'Calling…' : 'increment()'}
        </button>

        <span style={{ marginLeft: 16 }}>
          <input
            data-testid="add-value"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            style={{ width: 60 }}
          />
          <button
            data-testid="add"
            onClick={() => void invoke('add')}
            disabled={!!validation || busy !== null}
          >
            {busy === 'add' ? 'Calling…' : 'add(value)'}
          </button>
        </span>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      {lastHash && (
        <p data-testid="success" style={{ color: 'green' }}>
          Sent! Tx: <code>{lastHash}</code>
        </p>
      )}
    </main>
  )
}
