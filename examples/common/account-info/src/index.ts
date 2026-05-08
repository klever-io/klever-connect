/**
 * Flow #12 — account-info
 *
 * `provider.getAccount(addr)` returns everything the chain knows about a
 * single account in one call:
 *
 *   - balance / nonce
 *   - per-asset balances with their precision (use to format KDA correctly)
 *   - frozen / unfrozen amounts (the buckets you can stake from)
 *   - permissions (multi-sig signers)
 *
 * This example renders the highlights to stdout. Use the same shape to render
 * a wallet UI, build an indexer, or feed a tax tool.
 */

import {
  KleverProvider,
  formatUnits,
  formatKLV,
  createKleverAddress,
  isValidAddress,
} from '@klever/connect'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const raw = process.env['KLEVER_ADDRESS'] ??
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
  if (!isValidAddress(raw)) throw new Error(`Invalid address: ${raw}`)

  const address = createKleverAddress(raw)
  const account = await provider.getAccount(address)

  console.log(`Network : ${network}`)
  console.log(`Address : ${address}`)
  console.log(`Nonce   : ${account.nonce}`)
  console.log(`KLV bal : ${formatKLV(BigInt(account.balance ?? 0))}`)

  // ---------------------------------------------------------------------------
  // Per-asset balances
  // ---------------------------------------------------------------------------
  const assets = account.assets ?? []
  if (assets.length > 0) {
    console.log('\nAssets:')
    for (const asset of assets) {
      const a = asset as { assetId: string; balance: string; precision: number; frozenBalance?: string }
      const human = formatUnits(BigInt(a.balance), a.precision)
      console.log(`  ${a.assetId.padEnd(18)} balance=${human.padStart(18)} (precision ${a.precision})`)
      if (a.frozenBalance && a.frozenBalance !== '0') {
        console.log(`  ${' '.padEnd(18)}   frozen=${formatUnits(BigInt(a.frozenBalance), a.precision)}`)
      }
    }
  } else {
    console.log('\n(no asset balances)')
  }

  // ---------------------------------------------------------------------------
  // Permissions (multi-sig)
  // ---------------------------------------------------------------------------
  const perms = (account as { permissions?: unknown[] }).permissions ?? []
  console.log(`\nPermissions: ${perms.length} entry(ies)`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
