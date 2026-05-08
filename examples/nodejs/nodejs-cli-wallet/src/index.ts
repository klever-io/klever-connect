#!/usr/bin/env -S tsx
/**
 * Example: nodejs-cli-wallet (Flow 64)
 *
 * A small but complete multi-command CLI for the Klever blockchain.
 * Built on `node:util.parseArgs` so it has zero external dependencies beyond
 * the SDK itself. Five commands:
 *
 *   balance   - read KLV (or KDA) balance for an address
 *   transfer  - send KLV or a KDA to another address (signs with PRIVATE_KEY)
 *   account   - show the full account state
 *   faucet    - request testnet KLV (testnet/devnet only)
 *   tx        - look up a transaction by hash
 *
 * Salvages and TS-rewrites `_legacy/nodejs/cli/bin/klever-cli.js`.
 *
 * Why parseArgs (not yargs/commander)
 * -----------------------------------
 * The Node 20+ stdlib provides `parseArgs`, which is enough for a serious CLI.
 * Avoiding extra deps keeps the example a single-file install.
 */

import 'node:process'
import { parseArgs } from 'node:util'

import {
  KleverProvider,
  NodeWallet,
  formatKLV,
  parseKLV,
  isValidAddress,
  type KleverAddress,
  type TransactionHash,
} from '@klever/connect'

const HELP = `
Klever CLI — interact with the Klever blockchain

Commands:
  balance   Check KLV (or KDA) balance of an address
  transfer  Send KLV or a KDA token to another address (requires PRIVATE_KEY)
  account   Show full account information
  faucet    Request test KLV (testnet/devnet only; requires PRIVATE_KEY)
  tx        Get transaction details by hash

Options:
  --address <addr>   Klever address (falls back to PRIVATE_KEY-derived address)
  --to      <addr>   Recipient (transfer only)
  --amount  <num>    Amount in KLV, e.g. 1.5 (transfer only)
  --asset   <id>     KDA id (optional)
  --hash    <hash>   Transaction hash (tx only)
  --network <name>   mainnet | testnet | devnet | local
  --help             Show this help

Examples:
  klever-cli balance --address klv1...
  klever-cli transfer --to klv1... --amount 1.5
  klever-cli faucet
  klever-cli tx --hash abc123...
`.trim()

interface ParsedValues {
  address?: string
  to?: string
  amount?: string
  asset?: string
  hash?: string
  network?: string
  help?: boolean
}

interface CliCtx {
  provider: KleverProvider
  values: ParsedValues
  network: 'mainnet' | 'testnet' | 'devnet' | 'local'
}

function parseCli(argv: string[]): { command: string | undefined; values: ParsedValues } {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      address: { type: 'string' },
      to: { type: 'string' },
      amount: { type: 'string' },
      asset: { type: 'string' },
      hash: { type: 'string' },
      network: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  })
  return { command: positionals[0], values: values as ParsedValues }
}

async function loadWallet(provider: KleverProvider): Promise<NodeWallet> {
  const pk = process.env['PRIVATE_KEY']
  if (!pk) {
    console.error('Error: PRIVATE_KEY environment variable is required for this command.')
    process.exit(1)
  }
  const wallet = new NodeWallet(provider, pk)
  await wallet.connect()
  return wallet
}

async function resolveAddress(ctx: CliCtx): Promise<KleverAddress> {
  if (ctx.values.address) {
    if (!isValidAddress(ctx.values.address)) {
      console.error(`Error: Invalid address: ${ctx.values.address}`)
      process.exit(1)
    }
    return ctx.values.address as KleverAddress
  }
  // Fall back to the PRIVATE_KEY-derived address.
  const wallet = await loadWallet(ctx.provider)
  const addr = wallet.address as KleverAddress
  await wallet.disconnect(true)
  return addr
}

async function cmdBalance(ctx: CliCtx): Promise<void> {
  const addr = await resolveAddress(ctx)
  const asset = ctx.values.asset ?? 'KLV'
  const bal = await ctx.provider.getBalance(addr, asset)
  if (asset === 'KLV') {
    console.log(`${formatKLV(typeof bal === 'bigint' ? bal : BigInt(String(bal)))} KLV`)
  } else {
    console.log(`${bal} ${asset} (raw)`)
  }
}

async function cmdAccount(ctx: CliCtx): Promise<void> {
  const addr = await resolveAddress(ctx)
  const acct = await ctx.provider.getAccount(addr)
  console.log(JSON.stringify(acct, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
}

async function cmdFaucet(ctx: CliCtx): Promise<void> {
  if (ctx.network === 'mainnet') {
    console.error('Faucet is not available on mainnet.')
    process.exit(1)
  }
  const wallet = await loadWallet(ctx.provider)
  const addr = (ctx.values.address ?? wallet.address) as KleverAddress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (ctx.provider as any).requestTestKLV(addr)
  console.log(JSON.stringify(result, null, 2))
  await wallet.disconnect(true)
}

async function cmdTx(ctx: CliCtx): Promise<void> {
  if (!ctx.values.hash) {
    console.error('Error: --hash is required.')
    process.exit(1)
  }
  const tx = await ctx.provider.getTransaction(ctx.values.hash as TransactionHash)
  console.log(JSON.stringify(tx, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
}

async function cmdTransfer(ctx: CliCtx): Promise<void> {
  const { to, amount, asset } = ctx.values
  if (!to) {
    console.error('Error: --to is required.')
    process.exit(1)
  }
  if (!isValidAddress(to)) {
    console.error(`Error: invalid --to: ${to}`)
    process.exit(1)
  }
  if (!amount) {
    console.error('Error: --amount is required.')
    process.exit(1)
  }
  const wallet = await loadWallet(ctx.provider)
  const isKLV = !asset || asset === 'KLV'
  const params: { receiver: string; amount: bigint | string; kda?: string } = {
    receiver: to,
    amount: isKLV ? parseKLV(amount) : amount,
  }
  if (asset && asset !== 'KLV') params.kda = asset
  const result = await wallet.transfer(params)
  console.log(`Transfer tx hash: ${result.hash}`)
  console.log(`Status:           ${result.status}`)
  await wallet.disconnect(true)
}

async function main(): Promise<void> {
  const { command, values } = parseCli(process.argv.slice(2))
  if (values.help || !command) {
    console.log(HELP)
    return
  }
  const network = (values.network ?? process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet'
    | 'testnet'
    | 'devnet'
    | 'local'
  const provider = new KleverProvider({ network })
  const ctx: CliCtx = { provider, values, network }

  switch (command) {
    case 'balance':
      await cmdBalance(ctx)
      break
    case 'account':
      await cmdAccount(ctx)
      break
    case 'faucet':
      await cmdFaucet(ctx)
      break
    case 'tx':
      await cmdTx(ctx)
      break
    case 'transfer':
      await cmdTransfer(ctx)
      break
    default:
      console.error(`Unknown command: ${command}\n`)
      console.log(HELP)
      process.exit(1)
  }
}

main().catch((err) => {
  console.error('CLI failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
