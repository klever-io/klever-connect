/**
 * Event Types for Smart Contract Events
 *
 * Types for event filtering, parsing, and handling.
 */

/**
 * Event parameter definition
 */
export interface EventParameter {
  name: string
  type: string
  indexed: boolean
}

/**
 * Event fragment definition from ABI
 */
export interface EventFragment {
  name: string
  inputs: EventParameter[]
}

/**
 * Parsed event with decoded arguments
 */
export interface ParsedEvent {
  name: string
  args: Record<string, unknown>
  signature: string
}

/**
 * Event filter for querying events
 */
export interface EventFilter {
  address?: string
  topics?: (string | null)[]
  fromBlock?: number
  toBlock?: number
}
