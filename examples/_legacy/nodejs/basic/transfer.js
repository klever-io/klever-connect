/**
 * Transfer Example
 *
 * Demonstrates how to send KLV or KDA tokens using NodeWallet.
 * Covers the full flow: wallet setup → build → sign → broadcast.
 *
 * Usage:
 *   node basic/transfer.js
 *
 * Environment variables:
 *   PRIVATE_KEY      - 64-char hex private key (required)
 *   NETWORK          - Network to use (default: testnet)
 *   RECEIVER_ADDRESS - Recipient address (required)
 *   TRANSFER_AMOUNT  - Amount in KLV, e.g. "1.5" (default: 0.1)
 *   ASSET_ID         - KDA token ID to send (optional, defaults to KLV)
 */

import 'dotenv/config'
import { KleverProvider, NodeWallet, parseKLV, isValidAddress } from '@klever/connect'

const network = process.env.NETWORK || 'testnet'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Error: ${name} is required. Set it in your .env file.`)
    process.exit(1)
  }
  return value
}

async function main() {
  const privateKey = requireEnv('PRIVATE_KEY')
  const receiver = requireEnv('RECEIVER_ADDRESS')
  const amountKLV = process.env.TRANSFER_AMOUNT || '0.1'
  if (isNaN(Number(amountKLV)) || Number(amountKLV) <= 0) {
    console.error(`Error: Invalid TRANSFER_AMOUNT: ${amountKLV}`)
    process.exit(1)
  }
  const assetId = process.env.ASSET_ID // undefined = KLV

  if (!isValidAddress(receiver)) {
    console.error(`Error: Invalid receiver address: ${receiver}`)
    process.exit(1)
  }

  const provider = new KleverProvider({ network })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  try {
    console.log(`Network:   ${network}`)
    console.log(`From:      ${wallet.address}`)
    console.log(`To:        ${receiver}`)
    console.log(`Amount:    ${amountKLV} ${assetId ?? 'KLV'}`)
    console.log('')

    // wallet.transfer() builds, signs, and broadcasts the transaction
    const result = await wallet.transfer({
      receiver,
      amount: parseKLV(amountKLV),
      ...(assetId ? { kda: assetId } : {}),
    })

    console.log(`Transaction submitted!`)
    console.log(`Hash:   ${result.hash}`)
    console.log(`Status: ${result.status}`)
    console.log(`Explorer: ${provider.getTransactionUrl(result.hash)}`)
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
