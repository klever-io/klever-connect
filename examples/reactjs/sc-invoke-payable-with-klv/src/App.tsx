// sc-invoke-payable-with-klv (React)
//
// Calls a payable smart-contract endpoint while attaching a KLV value.
// Uses the same counter fixture as sc-invoke-mutable, but invokes a
// `deposit_and_increment` payable variant — the contract reads the attached
// KLV via `self.call_value().egld_value()` (or KLV equivalent in Klever VM).
//
// The pattern:
//
//    contract.invoke(fn, ...args, { value: { KLV: parseKLV('1.5') } })
//
// `value` is an object keyed by asset id ("KLV" for native), so the same call
// can attach native + KDA value simultaneously.

import { useMemo, useState } from 'react'
import { useKlever, isValidContractAddress, parseKLV, Contract } from '@klever/connect'

const counterAbi = {
  name: 'counter',
  endpoints: [
    {
      name: 'deposit_and_increment',
      mutability: 'mutable',
      payableInTokens: ['KLV'],
      inputs: [],
      outputs: [],
    },
  ],
} as const

export function App() {
  const { wallet, isConnected, address, connect, disconnect, extensionInstalled } = useKlever()

  const [contractAddress, setContractAddress] = useState(
    (import.meta.env.VITE_COUNTER_ADDRESS as string) ?? ''
  )
  const [valueKLV, setValueKLV] = useState(
    (import.meta.env.VITE_DEFAULT_VALUE_KLV as string) ?? '1'
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hash, setHash] = useState<string | null>(null)

  const validation = useMemo(() => {
    if (!contractAddress) return 'Contract address required'
    if (!isValidContractAddress(contractAddress)) return 'Not a valid contract address'
    try {
      if (parseKLV(valueKLV) <= 0n) return 'Value must be > 0 (otherwise call sc-invoke-mutable)'
    } catch {
      return 'Invalid KLV value'
    }
    return null
  }, [contractAddress, valueKLV])

  const handleInvoke = async () => {
    if (!wallet || validation) return
    setBusy(true)
    setError(null)
    setHash(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new Contract(contractAddress, counterAbi as any, wallet as any)
      // The KEY part of this example: `value` is an object whose keys are
      // asset ids. Pass `{ KLV: bigint }` to attach native value.
      const result = await contract.invoke('deposit_and_increment', {
        value: { KLV: parseKLV(valueKLV) },
      })
      setHash(result?.hash ?? '(no hash)')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>SC Invoke (payable, sends KLV)</h1>
      <p>
        Calls <code>deposit_and_increment()</code> on the counter contract, attaching{' '}
        <code>value</code> KLV alongside.
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
            style={{ width: '100%' }}
          />
        </label>
        <label>
          KLV to send:
          <input
            data-testid="value"
            value={valueKLV}
            onChange={(e) => setValueKLV(e.target.value)}
          />
        </label>
        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}
        <button
          data-testid="invoke"
          onClick={() => void handleInvoke()}
          disabled={!!validation || busy}
        >
          {busy ? 'Calling…' : 'deposit_and_increment()'}
        </button>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      {hash && (
        <p data-testid="success" style={{ color: 'green' }}>
          Sent! Tx: <code>{hash}</code>
        </p>
      )}
    </main>
  )
}
