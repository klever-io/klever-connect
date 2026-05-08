import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['CSV_PATH'])

describe.skipIf(!SHOULD_RUN)('csv-bulk-transfer (testnet)', () => {
  it('CSV exists and is readable', () => {
    expect(existsSync(resolve(process.env['CSV_PATH']!))).toBe(true)
  })
})
