import { describe, it, expect } from 'vitest'

const SHOULD_RUN = (process.env['KLV_LIVE_TESTS'] ?? 'false') === 'true'

describe.skipIf(!SHOULD_RUN)('nodejs-express-rest-api (testnet)', () => {
  it('placeholder live test', () => {
    // Real testing of the running HTTP server is best done via curl /
    // supertest from outside; this placeholder keeps the harness symmetric
    // with the rest of the library.
    expect(true).toBe(true)
  })
})
