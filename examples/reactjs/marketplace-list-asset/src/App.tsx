// marketplace-list-asset (React)
//
// Lists an asset (NFT or fungible KDA) on a Klever marketplace.
//
// Background:
//   - Marketplace listings are created by the `Sell` contract (TXType 18 in
//     the proto enum, also exposed as TransactionBuilder.sell()).
//   - The seller signs a tx with: the asset id, the price (KLV smallest-units),
//     a duration (end-time epoch), and the marketplace ID.
//   - In a React + extension app, we don't build the proto manually — we let
//     `useTransaction({ contractType: TXType.Sell })` handle it.
//
// What the test asserts:
//   - The form validates inputs.
//   - On submit, useTransaction.sendTransaction is called with the right
//     payload shape.
//
// Production runtime: Klever Web Extension prompts to sign.

import { useMemo, useState } from 'react'
import {
  useKlever,
  useTransaction,
  isValidAddress,
  parseKLV,
  TXType,
} from '@klever/connect'

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled } = useKlever()

  // useTransaction with `contractType: TXType.Sell` (=18) generates a Sell
  // contract behind the scenes. Pass options to sendTransaction at call time.
  const { sendTransaction, isLoading, error, data } = useTransaction()

  const [assetId, setAssetId] = useState('')
  const [marketplaceId, setMarketplaceId] = useState(
    (import.meta.env.VITE_MARKETPLACE_ID as string) ?? ''
  )
  const [priceKLV, setPriceKLV] = useState('1')
  const [durationDays, setDurationDays] = useState('7')

  const validation = useMemo(() => {
    if (!assetId) return 'Asset id required (e.g. KFI or NFT/01)'
    if (!marketplaceId) return 'Marketplace id required'
    try {
      if (parseKLV(priceKLV) <= 0n) return 'Price must be > 0'
    } catch {
      return 'Price is not a valid number'
    }
    const days = Number(durationDays)
    if (!Number.isFinite(days) || days <= 0) return 'Duration must be a positive number of days'
    return null
  }, [assetId, marketplaceId, priceKLV, durationDays])

  const handleList = async () => {
    if (validation || !isConnected || !address) return
    const endTimeEpoch = Math.floor(Date.now() / 1000) + Number(durationDays) * 86400
    // The `Sell` request shape comes from connect-provider's SellRequest type:
    //   { marketType, marketplaceId, assetId, currencyId, price, endTime, ... }
    // marketType=0 = fixed price, currencyId=KLV by default.
    await sendTransaction({
      contractType: TXType.Sell,
      payload: {
        marketType: 0,
        marketplaceId,
        assetId,
        currencyId: 'KLV',
        price: parseKLV(priceKLV).toString(),
        endTime: endTimeEpoch,
      },
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Marketplace: List Asset</h1>
      <p>
        Sell an asset (NFT or fungible KDA) on a Klever marketplace. Signs via{' '}
        <code>useTransaction</code> + Klever Extension.
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

      <fieldset disabled={!isConnected || isLoading}>
        <label>
          Asset ID:
          <input
            data-testid="asset-id"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="KFI or NFT/01"
          />
        </label>
        <label>
          Marketplace ID:
          <input
            data-testid="marketplace-id"
            value={marketplaceId}
            onChange={(e) => setMarketplaceId(e.target.value)}
          />
        </label>
        <label>
          Price (KLV):
          <input
            data-testid="price"
            value={priceKLV}
            onChange={(e) => setPriceKLV(e.target.value)}
          />
        </label>
        <label>
          Duration (days):
          <input
            data-testid="duration"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
        </label>
        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}
        <button data-testid="list" onClick={() => void handleList()} disabled={!!validation}>
          {isLoading ? 'Signing…' : 'List asset'}
        </button>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error.message}
        </p>
      )}
      {data && (
        <p data-testid="success" style={{ color: 'green' }}>
          Listed! Tx: <code>{data.hash}</code>
        </p>
      )}

      <small>
        Reference: <code>address</code> = {address ? 'connected' : 'not connected'};
        <code>isValidAddress(address)</code> = {address ? String(isValidAddress(address)) : '—'}
      </small>
    </main>
  )
}
