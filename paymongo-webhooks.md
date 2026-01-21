# PayMongo Webhooks Status & Implementation Plan

## 1. Current Status
**Status:** ✅ **Implemented**

We have implemented the PayMongo webhook handler in our system to listen for payment events.
- **Endpoint:** `apps/cms/src/endpoints/paymongoWebhook.ts`
- **URL Path:** `/api/paymongo/webhook` (e.g., `https://cms.tap2goph.com/api/paymongo/webhook`)
- **Events Handled:**
    - `payment.paid`: Updates Transaction status to `paid` and Order status to `accepted`.
    - `payment.failed`: Updates Transaction status to `failed`.

---

## 2. Implementation Details

### **Location**
The webhook logic is centralized in the backend CMS service:
- **File:** `apps/cms/src/endpoints/paymongoWebhook.ts`
- **Configuration:** Registered in `apps/cms/src/payload.config.ts`

### **Architecture**
1.  **Endpoint URL:** `/api/paymongo/webhook`
2.  **Method:** `POST`
3.  **Security:** Verifies `Paymongo-Signature` header using HMAC-SHA256 with `PAYMONGO_WEBHOOK_SECRET`.

### **Workflow**
1.  PayMongo sends a `payment.paid` event.
2.  System verifies the signature.
3.  System extracts `payment_intent_id`.
4.  System searches for the corresponding **Transaction** record.
5.  **If found:**
    - Updates Transaction `status` to `paid`.
    - Updates Transaction `paid_at` timestamp.
    - Updates linked **Order** `status` to `accepted`.

---

## 3. Deployment & Setup Instructions

### **Step 1: Configure Environment Variables**
You must add the Webhook Secret to your production environment variables.

1.  **Generate Secret:** Create the webhook in PayMongo Dashboard (see below).
2.  **Add to `.env`:**
    ```bash
    PAYMONGO_WEBHOOK_SECRET=whsk_your_secret_key_here
    ```

### **Step 2: Register Webhook in PayMongo Dashboard**
1.  Go to **PayMongo Dashboard > Developers > Webhooks**.
2.  Click **"Create Webhook"**.
3.  **Live URL:** `https://cms.tap2goph.com/api/paymongo/webhook` (Replace domain with your actual production CMS domain)
4.  **Events:** Select `payment.paid` and `payment.failed`.
5.  **Save** and copy the **Webhook Secret**.

### **Step 3: Restart Server**
After deploying the code and updating the `.env` file, restart the CMS server to apply changes.
