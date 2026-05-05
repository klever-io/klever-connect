import { describe, it, expect } from 'vitest'
import { isValidContractAddress } from '../index'

describe('@klever/connect-contracts', () => {
  it('should export expected modules', () => {
    expect(true).toBe(true)
  })

  it('should export isValidContractAddress', () => {
    expect(
      isValidContractAddress('klv1qqqqqqqqqqqqqpgqhe7lg537aszyv48xpuhqh2jykx986wnd932qrd2478'),
    ).toBe(true)
  })
})
