/**
 * Build and Sign Transaction Example
 *
 * Demonstrates three transaction building modes:
 * 1. Node-assisted: provider fetches nonce and fees automatically
 * 2. Offline (buildProto): client-side proto encoding — nonce is still fetched from the node
 * 3. buildRequest: returns the raw request object for custom handling
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { TransactionBuilder } from '@klever/connect-transactions'
import { parseKLV, createKleverAddress } from '@klever/connect-core'

const RECEIVER = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log('Sender:', wallet.address)

  // ── Mode 1: Node-assisted build ──────────────────────────────────────────
  // The provider fills in nonce, fees, and chainId automatically.
  const assistedTx = await new TransactionBuilder(provider)
    .sender(wallet.address)
    .transfer({ receiver: RECEIVER, amount: parseKLV('1') })
    .build()

  const signedAssisted = await wallet.signTransaction(assistedTx)
  const hash1 = await wallet.broadcastTransaction(signedAssisted)
  console.log('\n[Node-assisted] Hash:', hash1)

  // ── Mode 2: Offline (buildProto) ─────────────────────────────────────────
  // No network call — nonce, chainId, and fees must be supplied manually.
  const nonce = await provider.getNonce(createKleverAddress(wallet.address))

  const offlineTx = new TransactionBuilder()
    .transfer({ receiver: RECEIVER, amount: parseKLV('1') })
    .buildProto({
      sender: wallet.address,
      nonce: nonce + 1, // must be ahead of the previous tx
      chainId: '109',
      fees: { kAppFee: 500_000, bandwidthFee: 100_000 },
    })

  const signedOffline = await wallet.signTransaction(offlineTx)
  const hash2 = await wallet.broadcastTransaction(signedOffline)
  console.log('[Offline]       Hash:', hash2)

  // ── Mode 3: buildRequest ─────────────────────────────────────────────────
  // Returns the plain request object — useful for inspecting or custom API calls.
  const request = new TransactionBuilder()
    .sender(wallet.address)
    .transfer({ receiver: RECEIVER, amount: parseKLV('0.5') })
    .buildRequest()

  console.log('\n[buildRequest] Request object:')
  console.log(JSON.stringify(request, null, 2))

  // You can send it yourself:
  // const { data } = await provider.buildTransaction(request)
  // const tx = Transaction.fromHex(data.result.transaction)

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
