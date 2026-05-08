/**
 * Example: kda-create-fungible (Flow 27)
 *
 * Creates a new fungible Klever Digital Asset (KDA). The asset id assigned by the
 * chain follows the pattern `TICKER-XXXX` where XXXX is a 4-character hex suffix
 * (visible in the resulting tx receipt or on the explorer).
 *
 * Naming rules
 * ------------
 * - `name`: alphanumeric only — no spaces, no punctuation.
 * - `ticker`: alphanumeric, typically 3-5 uppercase letters; must be unique-ish per epoch.
 *
 * Properties cheatsheet
 * ---------------------
 * - canMint:        more supply can be minted later (Flow 29)
 * - canBurn:        supply can be reduced (Flow 30)
 * - canPause:       transfers can be globally paused (Flow 34)
 * - canFreeze:      asset can be frozen for staking pools (FPR)
 * - canWipe:        owner can wipe a holder's balance (admin function)
 * - canChangeOwner: ownership transferable
 * - canAddRoles:    other addresses can be granted mint/burn/deposit roles (Flow 31)
 *
 * Caveat: CreateAsset has a substantial KLV fee. On testnet you'll need a wallet
 * with at least a few KLV; on mainnet, several thousand KLV. Read the chain's
 * current `CreateAssetCost` parameter via `provider.getNetwork()` before running.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 1, type: 0, ... })`
 *   - contractType 1 = TXType.CreateAsset
 *   - type 0         = AssetType.Fungible (1 = NFT, 2 = SemiFungible)
 *
 * The umbrella does not export `AssetType`, so we use numeric literals.
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const NAME = process.env['KLV_KDA_NAME'] ?? 'MyTestToken'
const TICKER = process.env['KLV_KDA_TICKER'] ?? 'MTT'
const PRECISION = Number(process.env['KLV_KDA_PRECISION'] ?? '6')
const INITIAL = process.env['KLV_KDA_INITIAL_SUPPLY'] ?? '1000000000'
const MAX = process.env['KLV_KDA_MAX_SUPPLY'] ?? '10000000000'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner: ${wallet.address}`)
  console.log(`Creating fungible KDA "${NAME}" (${TICKER}) precision=${PRECISION}`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 1, // TXType.CreateAsset
      type: 0, // AssetType.Fungible
      name: NAME,
      ticker: TICKER,
      ownerAddress: wallet.address,
      precision: PRECISION,
      initialSupply: BigInt(INITIAL),
      maxSupply: BigInt(MAX),
      properties: {
        canFreeze: true,
        canMint: true,
        canBurn: true,
        canPause: true,
        canChangeOwner: true,
        canAddRoles: true,
        canWipe: false,
      },
      uris: {
        website: 'https://example.com',
      },
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
      console.log(
        `Find the new asset id on the explorer: https://kleverscan.org/transaction/${result.hash}`,
      )
      console.log(`The id will look like ${TICKER}-XXXX`)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('kda-create-fungible failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
