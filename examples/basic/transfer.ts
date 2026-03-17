/**
 * Basic KLV Transfer Example
 *
 * Demonstrates how to:
 * 1. Create a provider connection
 * 2. Initialize a wallet with a private key
 * 3. Build and send a transfer transaction
 * 4. Wait for on-chain confirmation (if supported)
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { parseKLV } from '@klever/connect-core'

async function main(): Promise<void> {
  // Step 1: Connect to testnet
  const provider = new KleverProvider({ network: 'testnet' })

  // Step 2: Initialize wallet from environment variable
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required')
  }

  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log('Wallet address:', wallet.address)

  // Step 3: Resolve receiver — argv[2] > RECEIVER env var > self-send
  const receiver = process.argv[2] ?? process.env['RECEIVER'] ?? wallet.address // send to self if no address provided

  try {
    // Send 1 KLV to the receiver
    const result = await wallet.transfer({
      receiver,
      amount: parseKLV('1'), // 1 KLV → 1_000_000 (6 decimals)
    })

    console.log('Transaction hash:', result.hash)

    // Step 4: Wait for on-chain confirmation (wait is optional on TransactionSubmitResult)
    if (result.wait) {
      const receipt = await result.wait()
      console.log('Confirmed:', receipt.status)
    } else {
      console.log('Transaction submitted with status:', result.status)
    }
  } catch (error) {
    console.error('Transfer failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    // Clear private key from memory when done
    await wallet.disconnect(true)
  }
}

void main()
