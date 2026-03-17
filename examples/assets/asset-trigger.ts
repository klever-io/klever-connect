/**
 * Asset Trigger Example
 *
 * AssetTrigger (contractType 11) is used to manage an existing KDA token.
 *
 * triggerType values:
 *   0  = Mint        — create new supply
 *   1  = Burn        — destroy supply
 *   2  = Wipe        — wipe balance from an address (owner only)
 *   3  = Pause       — pause all transfers
 *   4  = Resume      — resume transfers
 *   5  = ChangeOwner — transfer ownership to another address
 *   6  = AddRole     — grant mint/burn/deposit role to an address
 *   7  = RemoveRole  — revoke a role
 *   8  = UpdateMetadata — update NFT metadata
 *   9  = StopNFTMint — disable further NFT minting
 *   10 = UpdateLogo  — update token logo URL
 *   11 = UpdateURIs  — update website/social URIs
 *   12 = ChangeRoyaltiesReceiver — update royalties address
 *   13 = UpdateStaking — update staking parameters
 *   14 = UpdateRoyalties — update royalties settings
 *   15 = UpdateKDAFeePool — update the KDA fee pool
 *   16 = StopRoyaltiesChange — lock royalties permanently
 *   17 = StopNFTMetadataChange — lock NFT metadata permanently
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { parseKLV } from '@klever/connect-core'

// Replace with your KDA asset ID
const ASSET_ID = process.env['ASSET_ID'] ?? 'MTT-ABCD-1A'

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log('Asset manager:', wallet.address)

  // ── Mint new supply ──────────────────────────────────────────────────────
  const mint = await wallet.sendTransaction({
    contractType: 11, // TXType.AssetTrigger // AssetTrigger
    triggerType: 0, // Mint
    assetId: ASSET_ID,
    receiver: wallet.address, // mint destination
    amount: parseKLV('500000'),
  })
  console.log('Mint:', mint.hash)

  // ── Burn supply ──────────────────────────────────────────────────────────
  const burn = await wallet.sendTransaction({
    contractType: 11, // TXType.AssetTrigger
    triggerType: 1, // Burn
    assetId: ASSET_ID,
    amount: parseKLV('1000'),
  })
  console.log('Burn:', burn.hash)

  // ── Grant mint role to another address ──────────────────────────────────
  // Replace with the address you want to grant the mint role to
  const minter = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
  const addRole = await wallet.sendTransaction({
    contractType: 11, // TXType.AssetTrigger
    triggerType: 6, // AddRole
    assetId: ASSET_ID,
    role: {
      address: minter,
      hasRoleMint: true,
      hasRoleSetITOPrices: false,
    },
  })
  console.log('AddRole:', addRole.hash)

  // ── Update logo URL ──────────────────────────────────────────────────────
  const updateLogo = await wallet.sendTransaction({
    contractType: 11, // TXType.AssetTrigger
    triggerType: 10, // UpdateLogo
    assetId: ASSET_ID,
    logo: 'https://example.com/token-logo.png',
  })
  console.log('UpdateLogo:', updateLogo.hash)

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
