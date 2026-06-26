'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

export default function MobileCheckoutReturnBridgePage() {
  const params = useParams<{ merchantId: string }>()
  const searchParams = useSearchParams()
  const merchantId = params?.merchantId || ''

  const deepLink = useMemo(() => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (merchantId && !nextParams.has('merchantId')) {
      nextParams.set('merchantId', merchantId)
    }

    const query = nextParams.toString()
    return `tap2go-customer://checkout/return${query ? `?${query}` : ''}`
  }, [merchantId, searchParams])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.replace(deepLink)
    }, 150)

    return () => window.clearTimeout(timeout)
  }, [deepLink])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '24px',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '20px',
          background: '#ffffff',
          padding: '28px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
          Returning to Tap2Go
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#6b7280', marginBottom: '20px' }}>
          Your payment result is being handed back to the mobile app so we can confirm the order properly.
        </p>
        <Link
          href={deepLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '48px',
            padding: '0 20px',
            borderRadius: '999px',
            background: '#f59e0b',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Open Tap2Go
        </Link>
      </section>
    </main>
  )
}
