/**
 * Flow #57 — sc-query-readonly
 *
 * Call a read-only smart contract endpoint with no transaction (and therefore
 * no signing key, no fees, no on-chain side effects). Demonstrates:
 *
 *   - Construct a `Contract` from (address, ABI, provider).
 *   - Call a `readonly` endpoint via `contract.call('endpointName', ...args)`.
 *   - The query returns decoded JS values (here: a `u64` -> bigint).
 *
 * Fixture: the in-repo `_fixtures/counter/` Rust contract. We bundle a copy
 * of its ABI in this example folder (`counter-abi.json`) so this flow is
 * self-contained: you don't need to compile the Rust source for the SDK
 * call to type-check or for the test to run.
 */

import { Contract, KleverProvider, isValidAddress, createKleverAddress } from '@klever/connect'
import counterAbi from './counter-abi.json' with { type: 'json' }

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const rawAddr = process.env['COUNTER_ADDRESS']
  if (!rawAddr) {
    throw new Error(
      'Set COUNTER_ADDRESS in .env to a deployed counter contract. Deploy via nodejs/sc-deploy/.',
    )
  }
  if (!isValidAddress(rawAddr)) throw new Error(`Invalid contract address: ${rawAddr}`)
  const address = createKleverAddress(rawAddr)

  // Construct the Contract.
  // Read-only: pass the provider as the "signer" — the SDK only needs
  // network access for `.call()`, no signing required.
  const contract = new Contract(address, counterAbi, provider)

  // Invoke the readonly endpoint.
  // The ABI declares `getValue` as `readonly` so the SDK routes it through
  // `provider.queryContract` instead of building a transaction.
  const value = await contract.call('getValue')

  console.log(`Network         : ${network}`)
  console.log(`Contract        : ${address}`)
  console.log(`getValue() -> u64: ${value}`)
  console.log(`(typeof: ${typeof value})`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
