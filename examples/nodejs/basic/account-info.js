/**
 * Account Info
 *
 * Fetches and displays comprehensive account information including
 * balance, nonce, assets, and staking details.
 *
 * Usage:
 *   node basic/account-info.js
 *   ADDRESS=klv1... node basic/account-info.js
 *
 * Environment variables:
 *   NETWORK     - Network to connect to (default: testnet)
 *   PRIVATE_KEY - Private key to derive address from (optional)
 *   ADDRESS     - Explicit address to check (optional)
 */

import 'dotenv/config'
import { KleverProvider, NodeWallet, formatKLV, isValidAddress } from '@klever/connect'

const network = process.env.NETWORK || 'mainnet'

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

  const account = await provider.getAccount(address)

  console.log('═══════════════════════════════════════')
  console.log('  Account Information')
  console.log('═══════════════════════════════════════')
  console.log(`Network:  ${network}`)
  console.log(`Address:  ${address}`)
  console.log(`Nonce:    ${account.nonce}`)
  console.log(`Balance:  ${formatKLV(account.balance)} KLV`)

  const assets = account.assets ?? {}
  const assetKeys = Object.keys(assets)
  if (assetKeys.length > 0) {
    console.log(`\nAssets (${assetKeys.length}):`)
    for (const id of assetKeys) {
      const asset = assets[id]
      console.log(`  ${id}: ${asset.balance.toString()}`)
      if (asset.frozenBalance && asset.frozenBalance > 0n) {
        console.log(`    Frozen: ${asset.frozenBalance.toString()}`)
      }
    }
  }

  console.log('═══════════════════════════════════════')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
