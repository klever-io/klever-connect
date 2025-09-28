import { Contract } from './contract'

export class ContractFactory {
  static create(address: string, abi: unknown): Contract {
    return new Contract(address, abi)
  }
}
