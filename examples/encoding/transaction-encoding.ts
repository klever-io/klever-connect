/**
 * Transaction Encoding/Decoding Example
 *
 * Demonstrates how to:
 * 1. Build a transaction via the node (fetches nonce, fees, proto encoding)
 * 2. Serialize to hex for storage or transmission
 * 3. Deserialize from hex (simulates receiving it back from a hardware signer)
 * 4. Sign and broadcast the recovered transaction
 *
 * NOTE: buildProto() (fully offline building) is available but currently
 * does not encode contract parameters into proto — use build() for broadcast-ready
 * transactions.
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { TransactionBuilder, Transaction } from '@klever/connect-transactions'
import { parseKLV } from '@klever/connect-core'

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    console.log('Set PRIVATE_KEY env var to sign and broadcast')
    return
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log('Sender:', wallet.address)

  // --- Step 1: Build transaction via node ---
  // The node fetches the current nonce, computes fees, and returns proto bytes.
  const tx = await new TransactionBuilder(provider)
    .sender(wallet.address)
    .transfer({
      receiver: wallet.address, // send to self for demonstration
      amount: parseKLV('0.001'),
    })
    .build()

  console.log('\nBuilt transaction (node-assisted):')

  // --- Step 2: Serialize to hex ---
  // Useful for: storing unsigned transactions, sending to a hardware signer, QR codes, etc.
  const hex = tx.toHex()
  console.log('Serialized hex:', hex.slice(0, 64) + '...')

  // --- Step 3: Deserialize from hex ---
  // Simulates receiving the transaction back (e.g., from a hardware signer that signed it offline)
  let recovered: Transaction
  try {
    recovered = Transaction.fromHex(hex)
  } catch (err) {
    throw new Error(
      `Failed to deserialize transaction: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    )
  }
  console.log('Recovered transaction matches original:', tx.toHex() === recovered.toHex())

  // --- Step 4: Sign and broadcast ---
  const signed = await wallet.signTransaction(recovered)
  console.log('Transaction signed')

  const hash = await wallet.broadcastTransaction(signed)
  console.log('Broadcasted! Hash:', hash)

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
