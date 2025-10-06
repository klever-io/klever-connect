/**
 * Receipt Parser Tests
 *
 * Tests the receipt parser with real testnet transaction data.
 * Each test fetches actual transaction data from api.testnet.klever.org
 * to ensure the parser works correctly with real blockchain receipts.
 */

import { describe, it, expect } from 'vitest'
import { parseReceipt } from '../utils/receipt-parser'
import type { ITransactionResponse } from '../types/api-types'

// Test helper to fetch transaction from testnet
async function fetchTestnetTransaction(hash: string): Promise<ITransactionResponse> {
  const response = await fetch(`https://api.testnet.klever.org/v1.0/transaction/${hash}`)
  const json = await response.json()
  if (json.error) {
    throw new Error(`Failed to fetch transaction ${hash}: ${json.error}`)
  }
  return json.data.transaction
}

describe('Receipt Parser - Freeze Transactions', () => {
  it('should parse Freeze KLV transaction', async () => {
    // Freeze KLV - creates a bucket with bucketId
    const tx = await fetchTestnetTransaction(
      '2e0994e57f87dcf4c871cccab53afb9a76f4eed6341c0294a7f71eb7034a39c9',
    )

    const result = parseReceipt.freeze(tx)

    expect(result.bucketId).toBe('f1283d045bcde06ac128998f94bf312c13daf402f134227e15e288b037533e09')
    expect(result.amount).toBe(2000000000n)
    expect(result.kda).toBe('KLV')
    expect(result.raw).toBe(tx)
  })

  it('should parse Freeze another asset transaction', async () => {
    // Freeze TKUNAI-125X asset
    const tx = await fetchTestnetTransaction(
      '1f22878cefc24c549d0e309ce096b818cdbdce3900eaf339b23beeffbdb8f62e',
    )

    const result = parseReceipt.freeze(tx)

    expect(result.bucketId).toBe('544b554e41492d31323558')
    expect(result.amount).toBe(2000000000000n)
    expect(result.kda).toBe('TKUNAI-125X')
    expect(result.raw).toBe(tx)
  })
})

describe('Receipt Parser - Unfreeze Transactions', () => {
  it('should parse Unfreeze KLV with delegated bucket', async () => {
    const tx = await fetchTestnetTransaction(
      '81904e20db2e2173814ffb1015fce9b499da8dee228eb07c2aeb2920b5937063',
    )

    const result = parseReceipt.unfreeze(tx)

    expect(result.bucketId).toBe('4b0c5a93ac4687d72b37ca2278b5a284524057da565238209dae261714dc1dfc')
    expect(result.kda).toBe('KLV')
    expect(result.availableAt).toBe(9889)
    expect(result.raw).toBe(tx)
  })

  it('should parse Unfreeze KLV transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'bcf83b63359b764548ed7540380f46bc3a4f2fb2102c1c9560bc722c67d62082',
    )

    const result = parseReceipt.unfreeze(tx)

    expect(result.bucketId).toBe('ab7406878ce9aadbc353877cc934befbd5dbcef54428473cc69fa4fc8ede2cf8')
    expect(result.kda).toBe('KLV')
    expect(result.raw).toBe(tx)
  })

  it('should parse Unfreeze another asset transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'c8d6950ff9e127d45c564fb36febd498a87457468b6fa380c208036cf21c8df2',
    )

    const result = parseReceipt.unfreeze(tx)

    expect(result.bucketId).toBe('4458422d52484739')
    expect(result.kda).toBe('DXB-RHG9')
    expect(result.raw).toBe(tx)
  })
})

describe('Receipt Parser - Claim Transactions', () => {
  it('should parse Claim KFI transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'fad1c67a68308de439c7243afcdd494ad86ef8733ce0ee45afc43db0fe35b534',
    )

    const result = parseReceipt.claim(tx)

    expect(result.rewards).toBeInstanceOf(Array)
    expect(result.rewards.length).toBeGreaterThan(0)
    expect(result.totalClaimed).toBeGreaterThan(0n)
    expect(result.raw).toBe(tx)
  })

  it('should parse Claim Allowance KLV transaction', async () => {
    const tx = await fetchTestnetTransaction(
      '2e14e1ceb3e70c430289821fb3733d3b96907c705c6c39a75cdc768f80e4f31f',
    )

    const result = parseReceipt.claim(tx)

    expect(result.rewards).toBeInstanceOf(Array)
    expect(result.rewards.length).toBeGreaterThan(0)
    expect(result.totalClaimed).toBeGreaterThan(0n)
    expect(result.raw).toBe(tx)
  })

  it('should parse Claim another asset transaction', async () => {
    const tx = await fetchTestnetTransaction(
      '6e660cc612b152510102c07680cd62d272f07e728c31441b1b229add4ded7d1d',
    )

    const result = parseReceipt.claim(tx)

    expect(result.rewards).toBeInstanceOf(Array)
    expect(result.rewards.length).toBeGreaterThan(0)
    expect(result.totalClaimed).toBeGreaterThan(0n)
    expect(result.raw).toBe(tx)
  })
})

