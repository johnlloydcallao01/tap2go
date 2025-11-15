# Forgot Password — Production-Grade Flow

## Overview
This flow enables users to securely reset their password via an email link, using the CMS (backend) as the single source of truth and Resend for email delivery. All actions are performed against production endpoints and the production database.

## User Experience
- User clicks “Forgot your password?” on the Sign In page (`apps/web`).
- User enters their email and submits.
- User receives an email with a secure one-time link to set a new password.
- User opens the link, enters a new password twice, submits.
- User is signed in (optional) or asked to sign in with the new password.

## Frontend Pages (apps/web)
- `GET /forgot-password` — form to request reset.
- `GET /reset-password?token=<opaque>` — form to set a new password.
- All API calls target production CMS: `https://cms.tap2goph.com/api`.

## Backend Endpoints (apps/cms)
- `POST /api/forgot-password` (public):
  - Input: `{ email }`.
  - Behavior: If user exists and is active, generate a reset token, store it (hashed) with expiration, send email via Resend.
  - Response: Always return a generic success message (do not leak existence of the account).

- `POST /api/reset-password` (public):
  - Input: `{ token, newPassword }`.
  - Behavior: Validate token and expiration, rotate token, update password hash, revoke sessions, log event.
  - Response: Success message. Optionally issue a fresh session.

## Token Generation & Storage (security)
- Generate a random 32–64 byte token (cryptographically secure).
- Store only a hashed token (`sha256`) with `resetPasswordToken` and `resetPasswordExpiration` in `users` table.
- Set expiration (e.g., 30 minutes). Short TTL reduces risk.
- Mark token as single-use: invalidate immediately after successful reset.
- Include IP and User-Agent metadata for audit.

## Email Delivery (Resend)
- Use CMS env variables (server-only):
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` (e.g., `support@tap2goph.com`)
  - `EMAIL_FROM_NAME` (e.g., `Tap2Go`)
  - `EMAIL_REPLY_TO`
- Email content:
  - Subject: `Reset your Tap2Go password`
  - Body: Explain request, include a CTA link, show expiry, advise if not requested.
  - Link: `https://app.tap2goph.com/reset-password?token=<opaque>`
- Deliverability:
  - Domain must be verified in Resend.
  - SPF/DKIM/DMARC configured for sending domain.

## Abuse Prevention
- Rate limit `POST /api/forgot-password` per IP and per email (e.g., 3 requests/hour).
- Always return 200 with neutral messaging (avoid account enumeration).
- Soft throttling on repeated requests; log suspicious activity.

## Password Policy
- Enforce minimum length and complexity (server-side).
- Reject known breached passwords (optional, e.g., HaveIBeenPwned API).
- Prevent reuse of recent passwords (optional).

## Session & Token Rotation
- On successful reset:
  - Invalidate `resetPasswordToken` and `resetPasswordExpiration`.
  - Revoke existing sessions and refresh tokens.
  - Optionally sign the user in, or require fresh login.

## Auditing & Notifications
- Log events: `FORGOT_PASSWORD_REQUESTED`, `PASSWORD_RESET_SUCCESS`, `PASSWORD_RESET_FAILED`.
- Send confirmation email after password change (“Your password was changed”).
- Store request metadata (IP, UA, timestamp) for security review.

## Error Handling
- Expired/invalid token → show friendly error, offer to request a new reset.
- Email delivery failure → log and retry (limited attempts), return generic success.
- Account inactive/locked → return generic success; do not expose state.

## Edge Cases
- Multiple outstanding tokens: allow only the latest; invalidate prior tokens on new request.
- User changes email mid-flow: validate against current account email.
- Internationalization: localize email and UI messages.

## Implementation Checklist
1. CMS: Add `POST /api/forgot-password` and `POST /api/reset-password`.
2. CMS: Implement token generation, hashing, storage, TTL, auditing.
3. CMS: Integrate Resend using server envs; compose production reset link.
4. Web: Build `Forgot Password` and `Reset Password` pages; call CMS endpoints.
5. Security: Rate limiting, neutral responses, session revocation, password policy.
6. Ops: Verify sending domain in Resend (SPF/DKIM/DMARC), monitor logs.
