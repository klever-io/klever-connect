/**
 * Flow #2 — address-validation
 *
 * Klever addresses are bech32-encoded with the prefix `klv1`. The SDK exposes
 * three layers of validation, each stricter than the last:
 *
 *   1. `isKleverAddress(value)` — fast regex check (`klv1[0-9a-z]+` length).
 *      Use this for cheap UI form validation. Catches obvious typos but not
 *      checksum errors.
 *
 *   2. `isValidAddress(value)`  — full bech32 decode + checksum verification.
 *      Use this before submitting a transaction. Slightly slower (one
 *      bech32 decode call) but catches every malformed address.
 *
 *   3. `createKleverAddress(value)` — validate-and-brand. Returns the value
 *      typed as the branded `KleverAddress`. Use this when the value flows
 *      into typed APIs that expect `KleverAddress` (eg `provider.getBalance`).
 *
 * This example exercises all three, plus contract-address recognition via
 * `isContractAddress`.
 */

import {
  isKleverAddress,
  isValidAddress,
  createKleverAddress,
  // `isValidContractAddress` lives in `@klever/connect-core` and recognises
  // smart-contract addresses (`klv1qqqqqqqqqq...`) — they pass `isValidAddress`
  // too, this distinguishes them from ordinary user wallets.
} from '@klever/connect'

// A known-good canned testnet address used in a few tutorials.
const KNOWN_GOOD = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

// Obvious garbage — fails even the regex.
const GARBAGE = 'not-an-address'

// Right shape, wrong checksum (last 6 chars mutated).
const BAD_CHECKSUM = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqaaaaaa'

// Right shape and checksum, but a contract address — useful for distinguishing
// user wallets from smart-contract addresses (deployed contracts have a
// specific bit pattern in the bech32 data section).
const CANNED_CONTRACT_ADDR = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

function classify(label: string, addr: string): void {
  const regexOk = isKleverAddress(addr)
  const bech32Ok = isValidAddress(addr)
  console.log(`  ${label}`)
  console.log(`    raw         : ${addr}`)
  console.log(`    regex check : ${regexOk}`)
  console.log(`    bech32 check: ${bech32Ok}`)

  // Only attempt to brand the address if it passes the strict check —
  // `createKleverAddress` throws otherwise.
  if (bech32Ok) {
    const branded = createKleverAddress(addr)
    // The branded value is a string at runtime but is typed as KleverAddress
    // at compile time. Tools downstream (provider, wallet) use the branded
    // type to forbid passing arbitrary strings.
    console.log(`    branded     : ${branded.slice(0, 12)}...${branded.slice(-8)}`)
  } else {
    console.log('    branded     : (skipped — fails strict bech32 check)')
  }
  console.log('')
}

async function main(): Promise<void> {
  console.log('Address validation demo:\n')

  classify('1. Known-good wallet', KNOWN_GOOD)
  classify('2. Obvious garbage   ', GARBAGE)
  classify('3. Bad checksum      ', BAD_CHECKSUM)
  classify('4. Sample contract   ', CANNED_CONTRACT_ADDR)

  // ---------------------------------------------------------------------------
  // User-supplied address (optional).
  // ---------------------------------------------------------------------------
  const userInput = process.env['KLEVER_ADDRESS']
  if (userInput) {
    classify('5. KLEVER_ADDRESS env', userInput)
  } else {
    console.log('Set KLEVER_ADDRESS in .env to validate your own address.\n')
  }

  // ---------------------------------------------------------------------------
  // Demonstrate the validate-then-brand idiom you'll use everywhere:
  // ---------------------------------------------------------------------------
  function safeBrand(input: string): { ok: true; address: ReturnType<typeof createKleverAddress> } | { ok: false; reason: string } {
    if (!isKleverAddress(input)) return { ok: false, reason: 'fails regex' }
    if (!isValidAddress(input)) return { ok: false, reason: 'fails bech32 checksum' }
    return { ok: true, address: createKleverAddress(input) }
  }

  console.log('safeBrand(KNOWN_GOOD):    ', safeBrand(KNOWN_GOOD))
  console.log('safeBrand(BAD_CHECKSUM):  ', safeBrand(BAD_CHECKSUM))
  console.log('safeBrand(GARBAGE):       ', safeBrand(GARBAGE))

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
