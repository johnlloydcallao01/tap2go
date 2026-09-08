const required = ['DATABASE_URI', 'PAYLOAD_SECRET']
const missing = required.filter((name) => !process.env[name]?.trim())

if (missing.length > 0) {
  console.error(`Missing required runtime environment variables: ${missing.join(', ')}`)
  console.error('Configure them on the Cloud Run service or through Secret Manager.')
  process.exit(1)
}