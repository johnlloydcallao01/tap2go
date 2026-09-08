# Deploy CMS to Cloud Run

The CMS image must receive runtime configuration from Cloud Run. Do not copy
`apps/cms/.env` into the image or commit it to the repository.

## One-time Google Cloud setup

Run these commands in Google Cloud Shell or a machine with the Google Cloud
CLI installed. Replace the values locally; never commit the command history or
the secret values.

```bash
gcloud config set project grandline-508001
gcloud services enable run.googleapis.com secretmanager.googleapis.com

printf '%s' "$DATABASE_URI" | gcloud secrets create tap2go-database-uri --data-file=-
printf '%s' "$PAYLOAD_SECRET" | gcloud secrets create tap2go-payload-secret --data-file=-
```

Grant the Cloud Run runtime service account access to both secrets. The
default account is shown by this command:

```bash
gcloud projects describe grandline-508001 --format='value(projectNumber)'
```

For project number `PROJECT_NUMBER`, grant:

```bash
gcloud secrets add-iam-policy-binding tap2go-database-uri \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding tap2go-payload-secret \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Configure the service

The service must have the two secret-backed variables and the non-secret
production values below. In Cloud Run, open `tap2go-git`, choose **Edit and
deploy new revision**, then add the variables under **Variables & Secrets**:

```text
DATABASE_URI       Secret: tap2go-database-uri       Version: 1
PAYLOAD_SECRET     Secret: tap2go-payload-secret     Version: 1
NODE_ENV           production
ADMIN_PROD_URL     https://admin.tap2goph.com
WEB_PROD_URL       https://app.tap2goph.com
CMS_PROD_URL       https://cms.tap2goph.com
COOKIE_DOMAIN      .tap2goph.com
```

Add the remaining application credentials from `apps/cms/.env` as Cloud Run
runtime variables or Secret Manager secrets. Do not set `PORT`; Cloud Run
injects it and the container listens on that value.

## Verify and deploy

After the revision is deployed, verify the health endpoint:

```bash
gcloud run services describe tap2go-git \
  --region=asia-southeast1 \
  --format='value(status.url)'

curl "SERVICE_URL/api/health"
```

The response must be HTTP 200 and contain `"status":"ok"`. If deployment
still fails, inspect the exact revision error:

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