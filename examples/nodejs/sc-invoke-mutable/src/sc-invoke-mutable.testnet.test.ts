import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  KleverProvider,
  NodeWallet,
  Contract,
  createKleverAddress,
  type ContractABI,
} from '@klever/connect'

const SHOULD_RUN =
  Boolean(process.env['PRIVATE_KEY']) &&
  Boolean(process.env['CONTRACT_ADDRESS']) &&
  existsSync(resolve(process.env['ABI_PATH'] ?? '../_fixtures/counter/output/counter.abi.json'))

describe.skipIf(!SHOULD_RUN)('sc-invoke-mutable (testnet)', () => {
  it('builds an invoke against a real contract', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const abi = JSON.parse(
      readFileSync(
        resolve(
          process.env['ABI_PATH'] ?? '../_fixtures/counter/output/counter.abi.json',
        ),
        'utf-8',
      ),
    ) as ContractABI
    const contract = new Contract(
      createKleverAddress(process.env['CONTRACT_ADDRESS']!),
      abi,
      wallet,
    )
    expect(contract).toBeDefined()
    await wallet.disconnect(true)
  }, 30_000)
})
