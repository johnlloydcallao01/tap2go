// Force dynamic rendering to avoid SSR issues
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <html>
      <body>
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
              color: '#f3a823',
              marginBottom: '1rem'
            }}>404</div>
            
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Page Not Found
            </h1>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                backgroundColor: '#f3a823',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
