/**
 * No live RPC required — pure ABI parsing. Empty placeholder so the script
 * `npm run test:testnet` exists per common-folder convention.
 */
import { describe, it, expect } from 'vitest'
import { ABIValidator } from '@klever/connect-contracts'
import counterAbi from './counter-abi.json' with { type: 'json' }

describe('sc-abi-load-and-validate (live)', () => {
  it('the bundled counter ABI continues to validate', () => {
    expect(ABIValidator.validate(counterAbi).valid).toBe(true)
  })
})
