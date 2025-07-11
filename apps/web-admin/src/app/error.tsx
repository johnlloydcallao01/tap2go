'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error boundary caught:', error);
  }
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 'bold',
          color: '#ef4444',
          marginBottom: '1rem'
        }}>!</div>
        
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Something went wrong!
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          We encountered an unexpected error. Please try again.
        </p>

        <button
          onClick={reset}
          style={{
            backgroundColor: '#f3a823',
            color: 'white',
            fontWeight: '600',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            fontWeight: '600',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
