import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SHOULD_RUN =
  Boolean(process.env['PRIVATE_KEY']) &&
  existsSync(resolve(process.env['WASM_PATH'] ?? '../_fixtures/counter/output/counter.wasm')) &&
  existsSync(resolve(process.env['ABI_PATH'] ?? '../_fixtures/counter/output/counter.abi.json'))

describe.skipIf(!SHOULD_RUN)('sc-deploy (testnet)', () => {
  it('files exist', () => {
    expect(true).toBe(true)
  })
})
