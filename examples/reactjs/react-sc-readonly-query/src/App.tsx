// react-sc-readonly-query
//
// Read-only smart-contract call from a React component. No wallet needed —
// `Contract.call(fn, ...args)` uses `provider.queryContract()` under the hood,
// which is a stateless RPC against the chain.
//
// We target the counter fixture's `get_value()` endpoint. The result is a u32
// returned in the contract's "returnData" array; the SDK decodes it for us
// when the ABI is provided.

import { useEffect, useState } from 'react'
import { useKlever, isValidContractAddress, Contract } from '@klever/connect'

const counterAbi = {
  name: 'counter',
  endpoints: [
    {
      name: 'get_value',
      mutability: 'readonly',
      inputs: [],
      outputs: [{ type: 'u32' }],
    },
  ],
} as const

export function App() {
  const { provider } = useKlever()

  const [contractAddress, setContractAddress] = useState(
    (import.meta.env.VITE_COUNTER_ADDRESS as string) ?? ''
  )
  const [value, setValue] = useState<string>('—')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchValue = async () => {
    setError(null)
    setValue('—')
    if (!contractAddress) {
      setError('Contract address required')
      return
    }
    if (!isValidContractAddress(contractAddress)) {
      setError('Not a valid contract address (klv1qqqqqqqqqq...)')
      return
    }
    setLoading(true)
    try {
      // For readonly calls we pass `provider` as the third arg.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new Contract(contractAddress, counterAbi as any, provider as any)
      const result = await contract.call('get_value')
      // The decoded result is typically the first item; defensive about shape.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded = Array.isArray(result) ? result[0] : (result as any)?.value ?? result
      setValue(String(decoded))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on mount if env address is provided.
  useEffect(() => {
    if (contractAddress) void fetchValue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>SC Read-Only Query</h1>
      <p>
        Calls <code>counter.get_value()</code> via <code>Contract.call</code>. No wallet needed.
      </p>

      <fieldset>
        <label>
          Counter contract address:
          <input
            data-testid="contract-address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <button data-testid="fetch" onClick={() => void fetchValue()} disabled={loading}>
          {loading ? 'Querying…' : 'get_value()'}
        </button>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      <p>
        Value: <code data-testid="value">{value}</code>
      </p>
    </main>
  )
}
