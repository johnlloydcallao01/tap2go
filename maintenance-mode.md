# Professional Maintenance Mode Implementation Plan

## Objective
Implement a robust, production-grade "Maintenance Mode" for the Tap2Go web application that:
1.  **Does not rely on the database** (works even if DB is down).
2.  **Can be toggled from the Admin Panel** (for ease of use).
3.  **Updates instantly** (no redeployments required).
4.  **Is testable locally** (mimics production behavior).

## Architecture: The "Edge Config" Approach
We will use **Vercel Edge Config** as the source of truth for the maintenance state. This allows the application middleware to check the status in milliseconds at the edge, redirecting users before they hit the database or main application logic.

-   **Production:** Middleware reads `isInMaintenanceMode` from Vercel Edge Config.
-   **Local Development:** Middleware reads `LOCAL_MAINTENANCE_MODE` from `.env.local` to mock Edge Config.
-   **Admin Interface:** PayloadCMS Global / Custom View triggers a Vercel API call to update Edge Config.

## Implementation Steps

### Phase 1: Infrastructure & Environment
1.  **Vercel Setup:**
    -   Create an Edge Config store in the Vercel Dashboard.
    -   Add the `EDGE_CONFIG` connection string to the project environment variables.
    -   Create a Vercel API Token for the Admin Panel to use for updates.
2.  **Dependencies:**
    -   Install `@vercel/edge-config` in `apps/web`.

### Phase 2: The Gatekeeper (Middleware)
Modify `apps/web/middleware.ts` (or create if missing) to handle the check.

```typescript
// Conceptual Logic
import { get } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 1. Skip for Admin Panel & Assets
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/_next')) return;

  // 2. Determine Mode (Prod vs Local)
  let isMaintenance = false;
  if (process.env.NODE_ENV === 'development') {
    isMaintenance = process.env.LOCAL_MAINTENANCE_MODE === 'true';
  } else {
    try {
      isMaintenance = await get('isInMaintenanceMode');
    } catch (error) {
      // Fail open (allow traffic) or fail closed based on policy
      console.error('Edge Config Error:', error);
    }
  }

  // 3. Rewrite if Active
  if (isMaintenance) {
    req.nextUrl.pathname = '/maintenance';
    return NextResponse.rewrite(req.nextUrl);
  }
}
```

### Phase 3: The Maintenance Page
Create a dedicated, lightweight page at `apps/web/app/maintenance/page.tsx`.
-   **Design:** Simple, reassuring message. "We are upgrading our systems."
-   **Tech:** Static HTML/CSS preferred. Minimal dependencies. No database calls.

### Phase 4: The Control Center (PayloadCMS)
Add a mechanism in the Admin Panel to toggle this state.
1.  **Global Config:** Create a `SystemSettings` Global in Payload.
2.  **Field:** Add a boolean `maintenanceMode`.
3.  **AfterChange Hook:**
    -   When the admin saves `maintenanceMode = true`:
    -   Payload backend sends a `PATCH` request to `https://api.vercel.com/v1/edge-config/{id}/items`.
    -   Updates the `isInMaintenanceMode` key.

### Phase 5: Local Testing Strategy
To test locally without touching Vercel:
1.  Set `LOCAL_MAINTENANCE_MODE=true` in `.env.local`.
2.  Refresh localhost.
3.  Verify redirection to `/maintenance`.

## Summary of Benefits
-   **Safety:** If Supabase/Postgres crashes, the maintenance page still works.
-   **Speed:** Edge checks take <10ms; DB checks can take 100ms+.
-   **UX:** Admins get a UI button; Developers get a robust system.
