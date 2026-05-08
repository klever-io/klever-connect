/**
 * Example: kda-create-nft-collection (Flow 28)
 *
 * Creates a non-fungible KDA collection. The wire protocol is identical to
 * `kda-create-fungible` — the ONLY difference is `type: 1` (AssetType.NonFungible)
 * and `precision: 0` (NFT nonces are integers).
 *
 * After creation, the collection id is `TICKER-XXXX`. Individual NFTs are minted
 * with `kda-mint` (Flow 29) and addressed as `TICKER-XXXX/<nonce>`.
 *
 * Properties commonly set on NFT collections:
 *   - canMint:      essential, otherwise the collection is empty forever
 *   - canBurn:      lets the owner burn NFTs (or holders, with canBurn role)
 *   - canAddRoles:  lets you grant minters
 *   - canPause:     lets you pause transfers (governance / emergency)
 *
 * Royalties are configured later via `kda-set-royalties` (Flow 33).
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const NAME = process.env['KLV_NFT_NAME'] ?? 'MyNFTCollection'
const TICKER = process.env['KLV_NFT_TICKER'] ?? 'MNFT'
const MAX_SUPPLY = process.env['KLV_NFT_MAX_SUPPLY'] ?? '10000'
const LOGO = process.env['KLV_NFT_LOGO']

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner: ${wallet.address}`)
  console.log(`Creating NFT collection "${NAME}" (${TICKER}), maxSupply=${MAX_SUPPLY}`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 1, // TXType.CreateAsset
      type: 1, // AssetType.NonFungible
      name: NAME,
      ticker: TICKER,
      ownerAddress: wallet.address,
      precision: 0, // NFTs always have 0 decimals
      maxSupply: BigInt(MAX_SUPPLY),
      properties: {
        canMint: true,
        canBurn: true,
        canPause: true,
        canAddRoles: true,
        canChangeOwner: true,
      },
      ...(LOGO ? { logo: LOGO } : {}),
      uris: {
        website: 'https://example.com',
      },
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
      console.log(
        `Find the new collection id on the explorer: https://kleverscan.org/transaction/${result.hash}`,
      )
      console.log(`The id will look like ${TICKER}-XXXX. Mint NFTs with kda-mint.`)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('kda-create-nft-collection failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
