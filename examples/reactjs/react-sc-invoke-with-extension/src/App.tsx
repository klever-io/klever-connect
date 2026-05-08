// react-sc-invoke-with-extension
//
// Same idea as `sc-invoke-mutable` but with a richer ABI workflow:
//   - Loads the ABI JSON via fetch from /counter.abi.json (served from public/)
//   - Renders the available endpoints
//   - Lets the user pick one and invoke it through the wallet
//
// This is the "real-world" pattern: ABIs are usually shipped as JSON and
// loaded at runtime, not inlined like in the simpler example.

import { useEffect, useMemo, useState } from 'react'
import { useKlever, isValidContractAddress, Contract } from '@klever/connect'

type AbiEndpoint = {
  name: string
  mutability: string
  inputs?: Array<{ name: string; type: string }>
  outputs?: unknown[]
  payableInTokens?: string[]
}

type Abi = {
  name?: string
  endpoints: AbiEndpoint[]
}

export function App() {
  const { wallet, isConnected, address, connect, disconnect, extensionInstalled } = useKlever()

  const abiUrl = (import.meta.env.VITE_ABI_URL as string) ?? '/counter.abi.json'
  const [abi, setAbi] = useState<Abi | null>(null)
  const [abiError, setAbiError] = useState<string | null>(null)

  const [contractAddress, setContractAddress] = useState(
    (import.meta.env.VITE_COUNTER_ADDRESS as string) ?? ''
  )
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('')
  // Stringly-typed args that we'll coerce per ABI input type.
  const [args, setArgs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [hash, setHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load the ABI on mount.
  useEffect(() => {
    fetch(abiUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`ABI fetch failed: HTTP ${r.status}`)
        return r.json() as Promise<Abi>
      })
      .then((j) => setAbi(j))
      .catch((e) => setAbiError(e.message))
  }, [abiUrl])

  const mutableEndpoints = useMemo(() => {
    return abi?.endpoints.filter((e) => e.mutability !== 'readonly') ?? []
  }, [abi])

  const currentEndpoint = useMemo(
    () => mutableEndpoints.find((e) => e.name === selectedEndpoint),
    [mutableEndpoints, selectedEndpoint]
  )

  const handleInvoke = async () => {
    if (!wallet || !abi || !currentEndpoint) return
    if (!isValidContractAddress(contractAddress)) {
      setError('Not a valid contract address')
      return
    }
    setBusy(true)
    setError(null)
    setHash(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new Contract(contractAddress, abi as any, wallet as any)
      // Coerce args by their declared type. We only handle the common ones —
      // a real app would map every supported ABI type.
      const coerced = (currentEndpoint.inputs ?? []).map((input) => {
        const raw = args[input.name] ?? ''
        switch (input.type) {
          case 'u8':
          case 'u16':
          case 'u32':
            return Number(raw)
          case 'u64':
          case 'BigUint':
            return BigInt(raw)
          default:
            return raw
        }
      })
      const result = await contract.invoke(currentEndpoint.name, ...coerced)
      setHash(result?.hash ?? '(no hash)')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>SC Invoke with Extension (ABI-driven)</h1>
      <p>
        Loads <code>{abiUrl}</code> and exposes mutable endpoints as a select. Pick one, fill the
        args, sign with the extension.
      </p>

      {!extensionInstalled && (
        <p data-testid="no-extension" style={{ color: 'crimson' }}>
          Klever Web Extension not detected.
        </p>
      )}

      {abiError && (
        <p data-testid="abi-error" style={{ color: 'crimson' }}>
          {abiError}
        </p>
      )}
      {!abi && !abiError && <p data-testid="abi-loading">Loading ABI…</p>}
      {abi && (
        <p data-testid="abi-ok">
          ABI loaded: <code>{abi.name ?? '(unnamed)'}</code> ({abi.endpoints.length} endpoints)
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

      <fieldset disabled={!isConnected || !abi}>
        <label>
          Contract:
          <input
            data-testid="contract-address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Endpoint:
          <select
            data-testid="endpoint-select"
            value={selectedEndpoint}
            onChange={(e) => {
              setSelectedEndpoint(e.target.value)
              setArgs({})
            }}
          >
            <option value="">— pick —</option>
            {mutableEndpoints.map((e) => (
              <option key={e.name} value={e.name}>
                {e.name}({(e.inputs ?? []).map((i) => i.type).join(', ')})
              </option>
            ))}
          </select>
        </label>

        {currentEndpoint?.inputs?.map((input) => (
          <label key={input.name} style={{ display: 'block' }}>
            {input.name} <small>({input.type})</small>:
            <input
              data-testid={`arg-${input.name}`}
              value={args[input.name] ?? ''}
              onChange={(e) => setArgs((prev) => ({ ...prev, [input.name]: e.target.value }))}
            />
          </label>
        ))}

        <button
          data-testid="invoke"
          onClick={() => void handleInvoke()}
          disabled={!selectedEndpoint || busy}
        >
          {busy ? 'Calling…' : 'Invoke'}
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
