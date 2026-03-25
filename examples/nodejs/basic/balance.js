/**
 * Balance Checker
 *
 * Demonstrates how to query KLV and KDA token balances from the Klever blockchain.
 *
 * Usage:
 *   node basic/balance.js
 *   ADDRESS=klv1... node basic/balance.js
 *
 * Environment variables:
 *   NETWORK       - Network to connect to (default: testnet)
 *   PRIVATE_KEY   - Private key to derive address from (optional if ADDRESS is set)
 *   ADDRESS       - Explicit address to check (optional, overrides PRIVATE_KEY)
 *   ASSET_ID      - KDA asset ID to check specific token balance (optional)
 */

import 'dotenv/config'
import { KleverProvider, NodeWallet, formatKLV, isValidAddress } from '@klever/connect'

const network = process.env.NETWORK || 'testnet'
const assetId = process.env.ASSET_ID

async function main() {
  const provider = new KleverProvider({ network })

  let address = process.env.ADDRESS
  if (!address) {
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      console.error('Error: Set ADDRESS or PRIVATE_KEY in your .env file')
      process.exit(1)
    }
    const wallet = new NodeWallet(provider, privateKey)
    await wallet.connect()
    address = wallet.address
  }

  if (!isValidAddress(address)) {
    console.error(`Error: Invalid address: ${address}`)
    process.exit(1)
  }

  console.log(`Network: ${network}`)
  console.log(`Address: ${address}`)
  console.log('')

  const klvBalance = await provider.getBalance(address)
  console.log(`KLV Balance: ${formatKLV(klvBalance)} KLV`)

  if (assetId) {
    const kdaBalance = await provider.getBalance(address, assetId)
    console.log(`${assetId} Balance: ${kdaBalance.toString()}`)
  }

  const account = await provider.getAccount(address)
  const assets = account.assets ?? []
  if (assets.length > 0) {
    console.log(`\nAll assets (${assets.length}):`)
    for (const asset of assets) {
      console.log(`  ${asset.assetId}: ${asset.balance.toString()}`)
    }
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
