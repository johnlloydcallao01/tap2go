# Deploy CMS to Cloud Run

The CMS image must receive runtime configuration from Cloud Run. Do not copy
`apps/cms/.env` into the image or commit it to the repository.

This follows Google Cloud docs (Sept 2026):

- `run/docs/configuring/services/environment-variables` — plain vars via
  Console **Variables & Secrets > Add Variable**, or
  `gcloud run services update SERVICE --update-env-vars KEY=VALUE` (preferred:
  non-destructive; `--set-env-vars` **deletes** vars you omit), or
  `--env-vars-file`, or service YAML `env: [{name, value}]`. Limits: max 1000
  vars, 32 KiB each. Never set `PORT` (Cloud Run injects it) or
  `GOOGLE_APPLICATION_CREDENTIALS`. Keys cannot be empty, contain `=`, or use
  the `X_GOOGLE_` prefix. Values with commas need a custom delimiter
  (`--set-env-vars "^@^KEY1=a,b@KEY2=c"`). Every change creates a new revision.
  Dockerfile `ENV` only sets defaults; service-level vars win at runtime.
- `run/docs/configuring/services/secrets` — sensitive values (DB URIs, API
  keys, tokens) go in Secret Manager and are referenced as env vars
  (`--update-secrets ENV=SECRET:VERSION`, Console **Reference a secret**, YAML
  `valueFrom.secretKeyRef: {name, key}`). They resolve at instance startup; if
  retrieval fails the instance does not start. Pin a version number for
  reproducible prod, or use `latest` for simplicity. The runtime service
  account needs `roles/secretmanager.secretAccessor` on each secret or
  deployment fails the startup check.
- `run/docs/configuring/services/build-environment-variables` —
  `--set-build-env-vars` is for **buildpacks**, not Dockerfile builds.
  Dockerfile `docker build` does **not** see service env vars. For Dockerfile
  builds needing real secrets, use a `cloudbuild.yaml` with `availableSecrets`
  + `docker build --build-arg`. Next.js additionally inlines `NEXT_PUBLIC_*`
  at **build** time, so changing a `NEXT_PUBLIC_*` runtime var alone does not
  update the browser bundle — you must rebuild.

## Recommended: one-command sync from apps/cms/.env

`apps/cms/.env` holds 51 keys (Sept 2026 inventory). 17 are secrets, 34 are
plain config (see `cloudrun-service.yaml.example` for the full classified
list). `NODE_ENV` is forced to `production` on upload.

In Cloud Shell (repo root), or Windows PowerShell locally with `gcloud` auth:

```bash
bash scripts/cloud-run-sync-env.sh
# or: powershell -ExecutionPolicy Bypass -File scripts\cloud-run-sync-env.ps1
```

What it does (without ever printing values):

1. Parses `apps/cms/.env` (ignores comments/blanks, splits on first `=`,
   strips matching quotes, skips `PORT`, `GOOGLE_APPLICATION_CREDENTIALS`,
   `X_GOOGLE_*`).
2. For each of the 18 secrets (`DATABASE_URI`, `PAYLOAD_SECRET`,
   `PAYLOAD_API_KEY`, `PAYLOAD_JOBS_RUN_SECRET`, `UPSTASH_REDIS_REST_TOKEN`,
   `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_KEY/SECRET`,
   `GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY`, `PAYMONGO_*_LIVE/SANDBOX*`,
   `LALAMOVE_*`), creates the `tap2go-*` Secret Manager secret if missing, or
   adds a new version only when the value changed.
3. Grants the runtime SA (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`
   for project `grandline-508001`) `roles/secretmanager.secretAccessor`.
4. Calls `gcloud run services update tap2go-git --region=asia-southeast1`
   with `--update-env-vars` (34 plain) + `--update-secrets` (17 refs, `:latest`).
   Non-destructive: existing vars not in `.env` are kept.

After it prints `Done`, server-only vars are live immediately. If you changed
any `NEXT_PUBLIC_*` (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`), trigger a rebuild (`git push` / Console
redeploy) so the client bundle picks them up. `CLOUDINARY_CLOUD_NAME` is
NOT `NEXT_PUBLIC_`: it is read at runtime by the Cloudinary storage adapter
(`apps/cms/src/payload.config.ts`), so a runtime var update takes effect
without a rebuild.

## Manual alternative (Console / gcloud / YAML)

One-time APIs:

```bash
gcloud config set project grandline-508001
gcloud services enable run.googleapis.com secretmanager.googleapis.com cloudscheduler.googleapis.com
```

Secrets (example; repeat per key, values from your local `apps/cms/.env`):

```bash
printf '%s' "$DATABASE_URI" | gcloud secrets create tap2go-database-uri --data-file=-
printf '%s' "$PAYLOAD_SECRET" | gcloud secrets create tap2go-payload-secret --data-file=-
# later rotations (no overwrite of history):
printf '%s' "$DATABASE_URI" | gcloud secrets versions add tap2go-database-uri --data-file=-
```

IAM (once per secret; get `PROJECT_NUMBER` via
`gcloud projects describe grandline-508001 --format='value(projectNumber)'`):

