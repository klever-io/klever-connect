#!/usr/bin/env node
/**
 * Klever CLI Wallet Tool
 *
 * A command-line interface for interacting with the Klever blockchain.
 * Uses Node.js built-in util.parseArgs (no external dependencies).
 *
 * Usage:
 *   node cli/bin/klever-cli.js --help
 *   node cli/bin/klever-cli.js balance --address klv1...
 *   node cli/bin/klever-cli.js transfer --to klv1... --amount 1.5
 *   node cli/bin/klever-cli.js account --address klv1...
 *   node cli/bin/klever-cli.js faucet --address klv1...
 *   node cli/bin/klever-cli.js tx --hash <hash>
 *
 * Environment variables:
 *   NETWORK     - Network to use (default: testnet)
 *   PRIVATE_KEY - Private key for signing transactions
 */

import 'dotenv/config'
import { parseArgs } from 'util'
import { KleverProvider, NodeWallet, formatKLV, parseKLV, isValidAddress } from '@klever/connect'

const NETWORK = process.env.NETWORK || 'testnet'

// ─── Help ─────────────────────────────────────────────────────────────────────

const HELP = `
Klever CLI — interact with the Klever blockchain

Commands:
  balance   Check KLV (or KDA) balance of an address
  transfer  Send KLV or a KDA token to another address
  account   Show full account information
  faucet    Request test KLV (testnet/devnet only)
  tx        Get transaction details by hash

Options:
  --address  <addr>   Klever address (falls back to wallet from PRIVATE_KEY)
  --to       <addr>   Recipient address (transfer only)
  --amount   <num>    Amount in KLV, e.g. 1.5 (transfer only)
  --asset    <id>     KDA token ID (optional)
  --hash     <hash>   Transaction hash (tx only)
  --network  <name>   mainnet | testnet | devnet (default: testnet)
  --help              Show this help

Examples:
  node cli/bin/klever-cli.js balance --address klv1...
  node cli/bin/klever-cli.js transfer --to klv1... --amount 1.5
  node cli/bin/klever-cli.js faucet
  node cli/bin/klever-cli.js tx --hash abc123...
`.trim()

// ─── Argument parsing ─────────────────────────────────────────────────────────

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
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

const command = positionals[0]
const network = values.network || NETWORK

if (values.help || !command) {
  console.log(HELP)
  process.exit(0)
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

function getProvider() {
  return new KleverProvider({ network })
}

async function getWallet(provider) {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable is required for this command.')
    process.exit(1)
  }
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()
  return wallet
}

async function resolveAddress(provider) {
  if (values.address) {
    if (!isValidAddress(values.address)) {
      console.error(`Error: Invalid address: ${values.address}`)
      process.exit(1)
    }
    return values.address
  }
  const wallet = await getWallet(provider)
  return wallet.address
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdBalance() {
  const provider = getProvider()
  const address = await resolveAddress(provider)
  const balance = await provider.getBalance(address, values.asset)

  if (values.asset) {
    console.log(`${values.asset} balance: ${balance.toString()}`)
  } else {
    console.log(`KLV balance: ${formatKLV(balance)} KLV`)
  }
}

async function cmdTransfer() {
  if (!values.to || !isValidAddress(values.to)) {
    console.error('Error: --to <address> is required and must be a valid Klever address')
    process.exit(1)
  }
  if (!values.amount || isNaN(parseFloat(values.amount))) {
    console.error('Error: --amount <value> is required')
    process.exit(1)
  }

  const provider = getProvider()
  const wallet = await getWallet(provider)

  console.log(`Sending ${values.amount} ${values.asset ?? 'KLV'} to ${values.to}...`)

  const result = await wallet.transfer({
    receiver: values.to,
    amount: parseKLV(values.amount),
    ...(values.asset ? { kda: values.asset } : {}),
  })

  console.log(`✓ Transaction submitted`)
  console.log(`  Hash:     ${result.hash}`)
  console.log(`  Status:   ${result.status}`)
  console.log(`  Explorer: ${provider.getTransactionUrl(result.hash)}`)
  await wallet.disconnect(true)
}

async function cmdAccount() {
  const provider = getProvider()
  const address = await resolveAddress(provider)
  const account = await provider.getAccount(address)

  console.log(`\nAccount: ${address}`)
  console.log(`Network: ${network}`)
  console.log(`Nonce:   ${account.nonce}`)
  console.log(`Balance: ${formatKLV(account.balance)} KLV`)

  const assets = account.assets ?? {}
  const assetKeys = Object.keys(assets)
  if (assetKeys.length > 0) {
    console.log(`\nAssets:`)
    for (const id of assetKeys) {
      console.log(`  ${id}: ${assets[id].balance.toString()}`)
    }
  }
}

async function cmdFaucet() {
  if (network === 'mainnet') {
    console.error('Error: Faucet is not available on mainnet')
    process.exit(1)
  }
  const provider = getProvider()
  const address = await resolveAddress(provider)

  console.log(`Requesting test KLV for ${address}...`)
  await provider.requestTestKLV(address)
  console.log(`✓ Faucet request sent! Funds should arrive shortly.`)
}

async function cmdTx() {
  if (!values.hash) {
    console.error('Error: --hash <txhash> is required')
    process.exit(1)
  }
  const provider = getProvider()
  const tx = await provider.getTransaction(values.hash)
  console.log(JSON.stringify(tx, null, 2))
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

const commands = {
  balance: cmdBalance,
  transfer: cmdTransfer,
  account: cmdAccount,
  faucet: cmdFaucet,
  tx: cmdTx,
}

const fn = commands[command]
if (!fn) {
  console.error(`Unknown command: ${command}`)
  console.error(`Run with --help to see available commands`)
  process.exit(1)
}

fn().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
