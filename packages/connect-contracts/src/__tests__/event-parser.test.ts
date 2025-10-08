/**
 * Tests for Event Parser
 */

import { describe, expect, it } from 'vitest'
import { EventParser, type TransactionLog, type LogEvent } from '../event-parser'

describe('EventParser', () => {
  const mockEvents: LogEvent[] = [
    {
      address: 'klv1contract1',
      identifier: 'BetPlaced',
      topics: ['0x123', '0x456'],
      data: ['0xabc', '0xdef'],
    },
    {
      address: 'klv1contract1',
      identifier: 'BetSettled',
      topics: ['0x789'],
      data: ['0x111'],
    },
    {
      address: 'klv1contract2',
      identifier: 'Transfer',
      topics: ['0xaaa', '0xbbb'],
      data: ['0xccc'],
    },
  ]

  const mockLogs: TransactionLog = {
    address: 'klv1contract1',
    events: mockEvents,
  }

  describe('parseEvents', () => {
    it('should parse all events without filter', () => {
      const events = EventParser.parseEvents(mockLogs)
      expect(events).toHaveLength(3)
      expect(events[0].identifier).toBe('BetPlaced')
      expect(events[1].identifier).toBe('BetSettled')
      expect(events[2].identifier).toBe('Transfer')
    })

    it('should return empty array for undefined logs', () => {
      const events = EventParser.parseEvents(undefined)
      expect(events).toEqual([])
    })

    it('should return empty array for logs without events', () => {
      const emptyLogs: TransactionLog = {
        address: 'klv1test',
        events: [],
      }
      const events = EventParser.parseEvents(emptyLogs)
      expect(events).toEqual([])
    })

    it('should filter events by identifier', () => {
      const events = EventParser.parseEvents(mockLogs, {
        identifier: 'BetPlaced',
      })
      expect(events).toHaveLength(1)
      expect(events[0].identifier).toBe('BetPlaced')
      expect(events[0].topics).toEqual(['0x123', '0x456'])
    })

    it('should filter events by address', () => {
      const events = EventParser.parseEvents(mockLogs, {
        address: 'klv1contract1',
      })
      expect(events).toHaveLength(2)
      expect(events[0].identifier).toBe('BetPlaced')
      expect(events[1].identifier).toBe('BetSettled')
    })

    it('should filter events by address (case insensitive)', () => {
      const events = EventParser.parseEvents(mockLogs, {
        address: 'KLV1CONTRACT1',
      })
      expect(events).toHaveLength(2)
    })

    it('should filter events by topics', () => {
      const events = EventParser.parseEvents(mockLogs, {
        topics: ['0x123'],
      })
      expect(events).toHaveLength(1)
      expect(events[0].identifier).toBe('BetPlaced')
    })

    it('should filter events by topics with null wildcard', () => {
      const events = EventParser.parseEvents(mockLogs, {
        topics: [null, '0x456'],
      })
      expect(events).toHaveLength(1)
      expect(events[0].identifier).toBe('BetPlaced')
    })

    it('should combine multiple filters', () => {
      const events = EventParser.parseEvents(mockLogs, {
        address: 'klv1contract1',
        identifier: 'BetPlaced',
      })
      expect(events).toHaveLength(1)
      expect(events[0].identifier).toBe('BetPlaced')
      expect(events[0].address).toBe('klv1contract1')
    })

    it('should preserve event data structure', () => {
      const events = EventParser.parseEvents(mockLogs)
      const event = events[0]

      expect(event).toHaveProperty('identifier')
      expect(event).toHaveProperty('address')
      expect(event).toHaveProperty('topics')
      expect(event).toHaveProperty('data')
      expect(event).toHaveProperty('raw')
      expect(event.raw).toBe(mockEvents[0])
    })
  })

  describe('getEventIdentifiers', () => {
    it('should return unique event identifiers', () => {
      const identifiers = EventParser.getEventIdentifiers(mockLogs)
      expect(identifiers).toHaveLength(3)
      expect(identifiers).toContain('BetPlaced')
      expect(identifiers).toContain('BetSettled')
      expect(identifiers).toContain('Transfer')
    })

    it('should handle duplicate identifiers', () => {
      const logsWithDuplicates: TransactionLog = {
        address: 'klv1test',
        events: [
          { address: 'klv1test', identifier: 'Transfer', topics: [], data: [] },
          { address: 'klv1test', identifier: 'Transfer', topics: [], data: [] },
          { address: 'klv1test', identifier: 'Approval', topics: [], data: [] },
        ],
      }

      const identifiers = EventParser.getEventIdentifiers(logsWithDuplicates)
      expect(identifiers).toHaveLength(2)
      expect(identifiers).toContain('Transfer')
      expect(identifiers).toContain('Approval')
    })

    it('should return empty array for undefined logs', () => {
      const identifiers = EventParser.getEventIdentifiers(undefined)
      expect(identifiers).toEqual([])
    })
  })

  describe('countEvents', () => {
    it('should count events by identifier', () => {
      const counts = EventParser.countEvents(mockLogs)
      expect(counts.size).toBe(3)
      expect(counts.get('BetPlaced')).toBe(1)
      expect(counts.get('BetSettled')).toBe(1)
      expect(counts.get('Transfer')).toBe(1)
    })

    it('should handle multiple events with same identifier', () => {
      const logsWithMultiple: TransactionLog = {
        address: 'klv1test',
        events: [
          { address: 'klv1test', identifier: 'Transfer', topics: [], data: [] },
          { address: 'klv1test', identifier: 'Transfer', topics: [], data: [] },
          { address: 'klv1test', identifier: 'Approval', topics: [], data: [] },
        ],
      }

      const counts = EventParser.countEvents(logsWithMultiple)
      expect(counts.get('Transfer')).toBe(2)
      expect(counts.get('Approval')).toBe(1)
    })

    it('should return empty map for undefined logs', () => {
      const counts = EventParser.countEvents(undefined)
      expect(counts.size).toBe(0)
    })
  })
})
