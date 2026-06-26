# Debug Session: cloudflare-tunnel-404

- Status: OPEN
- Started: 2026-06-26
- Symptom: `https://api-dev.tap2goph.com` returns `404: NOT_FOUND` / `DEPLOYMENT_NOT_FOUND`
- Expected: `api-dev.tap2goph.com` should proxy to local `http://localhost:3001`

## Hypotheses

1. The DNS record for `api-dev.tap2goph.com` is still pointing to Vercel or another existing deployment instead of the Cloudflare Tunnel.
2. The named tunnel was not actually created or was deleted after credential write failures, so the hostname route does not exist in Cloudflare.
3. The local `config.yml` references the wrong tunnel ID or wrong credentials file, so `cloudflared tunnel run` starts incorrectly or does nothing useful.
4. The tunnel is not currently running against the named tunnel at all; only the temporary quick tunnel or no active tunnel is serving traffic.
5. Local backend reachability is fine on `localhost:3001`, but the public hostname is mapped to the wrong upstream before the request ever reaches the local machine.

## Evidence Log

- `C:\Users\User\cloudflared-tap2go\config.yml` points `api-dev.tap2goph.com` to `http://localhost:3001` using tunnel `60fc267d-20d8-4b0f-8ff9-fa251b48f853`.
- `C:\Users\User\cloudflared-tap2go\cms-local.json` contains tunnel ID `60fc267d-20d8-4b0f-8ff9-fa251b48f853`.
- `cloudflared tunnel list` shows named tunnel `cms-local` exists and has active connections in multiple regions.
- `Resolve-DnsName api-dev.tap2goph.com` returns Cloudflare IPs (`172.67.161.240`, `104.21.10.12`), not Vercel-only resolution.
- `Invoke-WebRequest https://api-dev.tap2goph.com` returns HTTP `200`.
- Public response resolves to `https://api-dev.tap2goph.com/admin/login` and serves HTML with `X-Powered-By: Next.js, Payload`.
- `Invoke-WebRequest http://localhost:3001` returns HTTP `200`.

## Hypothesis Status

1. The DNS record for `api-dev.tap2goph.com` is still pointing to Vercel or another existing deployment instead of the Cloudflare Tunnel. -> Rejected by current DNS and response headers.
2. The named tunnel was not actually created or was deleted after credential write failures, so the hostname route does not exist in Cloudflare. -> Rejected by `cloudflared tunnel list`.
3. The local `config.yml` references the wrong tunnel ID or wrong credentials file, so `cloudflared tunnel run` starts incorrectly or does nothing useful. -> Rejected by matching tunnel IDs in config and credentials file.
4. The tunnel is not currently running against the named tunnel at all; only the temporary quick tunnel or no active tunnel is serving traffic. -> Rejected by active named tunnel connections.
5. Local backend reachability is fine on `localhost:3001`, but the public hostname is mapped to the wrong upstream before the request ever reaches the local machine. -> Rejected by public `200` response serving Payload admin login.

## Next Actions

1. Ask user to hard refresh and retest from browser/phone.
2. If user still sees old 404, collect whether the failing client is using cached DNS/browser page or a different network path.