```bash
gcloud secrets add-iam-policy-binding tap2go-database-uri \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Service update (non-destructive; repeat `--update-env-vars` /
`--update-secrets` as needed — do NOT use `--set-env-vars` unless you list
every var):

```bash
gcloud run services update tap2go-git --region=asia-southeast1 \
  --update-env-vars "NODE_ENV=production,ADMIN_PROD_URL=https://admin.tap2goph.com,WEB_PROD_URL=https://app.tap2goph.com,CMS_PROD_URL=https://cms.tap2goph.com,COOKIE_DOMAIN=.tap2goph.com" \
  --update-secrets "DATABASE_URI=tap2go-database-uri:latest,PAYLOAD_SECRET=tap2go-payload-secret:latest"
```

Declarative alternative: fill the `REPLACE_WITH_*` placeholders in
`cloudrun-service.yaml.example` (never commit real values) and
`gcloud run services replace cloudrun-service.yaml --region=asia-southeast1`.

Console path: Cloud Run > `tap2go-git` > **Edit and deploy new revision** >
**Container(s) > Variables & Secrets** > **Add Variable** (plain) or
**Reference a secret** (secret, pick version). Pasting a whole `.env` into the
**Name** field auto-splits it into rows.

## Verify and deploy

After the revision is deployed, verify the health endpoint:

```bash
gcloud run services describe tap2go-git \
  --region=asia-southeast1 \
  --format='value(status.url)'

curl "SERVICE_URL/api/health"
```

The response must be HTTP 200 and contain `"status":"ok"`. Also open
`SERVICE_URL/admin` (redirects from `/`) and confirm Supabase/Cloudinary-backed
pages load — that proves the rebuilt `NEXT_PUBLIC_*` bundle matches runtime.

If deployment still fails, inspect the exact revision error:

```bash
gcloud run services describe tap2go-git \
  --region=asia-southeast1 \
  --format='yaml(status.conditions,status.latestCreatedRevisionName,status.latestReadyRevisionName)'

gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="tap2go-git"' \
  --project=grandline-508001 \
  --limit=100 \
  --format='value(timestamp,severity,textPayload,jsonPayload.message)'
```

Common causes per the docs: runtime SA missing `secretAccessor` ("Permission
denied" naming the SA + secret), a secret version deleted, a var over 32 KiB,
or `NEXT_PUBLIC_*` changed without a rebuild (client still shows old endpoint).


## Run Payload jobs on scale-to-zero Cloud Run

The CMS service intentionally scales to zero. Do not rely on Payload's in-process
`autoRun` timer there. Use the Supabase Database Webhook below as the immediate
wake-up for new paid delivery outbox rows, and keep Cloud Scheduler calling
the protected `GET /api/payload-jobs/tick?queue=default` endpoint once per
minute for delayed retries and reconciliation. It handles due schedules and
then drains the queue in one request. The tick endpoint and Payload's built-in
`/api/payload-jobs/run` endpoint both require the `X-Payload-Jobs-Secret` header;
requests without the matching secret receive 401. The service defaults
`PAYLOAD_JOBS_AUTO_RUN` off. Set it to `true` only for a dedicated, always-on
worker, and do not configure both runners for the same deployment.

### Immediate wake-up for paid delivery orders

After PayMongo is verified and the paid transaction is persisted, CMS creates a
durable `delivery_fulfillment_outbox` row and queues the `delivery-fulfillment`
task in the same request transaction. Configure a Supabase Database Webhook to
wake the Payload runner as soon as the outbox row is inserted:

1. In Supabase **Integrations > Database Webhooks**, create a webhook for schema
   `public`, table `delivery_fulfillment_outbox`, event `INSERT`, type **HTTP
   Request**, and method `GET`.
2. Set its URL to
   `https://YOUR_CMS_HOST/api/payload-jobs/run?queue=default`.
3. Add header `X-Payload-Jobs-Secret` with the same value as
   `PAYLOAD_JOBS_RUN_SECRET` in Cloud Run. Configure it through the Dashboard;
   never put the secret in source control or a committed SQL migration.

Supabase notes that webhook headers are represented in the trigger definition
and can be visible in `pg_net`'s queued requests while pending. Restrict database
login and dashboard access accordingly, and rotate the shared secret if exposed.

The webhook is the immediate trigger for a new paid delivery. Supabase sends
Database Webhooks asynchronously through `pg_net`, which does not guarantee
delivery or retries. The outbox remains the durable source of work; keep the
periodic runner below for delayed retries, stale-payment reconciliation, and
recovery if a webhook request is missed. Do not manually insert a live outbox
row to test this: the worker can create a real Lalamove booking.

