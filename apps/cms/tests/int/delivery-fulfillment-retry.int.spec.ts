import { describe, expect, it } from 'vitest'
import {
  classifySubmissionFailure,
  retryDelayMinutes,
} from '../../src/jobs/deliveryFulfillment'

describe('delivery fulfillment retries', () => {
  it('retries definite pre-submission timeout and server failures', () => {
    expect(classifySubmissionFailure(408, false)).toMatchObject({
      retryable: true,
      ambiguous: false,
    })
    expect(classifySubmissionFailure(500, false)).toMatchObject({
      retryable: true,
      ambiguous: false,
    })
    expect(classifySubmissionFailure(429, true)).toMatchObject({
      retryable: true,
      ambiguous: false,
    })
  })

  it('requires reconciliation instead of retrying ambiguous submitted requests', () => {
    expect(classifySubmissionFailure(408, true)).toMatchObject({
      retryable: false,
      ambiguous: true,
    })
    expect(classifySubmissionFailure(503, true)).toMatchObject({
      retryable: false,
      ambiguous: true,
    })
  })

  it('keeps exponential retry delays bounded without a fixed attempt cutoff', () => {
    expect(retryDelayMinutes(1)).toBe(1)
    expect(retryDelayMinutes(2)).toBe(2)
    expect(retryDelayMinutes(8)).toBe(60)
    expect(retryDelayMinutes(100)).toBe(60)
  })
})
