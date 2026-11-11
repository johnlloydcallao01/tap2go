import { describe, expect, it } from 'vitest'
import { buildVendorReportsCore } from '../../src/utils/vendorReportsShared'

describe('vendor report payment totals', () => {
  it('does not count separately paid Lalamove priority fees as vendor order revenue', () => {
    const report = buildVendorReportsCore(
      {
        days: 0,
        label: 'all',
        now: new Date('2026-01-01T00:00:00.000Z'),
        periodStart: null,
      },
      {
        merchantsDocs: [],
        ordersDocs: [],
        transactionsDocs: [
          { id: 1, status: 'paid', transaction_type: 'order', amount: 100 },
          { id: 2, status: 'paid', transaction_type: 'priority_fee', amount: 25 },
          { id: 3, status: 'paid', amount: 50 },
        ],
      },
    )

    expect(report.paidTxPeriod.map((transaction) => transaction.id)).toEqual([1, 3])
  })
})
