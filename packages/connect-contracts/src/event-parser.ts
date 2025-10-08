/**
 * Event Parser for Smart Contract Events
 *
 * Parses events from transaction logs and receipts.
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
 * Utility for parsing events from transaction logs.
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
   * @param logs - Transaction logs
   * @returns Array of unique event identifiers
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
   * @param logs - Transaction logs
   * @returns Map of identifier to count
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
