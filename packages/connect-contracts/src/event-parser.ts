/**
 * Event Parser for Smart Contract Events
 *
 * Parses and filters events from transaction logs and receipts. Events are emitted
 * by smart contracts during transaction execution and provide valuable information
 * about what happened during contract interactions.
 *
 * @remarks
 * Events in Klever smart contracts consist of:
 * - identifier: Event name (e.g., 'Transfer', 'Approval')
 * - address: Contract address that emitted the event
 * - topics: Indexed event parameters for efficient filtering
 * - data: Non-indexed event parameters containing additional data
 *
 * @example Basic event parsing
 * ```typescript
 * import { EventParser } from '@klever/connect-contracts'
 *
 * // Get transaction receipt
 * const tx = await contract.transfer(toAddress, amount)
 * const receipt = await tx.wait()
 *
 * // Parse all events
 * const events = EventParser.parseEvents(receipt.logs)
 *
 * // Filter by event identifier
 * const transferEvents = EventParser.parseEvents(receipt.logs, {
 *   identifier: 'Transfer'
 * })
 * ```
 *
 * @example Advanced filtering
 * ```typescript
 * // Filter by contract address and identifier
 * const contractEvents = EventParser.parseEvents(receipt.logs, {
 *   address: 'klv1contract...',
 *   identifier: 'BetPlaced'
 * })
 *
 * // Get unique event identifiers
 * const identifiers = EventParser.getEventIdentifiers(receipt.logs)
 * console.log(identifiers) // ['Transfer', 'Approval', 'BetPlaced']
 * ```
 */

/**
 * Transaction log event from blockchain
 * Subset of ILogEvent from @klever/connect-provider to avoid circular dependency
 */
export interface LogEvent {
  address: string
  identifier: string
  topics: string[]
  data: string[]
}

/**
 * Transaction logs containing events
 * Subset of ITransactionLog from @klever/connect-provider to avoid circular dependency
 */
export interface TransactionLog {
  address: string
  contractId?: number
  timestamp?: number
  events: LogEvent[]
}

/**
 * Parsed contract event from transaction logs
 * Contains raw event data from the blockchain
 */
export interface ContractEvent {
  /** Event identifier/name */
  identifier: string
  /** Contract address that emitted the event */
  address: string
  /** Event topics (indexed parameters) */
  topics: string[]
  /** Event data (non-indexed parameters) */
  data: string[]
  /** Raw event object */
  raw: LogEvent
}

/**
 * Filter for parsing specific events from logs
 */
export interface ContractEventFilter {
  /** Filter by event identifier/name */
  identifier?: string
  /** Filter by contract address */
  address?: string
  /** Filter by topics (null = any value) */
  topics?: (string | null)[]
}

/**
 * Event Parser
 *
 * Utility class for parsing and filtering events from transaction logs.
 * Provides static methods for working with contract events without requiring instantiation.
 *
 * @remarks
 * This class provides functionality to:
 * - Parse raw blockchain events into structured format
 * - Filter events by identifier, address, and topics
 * - Extract unique event identifiers from logs
 * - Count event occurrences
 *
 * @example Using EventParser directly
 * ```typescript
 * const events = EventParser.parseEvents(transactionLogs)
 *
 * // Filter to specific event type
 * const betEvents = events.filter(e => e.identifier === 'BetPlaced')
 *
 * // Count event types
 * const counts = EventParser.countEvents(transactionLogs)
 * console.log(counts.get('Transfer')) // Number of Transfer events
 * ```
 */
export class EventParser {
  /**
   * Parse all events from transaction logs
   *
   * @param logs - Transaction logs containing events
   * @param filter - Optional filter to apply
   * @returns Array of parsed events
   *
   * @example
   * ```typescript
   * const tx = await provider.getTransaction(hash)
   * const events = EventParser.parseEvents(tx.logs)
   *
   * // Filter by identifier
   * const betEvents = EventParser.parseEvents(tx.logs, {
   *   identifier: 'BetPlaced'
   * })
   * ```
   */
  static parseEvents(logs?: TransactionLog, filter?: ContractEventFilter): ContractEvent[] {
    if (!logs || !logs.events || logs.events.length === 0) {
      return []
    }

    const events = logs.events.map((event) => this.parseEvent(event))

    if (!filter) {
      return events
    }

    return events.filter((event) => this.matchesFilter(event, filter))
  }

  /**
   * Parse a single event
   */
  private static parseEvent(event: LogEvent): ContractEvent {
    return {
      identifier: event.identifier,
      address: event.address,
      topics: event.topics || [],
      data: event.data || [],
      raw: event,
    }
  }

  /**
   * Check if event matches filter
   */
  private static matchesFilter(event: ContractEvent, filter: ContractEventFilter): boolean {
    // Filter by identifier
    if (filter.identifier && event.identifier !== filter.identifier) {
      return false
    }

    // Filter by address
    if (filter.address && event.address.toLowerCase() !== filter.address.toLowerCase()) {
      return false
    }

    // Filter by topics
    if (filter.topics) {
      for (let i = 0; i < filter.topics.length; i++) {
        const filterTopic = filter.topics[i]
        if (filterTopic !== null && event.topics[i] !== filterTopic) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Get unique event identifiers from logs
   *
   * Extracts and returns all unique event identifiers (names) from the transaction logs.
   * This is useful for discovering what events were emitted during a transaction.
   *
   * @param logs - Transaction logs
   * @returns Array of unique event identifiers
   *
   * @example
   * ```typescript
   * const tx = await contract.performMultipleActions()
   * const receipt = await tx.wait()
   *
   * // Get all unique event types emitted
   * const identifiers = EventParser.getEventIdentifiers(receipt.logs)
   * console.log(identifiers) // ['Transfer', 'Approval', 'ActionCompleted']
   * ```
   */
  static getEventIdentifiers(logs?: TransactionLog): string[] {
    if (!logs || !logs.events) {
      return []
    }

    const identifiers = new Set<string>()
    for (const event of logs.events) {
      identifiers.add(event.identifier)
    }

    return Array.from(identifiers)
  }

  /**
   * Count events by identifier
   *
   * Creates a map showing how many times each event type was emitted in the transaction.
   * Useful for analytics and verification of transaction outcomes.
   *
   * @param logs - Transaction logs
   * @returns Map of identifier to count
   *
   * @example
   * ```typescript
   * const tx = await contract.batchTransfer(recipients, amounts)
   * const receipt = await tx.wait()
   *
   * // Count event occurrences
   * const counts = EventParser.countEvents(receipt.logs)
   *
   * console.log(`Transfer events: ${counts.get('Transfer')}`)
   * console.log(`Approval events: ${counts.get('Approval')}`)
   *
   * // Verify expected number of transfers
   * if (counts.get('Transfer') !== recipients.length) {
   *   console.error('Not all transfers completed!')
   * }
   * ```
   */
  static countEvents(logs?: TransactionLog): Map<string, number> {
    if (!logs || !logs.events) {
      return new Map()
    }

    const counts = new Map<string, number>()
    for (const event of logs.events) {
      const current = counts.get(event.identifier) || 0
      counts.set(event.identifier, current + 1)
    }

    return counts
  }
}
