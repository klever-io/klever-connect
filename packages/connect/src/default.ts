import { NETWORKS } from '@klever/connect-provider'
import { Klever } from './klever'

export const klever = new Klever({ network: NETWORKS.mainnet })