describe('Receipt Parser - Withdraw Transactions', () => {
  it('should parse Withdraw KLV transaction', async () => {
    const tx = await fetchTestnetTransaction(
      '00414215edf6a6f26015fda8986883e769cc68ccbffa15e4159f02096a9a0b78',
    )

    const result = parseReceipt.withdraw(tx)

    expect(result.amount).toBeGreaterThan(0n)
    expect(result.kda).toBe('KLV')
    expect(result.raw).toBe(tx)
  })

  it('should parse Withdraw another asset transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'f36a4a8e818a71292cb3910300c806f5b2a0c91688544c9c2ee1bd20d0d10fa1',
    )

    const result = parseReceipt.withdraw(tx)

    expect(result.amount).toBeGreaterThan(0n)
    expect(result.kda).not.toBe('KLV')
    expect(result.raw).toBe(tx)
  })
})

describe('Receipt Parser - Delegate Transactions', () => {
  it('should parse Delegate already delegated bucket (re-delegate)', async () => {
    const tx = await fetchTestnetTransaction(
      'c8065e545bac5b107f68b25ed1e6a2ac7c75914ecaac85f6c6f25d95bd1fc5f9',
    )

    const result = parseReceipt.delegate(tx)

    // This test needs actual values - keeping as is for now since we need the specific transaction data
    expect(result.validator).toBeDefined()
    expect(result.bucketId).toBeDefined()
    expect(result.raw).toBe(tx)
  })

  it('should parse Delegate transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'ef671c1f288bf9047f9e008b28df6040d0d931d323bedd5d0617b7085f0cdf2c',
    )

    const result = parseReceipt.delegate(tx)

    expect(result.validator).toBe('klv1rj8uef37nfa8ezndupnplvnmgpwg2z9z723vrp9sypytkh3caqdsf4xe5d')
    expect(result.bucketId).toBe('65d957c34d39af5eaf28b0d4a7756e68f9720f4da6f4999116b4f7e5fb4b2317')
    expect(result.raw).toBe(tx)
  })
})

describe('Receipt Parser - Undelegate Transactions', () => {
  it('should parse Undelegate transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'ad5d2064a44c1f4ecca1ba5ba13f8f5028811f750938156f6870ac3ff5c6625d',
    )

    const result = parseReceipt.undelegate(tx)

    expect(result.bucketId).toBe('7a103cf4f4cfdd020d2bf08e94274a832c7862d3fa15ab1fc93e25e3caa345f2')
    expect(result.raw).toBe(tx)
  })
})

describe('Receipt Parser - Transfer Transactions', () => {
  it('should parse simple Transfer transaction', async () => {
    const tx = await fetchTestnetTransaction(
      'b9fc1a0dc9441f19b8c8f00557e8b57e9ddefb849867ffabbadead802f3d5378',
    )

    const result = parseReceipt.transfer(tx)

    // Need actual values from this transaction
    expect(result.sender).toBeDefined()
    expect(result.receiver).toBeDefined()
    expect(result.amount).toBeGreaterThan(0n)
    expect(result.kda).toBe('KLV')
    expect(result.raw).toBe(tx)
  })

  it('should parse Transfer KFI transaction', async () => {
    const tx = await fetchTestnetTransaction(
      '4dba872bfa2cd37d03f7b70dbada338848162d080d5920b3ff0691c8dfcb5f08',
    )

    const result = parseReceipt.transfer(tx)

    expect(result.sender).toBe('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
    expect(result.receiver).toBe('klv1sjpwc9e8dmx7r9wjzkh76ug5vxgetfvwtczsquy4vhnzrj2jkfkqg3plnv')
    expect(result.amount).toBe(30000000000n)
    expect(result.kda).toBe('KFI')
    expect(result.raw).toBe(tx)
  })

  it('should parse multi-transfer transaction', async () => {
    const tx = await fetchTestnetTransaction(
      '4921dd9e5b3f9b6bc73049f205631ea144374cb0b28b0bcd1181776759507ff4',
    )

    const result = parseReceipt.transfer(tx)

    // Primary transfer (first one)
    expect(result.sender).toBe('klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z')
    expect(result.receiver).toBe('klv1mt8yw657z6nk9002pccmwql8w90k0ac6340cjqkvm9e7lu0z2wjqudt69s')
    expect(result.amount).toBe(9000000000000000n)
    expect(result.kda).toBe('KLV')

    // Should have all 22 transfers in array
    expect(result.transfers).toBeDefined()
    expect(result.transfers?.length).toBe(22)
    expect(result.raw).toBe(tx)
  })
})
