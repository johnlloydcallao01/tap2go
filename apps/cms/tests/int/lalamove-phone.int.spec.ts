import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isE164PhoneNumber,
  LalamoveApiError,
  normalizeLalamovePhoneNumber,
  placeOrder,
} from '../../src/services/lalamoveClient'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Lalamove phone normalization', () => {
  it('converts Philippine local mobile numbers to E.164', () => {
    expect(normalizeLalamovePhoneNumber('0946 874 8743')).toBe('+639468748743')
    expect(normalizeLalamovePhoneNumber('946-874-8743')).toBe('+639468748743')
    expect(normalizeLalamovePhoneNumber('639468748743')).toBe('+639468748743')
  })

  it('preserves already international or unrecognized numbers', () => {
    expect(normalizeLalamovePhoneNumber('+639468748743')).toBe('+639468748743')
    expect(normalizeLalamovePhoneNumber('+14155552671')).toBe('+14155552671')
    expect(normalizeLalamovePhoneNumber('+1 (415) 555-2671')).toBe('+14155552671')
    expect(normalizeLalamovePhoneNumber('123')).toBe('123')
  })

  it('accepts only normalized E.164 sender and recipient numbers', () => {
    expect(isE164PhoneNumber(normalizeLalamovePhoneNumber('+639000000000'))).toBe(true)
    expect(isE164PhoneNumber(normalizeLalamovePhoneNumber('0946 874 8743'))).toBe(true)
    expect(isE164PhoneNumber(normalizeLalamovePhoneNumber('not-a-phone'))).toBe(false)
    expect(isE164PhoneNumber(normalizeLalamovePhoneNumber('123'))).toBe(false)
  })

  it('does not call Lalamove when placeOrder receives malformed phone numbers', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await expect(placeOrder({
      quotation: {} as any,
      senderName: 'Merchant',
      senderPhone: '09 malformed',
      recipients: [{ name: 'Customer', phone: '+639468748743' }],
    })).rejects.toMatchObject({ name: 'LalamoveApiError', status: 422 } satisfies Partial<LalamoveApiError>)

    await expect(placeOrder({
      quotation: {} as any,
      senderName: 'Merchant',
      senderPhone: '+639000000000',
      recipients: [{ name: 'Customer', phone: 'local 09468748743' }],
    })).rejects.toMatchObject({ name: 'LalamoveApiError', status: 422 } satisfies Partial<LalamoveApiError>)
    expect(fetch).not.toHaveBeenCalled()
  })
})
