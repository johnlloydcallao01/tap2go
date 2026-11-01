# Cloudflare Tunnel for the CMS API

The mobile app's development API URL is `https://api-dev.tap2goph.com/api`.
The CMS is the API origin and runs on `127.0.0.1:3001` on the deployment host.
Cloudflare Tunnel must forward that hostname to the CMS; the CMS process does
not create or keep a tunnel alive.

## Diagnose before changing anything

Run these commands on the CMS host:

```sh
curl -fsS http://127.0.0.1:3001/api/health
sudo systemctl status tap2go-cms --no-pager
sudo systemctl status cloudflared --no-pager
sudo journalctl -u cloudflared -n 100 --no-pager
```

The health endpoint should return HTTP 200 with `status: "ok"`. If it does
not, restore the CMS service first. If it does but the public hostname returns
Cloudflare Error 1033, the CMS is reachable locally and the problem is the
tunnel connector or its hostname/DNS association, not a CMS API route.

## Configure or reconnect the tunnel

1. In Cloudflare Zero Trust, open **Networks > Tunnels** and select the tunnel
   intended for this CMS host. Confirm that its connector is **Healthy**. Do
   not create a second tunnel or change a DNS route until you have confirmed
   which existing tunnel owns `api-dev.tap2goph.com`.
2. In that tunnel's **Public Hostnames** configuration, set:
   - Hostname: `api-dev.tap2goph.com`
   - Service type: `HTTP`
   - URL: `127.0.0.1:3001`
3. If there is no connector installed on the CMS host, install `cloudflared`
   using Cloudflare's official instructions for the host OS. In the tunnel
   details, use **Add a connector** to obtain the tunnel token, then install
   the service without saving the token in this repository:

   ```sh
   sudo cloudflared service install '<TUNNEL_TOKEN>'
   sudo systemctl enable --now cloudflared
   sudo systemctl status cloudflared --no-pager
   ```

   If `cloudflared` is already installed, inspect its service and logs before
   reinstalling it. Reinstalling can replace the existing service's
   credentials.
4. Confirm the hostname is routed to the selected tunnel in Cloudflare DNS.
   When using a dashboard-managed tunnel, manage the route from the tunnel's
   Public Hostnames page rather than creating a competing DNS record.

After the connector is healthy, check the public path from a client outside
the host:

```sh
curl -i https://api-dev.tap2goph.com/api/health
```

It should return HTTP 200 and the CMS health JSON. The mobile app already reads
`EXPO_PUBLIC_API_URL` and is configured to use this API URL; changing the app
URL cannot repair an unavailable tunnel. Tunnel tokens and credentials must
remain in Cloudflare/systemd configuration and must never be committed.