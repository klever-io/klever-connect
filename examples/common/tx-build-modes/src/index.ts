/**
 * Flow #15 — tx-build-modes
 *
 * `TransactionBuilder` exposes three modes for assembling a transaction:
 *
 *   1. build()         — node-assisted. Provider fetches nonce, fees,
 *                        chainId, then returns a fully-encoded `Transaction`
 *                        ready to sign. Easiest, requires network.
 *
 *   2. buildProto({...}) — fully offline. You supply nonce / chainId / fees;
 *                        the SDK encodes the proto bytes locally without any
 *                        network call. Useful for cold-storage signing.
 *
 *   3. buildRequest()  — returns the raw `BuildTransactionRequest` JSON
 *                        object. Useful if you want to send it to a custom
 *                        endpoint or inspect / persist it before broadcast.
 *
 * Note: this example does NOT broadcast — it just shows the three shapes.
 *       For a full sign + broadcast flow see nodejs/send-klv-transfer.
 *       (Common can't broadcast because that requires a real signing wallet,
 *        which means env private keys -> the nodejs/ category.)
 */

import {
  KleverProvider,
  TransactionBuilder,
  parseKLV,
  createKleverAddress,
  isValidAddress,
} from '@klever/connect'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const senderRaw = process.env['KLEVER_SENDER'] ??
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
  if (!isValidAddress(senderRaw)) throw new Error(`Invalid sender: ${senderRaw}`)
  const sender = createKleverAddress(senderRaw)
  const receiver = createKleverAddress(process.env['KLEVER_RECEIVER'] ?? sender)

  console.log(`Sender   : ${sender}`)
  console.log(`Receiver : ${receiver}\n`)

  // -------------------------------------------------------------------------
  // Mode 1: node-assisted build()
  // The provider fills nonce, fees, and chainId. Returns a `Transaction`.
  // -------------------------------------------------------------------------
  console.log('--- Mode 1: build() (node-assisted) ---')
  const assistedTx = await new TransactionBuilder(provider)
    .sender(sender)
    .transfer({ receiver, amount: parseKLV('1') })
    .build()

  // The transaction is ready to sign. We don't sign it here (no key in common/),
  // but we can serialize it to inspect.
  console.log(`  serialized hex (first 40 chars): ${assistedTx.toHex().slice(0, 40)}...`)
  console.log(`  proto length (bytes)           : ${assistedTx.toHex().length / 2}`)

  // -------------------------------------------------------------------------
  // Mode 2: buildProto({...}) — fully offline.
  // We still need a nonce; in a real cold-storage flow you'd persist this
  // value somewhere instead of fetching from the node.
  // -------------------------------------------------------------------------
  console.log('\n--- Mode 2: buildProto({...}) (offline) ---')
  const nonce = await provider.getNonce(sender)
  const offlineTx = new TransactionBuilder()
    .transfer({ receiver, amount: parseKLV('1') })
    .buildProto({
      sender,
      nonce: nonce + 1, // must be > the previous tx's nonce
      chainId: '109',   // testnet — see NETWORKS for other chainIds
      fees: { kAppFee: 500_000, bandwidthFee: 100_000 },
    })

  console.log(`  serialized hex (first 40 chars): ${offlineTx.toHex().slice(0, 40)}...`)
  console.log(`  hint: nonce/chainId/fees were supplied locally — no node round-trip beyond the nonce fetch above.`)

  // -------------------------------------------------------------------------
  // Mode 3: buildRequest()
  // Returns a plain JSON request object — not a Transaction. Useful for
  // inspecting, persisting, or piping to a custom endpoint.
  // -------------------------------------------------------------------------
  console.log('\n--- Mode 3: buildRequest() (raw JSON) ---')
  const request = new TransactionBuilder()
    .sender(sender)
    .transfer({ receiver, amount: parseKLV('0.5') })
    .buildRequest()

  // Truncate to keep stdout tidy.
  const json = JSON.stringify(request, null, 2)
  console.log(json.length > 600 ? json.slice(0, 600) + '\n  ...' : json)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
