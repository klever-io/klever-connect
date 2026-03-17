/**
 * Balance Check Example
 *
 * Demonstrates how to:
 * 1. Check KLV balance of any address (read-only, no wallet needed)
 * 2. Check a specific KDA token balance
 *
 * For full account details (nonce, assets, staking), see account-info.ts
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { formatKLV, createKleverAddress, isValidAddress } from '@klever/connect-core'

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: 'testnet' })

  const rawAddress =
    process.argv[2] ?? 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

  if (!isValidAddress(rawAddress)) {
    throw new Error(`Invalid address: ${rawAddress}`)
  }

  const address = createKleverAddress(rawAddress)

  // --- KLV balance ---
  const rawBalance = await provider.getBalance(address)
  console.log('KLV balance (raw):', rawBalance.toString())
  console.log('KLV balance:', formatKLV(rawBalance))

  // --- KDA token balance ---
  const kdaId = process.env['KDA_ID']
  if (kdaId) {
    const kdaBalance = await provider.getBalance(address, kdaId)
    console.log(`${kdaId} balance (raw):`, kdaBalance.toString())
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
