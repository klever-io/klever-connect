/**
 * Flow #26 — bucket-list-and-status
 *
 * On Klever, freezing KLV creates "buckets" — slots of frozen funds you can
 * then delegate to validators. The on-chain account record carries a list of
 * buckets per asset, with these states:
 *
 *   - frozen        : delegated or undelegated, locked
 *   - undelegated   : in cooldown, will become withdrawable after epoch N
 *   - withdrawable  : the bucket is ready to be unfrozen
 *
 * `provider.getAccount(addr)` returns this directly — no extra RPC needed.
 *
 * This example walks the buckets and renders a simple status table.
 */

import {
  KleverProvider,
  formatKLV,
  createKleverAddress,
  isValidAddress,
} from '@klever/connect'

interface Bucket {
  id?: string
  stakeAt?: number
  delegation?: string
  unstakedEpoch?: number
  balance?: string
  validator?: string
}

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const raw = process.env['KLEVER_ADDRESS']
  if (!raw) {
    throw new Error(
      'Set KLEVER_ADDRESS in .env to an account that has frozen / delegated KLV. The example is read-only.',
    )
  }
  if (!isValidAddress(raw)) throw new Error(`Invalid address: ${raw}`)
  const address = createKleverAddress(raw)

  const account = await provider.getAccount(address)

  console.log(`Network : ${network}`)
  console.log(`Address : ${address}`)

  const assets = (account.assets ?? []) as Array<{
    assetId: string
    frozenBalance?: string
    unfrozenBalance?: string
    precision: number
    buckets?: Bucket[]
  }>

  const klvAsset = assets.find((a) => a.assetId === 'KLV')
  if (!klvAsset) {
    console.log('\n(no KLV asset entry on this account — nothing frozen)')
    return
  }

  const frozen = BigInt(klvAsset.frozenBalance ?? '0')
  const unfrozen = BigInt(klvAsset.unfrozenBalance ?? '0')
  console.log(`\nKLV frozen   : ${formatKLV(frozen)}`)
  console.log(`KLV unfrozen : ${formatKLV(unfrozen)}  (in cooldown / withdrawable)`)

  const buckets = klvAsset.buckets ?? []
  console.log(`\nBuckets (${buckets.length}):`)

  if (buckets.length === 0) {
    console.log('  (none)')
    return
  }

  for (const [i, b] of buckets.entries()) {
    const balance = BigInt(b.balance ?? '0')
    const isUnstaking = (b.unstakedEpoch ?? 0) > 0
    const status = isUnstaking ? `unstaking (epoch=${b.unstakedEpoch})` : 'frozen'

    console.log(`  bucket[${i}]`)
    console.log(`    id          : ${b.id ?? '?'}`)
    console.log(`    balance     : ${formatKLV(balance)} KLV`)
    console.log(`    status      : ${status}`)
    if (b.validator) console.log(`    delegation  : ${b.validator}`)
    if (b.stakeAt) console.log(`    stakedAt    : epoch ${b.stakeAt}`)
  }

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
