import { bench, describe } from 'vitest'
import { TransactionBuilder } from '@klever/connect-transactions'
import { parseKLV } from '@klever/connect-core'

/**
 * Transaction Building Performance Benchmarks
 *
 * Goal: Verify transaction building is < 100ms
 */

describe('Transaction Building Performance', () => {
  bench('simple transfer transaction', () => {
    TransactionBuilder.create()
      .transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: parseKLV('100'),
      })
      .buildProto({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 123,
        chainId: '100',
        fees: { kAppFee: 500000, bandwidthFee: 100000 },
      })
  })

  bench('complex multi-contract transaction', () => {
    TransactionBuilder.create()
      .transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: parseKLV('100'),
      })
      .freeze({
        amount: parseKLV('50'),
        kda: 'KLV',
      })
      .delegate({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        bucketId: 'bucket123',
      })
      .buildProto({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 123,
        chainId: '100',
        fees: { kAppFee: 1500000, bandwidthFee: 300000 },
      })
  })

  bench('transaction with data and permissionId', () => {
    TransactionBuilder.create()
      .transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: parseKLV('100'),
      })
      .data(['metadata', 'test'])
      .permissionId(1)
      .buildProto({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 123,
        chainId: '100',
        fees: { kAppFee: 500000, bandwidthFee: 100000 },
      })
  })

  bench('transaction with KDA fee', () => {
    TransactionBuilder.create()
      .transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: parseKLV('100'),
      })
      .kdaFee({ kda: 'USDT', amount: 1000000n })
      .buildProto({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 123,
        chainId: '100',
        fees: { kAppFee: 0, bandwidthFee: 0 },
      })
  })
})

describe('Transaction Encoding Performance', () => {
  const tx = TransactionBuilder.create()
    .transfer({
      receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      amount: parseKLV('100'),
    })
    .buildProto({
      sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      nonce: 123,
      chainId: '100',
      fees: { kAppFee: 500000, bandwidthFee: 100000 },
    })

  bench('encode to proto bytes', () => {
    tx.toBytes()
  })

  bench('encode to hex string', () => {
    tx.toHex()
  })

  bench('compute transaction hash', () => {
    tx.getHash()
  })
})

describe('Transaction Signing Performance', () => {
  const tx = TransactionBuilder.create()
    .transfer({
      receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      amount: parseKLV('100'),
    })
    .buildProto({
      sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      nonce: 123,
      chainId: '100',
      fees: { kAppFee: 500000, bandwidthFee: 100000 },
    })

  // Using a test private key (DO NOT use in production)
  const privateKey = new Uint8Array(32).fill(1)

  bench('sign transaction', async () => {
    await tx.sign(privateKey)
  })
})
