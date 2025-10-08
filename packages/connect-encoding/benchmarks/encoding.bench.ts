import { bench, describe } from 'vitest'
import { bech32Encode, bech32Decode, hexEncode, hexDecode } from '@klever/connect-encoding'

/**
 * Encoding/Decoding Performance Benchmarks
 *
 * Goal: Verify encoding operations are fast
 */

describe('Address Encoding Performance', () => {
  const address = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
  const addressBytes = bech32Decode(address).data

  bench('bech32 decode (address to bytes)', () => {
    bech32Decode(address)
  })

  bench('bech32 encode (bytes to address)', () => {
    bech32Encode(addressBytes, 'klv')
  })
})

describe('Hex Encoding Performance', () => {
  const testData = new Uint8Array(1024).fill(42) // 1KB of data
  const hexString = hexEncode(testData)

  bench('hex encode (1KB)', () => {
    hexEncode(testData)
  })

  bench('hex decode (1KB)', () => {
    hexDecode(hexString)
  })
})

describe('Large Data Encoding', () => {
  const smallData = new Uint8Array(100).fill(42) // 100 bytes
  const mediumData = new Uint8Array(10000).fill(42) // 10KB
  const largeData = new Uint8Array(100000).fill(42) // 100KB

  bench('hex encode (100 bytes)', () => {
    hexEncode(smallData)
  })

  bench('hex encode (10KB)', () => {
    hexEncode(mediumData)
  })

  bench('hex encode (100KB)', () => {
    hexEncode(largeData)
  })
})
