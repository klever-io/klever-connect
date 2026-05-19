/**
 * Flow #1 — provider-network-setup
 *
 * Demonstrates every way to construct a `KleverProvider`:
 *   1. By network name (testnet / mainnet / devnet / local).
 *   2. From the `NETWORKS` catalogue (programmatic discovery).
 *   3. With a fully custom RPC URL via `createCustomNetwork`.
 *
 * Why this is a "common" example:
 *   `KleverProvider` is an isomorphic class — it works in Node, the browser,
 *   and React Native. No DOM and no `fs` are touched.
 *
 * Run:
 *   npm install
 *   npm start          # default: testnet
 *   KLV_NETWORK=devnet npm start
 *   KLV_CUSTOM_RPC=https://node.example.com npm start
 */

import {
  KleverProvider,
  NETWORKS,
  createCustomNetwork,
  // `getNetworkByChainId` is also re-exported from the umbrella; we don't use
  // it in this example but it's worth knowing — it lets you go from a chainId
  // string back to a NetworkConfig.
} from '@klever/connect'

async function main(): Promise<void> {
  // ---------------------------------------------------------------------------
  // 1. Construct a provider by network name.
  //    The accepted values match the keys of `NETWORKS`:
  //      'mainnet' | 'testnet' | 'devnet' | 'local'
  //    Picking a name reads the canonical URLs (HTTP + WebSocket) and chainId
  //    from `NETWORKS` and wires them up automatically.
  // ---------------------------------------------------------------------------
  const networkName = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet'
    | 'testnet'
    | 'devnet'
    | 'local'

  console.log(`Constructing KleverProvider for "${networkName}"`)
  const byName = new KleverProvider({ network: networkName })

  // The provider exposes the network it's bound to via `getNetwork()`.
  // This is an async call only because some implementations may probe the
  // node — for built-in networks it's effectively instant.
  const networkInfo = await byName.getNetwork()
  console.log('  chainId :', networkInfo.chainId)
  console.log('  name    :', networkInfo.name)

  // ---------------------------------------------------------------------------
  // 2. Browse the built-in `NETWORKS` catalogue.
  //    Useful for: building a network picker, validating an env var, or
  //    surfacing the available URLs to the user.
  // ---------------------------------------------------------------------------
  console.log('\nBuilt-in NETWORKS:')
  for (const [key, cfg] of Object.entries(NETWORKS)) {
    // Shape: { name, chainId, api, node, ws? }
    console.log(`  - ${key.padEnd(8)} chainId=${cfg.chainId} api=${cfg.api}`)
  }

  // ---------------------------------------------------------------------------
  // 3. Build a custom-RPC provider.
  //    Use this when you run your own Klever node, or when you want to point
  //    a CI run at a private endpoint.
  // ---------------------------------------------------------------------------
  const customUrl = process.env['KLV_CUSTOM_RPC']
  if (customUrl) {
    // `createCustomNetwork` accepts an arbitrary URL plus the chainId you
    // expect the node to report. Returns a `NetworkConfig` that
    // `KleverProvider` understands.
    const customCfg = createCustomNetwork({
      name: 'custom',
      chainId: '109', // typical testnet chainId — adjust for your endpoint
      api: customUrl,
      node: customUrl,
    })

    const customProvider = new KleverProvider({ network: customCfg })
    const customInfo = await customProvider.getNetwork()
    console.log('\nCustom provider:')
    console.log('  chainId :', customInfo.chainId)
    console.log('  name    :', customInfo.name)
    console.log('  api url :', customUrl)
  } else {
    console.log('\n(KLV_CUSTOM_RPC not set — skipping custom-network demo)')
  }

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
