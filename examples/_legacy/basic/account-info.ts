/**
 * Account Info Example
 *
 * Demonstrates how to:
 * 1. Fetch detailed account information
 * 2. List all assets held by an account
 * 3. Handle accounts that don't exist yet
 */

import { KleverProvider } from '@klever/connect-provider'
import {
  formatKLV,
  isValidAddress,
  createKleverAddress,
  ValidationError,
} from '@klever/connect-core'

async function getAccountInfo(rawAddress: string): Promise<void> {
  // Validate address format before hitting the network
  if (!isValidAddress(rawAddress)) {
    throw new ValidationError(`Invalid Klever address: ${rawAddress}`)
  }

  const address = createKleverAddress(rawAddress)
  const provider = new KleverProvider({ network: 'testnet' })

  try {
    const account = await provider.getAccount(address)

    console.log('=== Account Info ===')
    console.log('Address:', rawAddress)
    console.log('Nonce:', account.nonce)

    // KLV balance is always present
    const klvAsset = account.assets?.find((a) => a.assetId === 'KLV')
    if (klvAsset) {
      const balance = BigInt(klvAsset.balance ?? 0)
      const frozen = BigInt(klvAsset.frozenBalance ?? 0)
      console.log('\n=== KLV ===')
      console.log('Balance:', formatKLV(balance))
      console.log('Frozen:', formatKLV(frozen))
      console.log('Available:', formatKLV(balance - frozen))
    }

    // Other KDA tokens
    const kdaAssets = account.assets?.filter((a) => a.assetId !== 'KLV') ?? []
    if (kdaAssets.length > 0) {
      console.log('\n=== KDA Tokens ===')
      for (const asset of kdaAssets) {
        console.log(`${asset.assetId}: ${asset.balance}`)
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      console.log('Account has no on-chain activity yet (balance: 0 KLV)')
    } else {
      throw error
    }
  }
}

// Run with a specific address or fall back to a sample
const address = process.argv[2] ?? 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

getAccountInfo(address).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