Once Lalamove confirms a booking, CMS persists a customer notification and
broadcasts it through the existing `notifications:user:{userId}` Realtime
channel. For order status, CMS sends a separate `order_updated` broadcast to a
per-customer channel whose name is HMAC-derived from the server-only
`SUPABASE_SERVICE_ROLE_KEY`. The mobile app obtains that channel name from an
authenticated CMS endpoint, then refreshes the order from the CMS API when an
event arrives. Only the order ID is broadcast; payment and order data continue
to come from the authenticated CMS API. This uses the existing Supabase URL,
anon key, and service-role key; it does not require adding Payload tables to the
Supabase Realtime publication. REST refresh and active-order polling remain as
fallbacks because Realtime broadcasts are ephemeral. Realtime is a UI signal,
not the payment authority or fulfillment trigger.

1. Generate a unique high-entropy secret locally and put it in
   `apps/cms/.env` as `PAYLOAD_JOBS_RUN_SECRET` (never use the example
   placeholder). The environment sync scripts store it as Secret Manager secret
   `tap2go-payload-jobs-run-secret` and grant the Cloud Run runtime service
   account `roles/secretmanager.secretAccessor`. The example YAML maps the latest
   version to `PAYLOAD_JOBS_RUN_SECRET` and explicitly disables `autoRun`.
   Before deploying the new worker revision, apply migration
   `20261117_045000_add_paymongo_reconcile_delivery_payments` through the CMS
   migration workflow. Both Cloud Run env-sync scripts force
   `PAYLOAD_JOBS_AUTO_RUN=false` to prevent local dedicated-worker settings from
   enabling a duplicate runner.
2. In Cloud Scheduler (same region as the CMS), create an HTTP job with schedule
   `* * * * *`, timezone `Asia/Manila`, method `GET`, and URL
   `https://YOUR_CMS_HOST/api/payload-jobs/tick?queue=default`. The commands below
   read the header value directly from Secret Manager into a PowerShell variable;
   they do not print it. Use a high-entropy hex secret (no commas, because
   `--headers` accepts comma-separated key/value pairs). Cloud Scheduler does not
   resolve custom-header values from Secret Manager automatically, so restrict
   who can view or update the Scheduler job.

   From the repository root in PowerShell, set the project, host, and job name:

   ```powershell
   $project = "YOUR_PROJECT_ID"
   $region = "asia-southeast1"
   $job = "tap2go-payload-jobs"
   $cmsUrl = "https://YOUR_CMS_HOST"
   $secretValue = (gcloud secrets versions access latest --secret="tap2go-payload-jobs-run-secret" --project=$project | Out-String).TrimEnd([char[]]"`r`n")
   if ([string]::IsNullOrWhiteSpace($secretValue)) { throw "Payload jobs secret is empty." }
   ```

   Create the job (bounded 300-second deadline and one retry):

   ```powershell
   gcloud scheduler jobs create http $job `
     --project=$project --location=$region `
     --schedule="* * * * *" --time-zone="Asia/Manila" `
     --uri="$cmsUrl/api/payload-jobs/tick?queue=default" `
     --http-method=GET --attempt-deadline=300s --max-retry-attempts=1 `
     "--headers=X-Payload-Jobs-Secret=$secretValue" `
     --format="value(name)" --quiet
   if ($LASTEXITCODE -ne 0) { throw "Cloud Scheduler job creation failed." }
   ```

   To rotate the header or update an existing job, use `--update-headers`:

   ```powershell
   gcloud scheduler jobs update http $job `
     --project=$project --location=$region `
     --schedule="* * * * *" --time-zone="Asia/Manila" `
     --uri="$cmsUrl/api/payload-jobs/tick?queue=default" `
     --http-method=GET --attempt-deadline=300s --max-retry-attempts=1 `
     "--update-headers=X-Payload-Jobs-Secret=$secretValue" `
     --format="value(name)" --quiet
   if ($LASTEXITCODE -ne 0) { throw "Cloud Scheduler job update failed." }
   ```

   Trigger an immediate run after creation/update, then verify the execution's
   HTTP response is 2xx in Cloud Scheduler execution history:

   ```powershell
   gcloud scheduler jobs run $job --project=$project --location=$region --format="value(name)" --quiet
   ```

   The command output contains only the job name. Do not echo `$secretValue`,
   include the header value literally in shell history, or log the Scheduler
   job's header configuration.

   See the official [`create http`](https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http)
   and [`update http`](https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/update/http)
   references for the `--headers` and `--update-headers` flags.
3. The worker checks at most two stale pending delivery transactions with stored
   PayMongo intent IDs per run, validates the exact
   intent/status/amount/currency, and never creates or attaches payment intents.
   Checks back off from five minutes to a six-hour cap; an admin alert is sent
   after five unresolved checks, and capped checks continue until paid or
   terminal. A succeeded intent with an amount/currency/link mismatch is never
   enqueued; it stops automatic checks and immediately alerts an admin for
   manual review. Monitor Scheduler execution failures, oldest pending/retryable
   outbox age, and records requiring manual intervention. Scheduler success means
   the runner endpoint responded; it does not guarantee that Lalamove accepted a
   booking. The worker's persisted outbox/attempt state remains authoritative.

The jobs tick endpoint handles due schedules and then processes the requested
queue in the same request. The immediate Supabase Database Webhook continues to
call Payload's built-in run endpoint for newly queued work.
