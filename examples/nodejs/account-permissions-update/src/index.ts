/**
 * Example: account-permissions-update (Flow 47)
 *
 * Builds and signs an `UpdateAccountPermission` transaction (contractType 22)
 * — Klever's mechanism for installing multi-sig or weighted permission
 * structures on an account.
 *
 * Why this example MAY stop at "request built"
 * --------------------------------------------
 * Once an account has more than one signer with a threshold > 1, broadcasting
 * any subsequent transaction requires aggregating signatures from multiple
 * parties — a multi-party choreography that doesn't fit a single-binary demo.
 *
 * This example therefore demonstrates:
 *   1. Reading a `permissions` JSON description from env.
 *   2. Validating the shape and converting it to the SDK request type.
 *   3. Building + signing the transaction with the current single-key wallet.
 *   4. Optionally broadcasting it (BROADCAST_SINGLE_SIGNED=true) — useful for
 *      INITIAL setup (the account is still single-sig at the time of the
 *      transaction, even though the new permissions take effect afterward).
 *
 * Wire shape (`UpdateAccountPermissionRequest`)
 * ---------------------------------------------
 * - `permissions`: PermissionRequest[]
 *   - `type`: 0=Owner, 1=User
 *   - `permissionName`: short string id
 *   - `threshold`: integer (or AmountLike) — minimum aggregated weight required
 *   - `operations`: hex string bitmap describing which contract types this
 *      permission can authorize. `"0x000000"` is "all" by convention.
 *   - `signers`: SignerRequest[] with `{ address, weight }`.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type UpdateAccountPermissionRequest,
  type PermissionRequest,
  type SignerRequest,
  type AmountLike,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const PERMISSIONS_JSON = process.env['PERMISSIONS_JSON']
const BROADCAST = (process.env['BROADCAST_SINGLE_SIGNED'] ?? 'false').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!PERMISSIONS_JSON) {
  console.error('Error: PERMISSIONS_JSON is required.')
  process.exit(1)
}

// JSON shape we accept from the env — we coerce/validate explicitly so a typo
// in the env var fails loudly here instead of producing an invalid wire payload.
interface RawSigner {
  address: string
  weight: number | string
}
interface RawPermission {
  type: number
  permissionName: string
  threshold: number | string
  operations: string
  signers: RawSigner[]
}

async function main(): Promise<void> {
  const raw = JSON.parse(PERMISSIONS_JSON as string) as unknown
  if (!Array.isArray(raw)) {
    throw new Error('PERMISSIONS_JSON must be a JSON array.')
  }

  const permissions: PermissionRequest[] = raw.map((p, idx) => {
    const r = p as RawPermission
    if (typeof r.permissionName !== 'string' || r.permissionName.length === 0) {
      throw new Error(`permissions[${idx}].permissionName missing or empty.`)
    }
    if (!Array.isArray(r.signers) || r.signers.length === 0) {
      throw new Error(`permissions[${idx}].signers must be a non-empty array.`)
    }
    const signers: SignerRequest[] = r.signers.map((s, i) => {
      if (typeof s.address !== 'string') {
        throw new Error(`permissions[${idx}].signers[${i}].address must be a string.`)
      }
      return { address: s.address, weight: s.weight as AmountLike }
    })
    return {
      type: r.type,
      permissionName: r.permissionName,
      threshold: r.threshold as AmountLike,
      operations: r.operations,
      signers,
    }
  })

  const request: UpdateAccountPermissionRequest = { permissions }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Account:  ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)
  console.log('UpdateAccountPermission request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).updateAccountPermission(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)
  console.log(`Built and signed. Tx hex (truncated): ${signed.toHex().slice(0, 80)}...`)

  if (!BROADCAST) {
    console.log(
      'BROADCAST_SINGLE_SIGNED=false — stopping here. ' +
        'Use the printed signed tx hex with your multi-sig signer aggregator before broadcasting.',
    )
    await wallet.disconnect(true)
    return
  }

  // Broadcasting works ONLY while the account is still single-signed at the
  // moment of broadcast. Once a multi-sig threshold is in place, the chain
  // requires aggregated signatures — broadcasting a single-signed payload will
  // be rejected.
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Broadcast OK. Hash: ${hash}`)
  console.log(`Explorer:           ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(
    'account-permissions-update failed:',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
})
