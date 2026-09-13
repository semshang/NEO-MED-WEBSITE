# Neomeditech website

Next.js 16 website and quotation-request portal for Neomeditech Biomedical Solutions Pvt. Ltd.

## Local setup

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and fill every value.
3. Run `npm run dev`.

Use `npm run lint`, `npm run typecheck`, and `npm run build` before a release.

## Environment configuration

Set these values in your hosting provider (Vercel) and local `.env.local`. Do not commit `.env.local` or any credentials.

| Variable | Scope | Status | Purpose & Production Format |
| --- | --- | --- | --- |
| `MONGODB_URI` | Server-only | Required | MongoDB Atlas connection string (`mongodb+srv://...`). |
| `NEXTAUTH_SECRET` | Server-only | Required | High-entropy secret for signing session JWT tokens (`openssl rand -base64 32`). |
| `NEXTAUTH_URL` | Server-only | Required | Application origin. Example: `https://neomeditech.com.np`. In preview environments, configure the specific preview URL. |
| `NEXT_PUBLIC_SITE_URL` | Client & Server | Optional | Public origin for canonical metadata, sitemap, and robots. Defaults to `https://neomeditech.com.np`. |
| `GOOGLE_CLIENT_ID` | Server-only | Required | Google Cloud OAuth 2.0 Client ID. |
| `GOOGLE_CLIENT_SECRET` | Server-only | Required | Google Cloud OAuth 2.0 Client Secret. |
| `ADMIN_EMAILS` | Server-only | Required | Comma-separated admin emails (e.g. `neomeditech.solutions@gmail.com`). Admins must sign in via Google. |
| `RESEND_API_KEY` | Server-only | Required for email | Resend API key (`re_...`) for contact forwarding, verification, and password resets. |
| `RESEND_FROM_EMAIL` | Server-only | Required for email | Verified sender address (e.g. `support@neomeditech.com.np`). NOTE: Contact submissions are delivered to the business destination inbox (`contact.neomeditech@gmail.com`). |
| `BLOB_READ_WRITE_TOKEN` | Server-only | Required | Secret token for Vercel Blob store product image uploads. Provisioned via Vercel Dashboard. |

### Environment separation (Preview vs Production)

Configure Preview and Production environments separately where practical:

* **Preview environment**:
  * Prefer a dedicated preview/test MongoDB database;
  * Prefer a dedicated preview Blob store or clearly separated test prefix;
  * Configure preview-specific OAuth URL and callback in Google Cloud Console (or test on a stable custom preview domain);
  * Ensure safe email testing that does not contact real customers;
  * Use test products/messages that cannot contaminate production data.
* **Production environment**:
  * Production MongoDB Atlas cluster with least-privilege credentials and monitoring;
  * Production Vercel Blob store;
  * Verified Resend sender domain;
  * Confirmed destination inbox (`contact.neomeditech@gmail.com`);
  * Production `ADMIN_EMAILS`;
  * Production application URL (`https://neomeditech.com.np`);
  * Exact real-domain Google OAuth callback (`https://neomeditech.com.np/api/auth/callback/google`).

### Google OAuth setup

In Google Cloud Console, configure the authorized JavaScript origin as the exact `NEXTAUTH_URL` and configure this redirect URI:

```
${NEXTAUTH_URL}/api/auth/callback/google
```

* **Production**: Origin `https://neomeditech.com.np` with redirect URI `https://neomeditech.com.np/api/auth/callback/google`.
* **Preview**: Vercel dynamic preview URLs require registering the specific preview host or a stable custom preview domain in Google Cloud Console, as Google OAuth does not permit wildcard subdomains.

## Security behavior

- New password accounts cannot sign in until the address is verified through the emailed link. A password reset also proves address ownership. Legacy password accounts without a verification timestamp must reset their password once.
- A verified Google login reclaims an unverified password account with the same address and invalidates the unverified password, preventing account pre-hijacking.
- Sensitive writes require same-origin requests, strict field allowlists, bounded JSON bodies, and MongoDB-backed rate limits. The production MongoDB role must be permitted to create the `ratelimits` collection indexes, or those operations will fail closed.
- Administrator permissions are calculated on the server from `ADMIN_EMAILS`; client-provided roles and IDs are ignored.
- Authentication and private API responses are not intended for public caching. Keep any CDN configured to respect the application’s `private, no-store` headers.

## Data and content operations

The catalogue, account profiles, quote requests, contact messages, customer notes, and store settings are stored in MongoDB. The first catalogue request creates the bundled records from `src/data/products.ts` only when the product collection is empty. Seed records deliberately have no image, stock value, price, or unverified specification.

Before launch, an administrator must complete each live catalogue entry with verified copy, availability, pricing where appropriate, and an image placed under `public/` (then reference it with a path such as `/products/device.jpg`). The customer experience deliberately displays “Quote required” until a verified price is entered.

## ✅ Pre-Cutover Completed: WordPress Media Migrated to Vercel Blob

All product media dependencies previously hosted on WordPress (`https://neomeditech.com.np/wp-content/uploads/...`) have been migrated to permanent Vercel Public Blob storage. Both MongoDB and `src/data/products.ts` are fully synchronized.

### Current Inventory:
- **61 catalogue products** in MongoDB and `src/data/products.ts` now reference Vercel Public Blob URLs (`https://*.public.blob.vercel-storage.com/...`).
- **1 local static asset** (`/shop/ultrasound-probes.png`).
- **1 external placeholder** (`https://placehold.co/...`).
- **0 legacy WordPress dependencies remaining**. DNS cutover to Vercel can now proceed safely without any 404 image errors.
- **0 test products** remain in MongoDB (clean 63-product catalogue).

### Migration Tool: `scripts/migrate-wordpress-product-images-to-blob.mjs`

The migration tool enforces strict SSRF protections (HTTPS only, exact domain `neomeditech.com.np`, path traversal prevention), validates image content magic bytes (JPEG, PNG, WebP, AVIF), deduplicates identical assets, and logs all operations in `.local-migrations/`.

#### 1. Dry Run (Safe, Read-Only Default)
```bash
node scripts/migrate-wordpress-product-images-to-blob.mjs --dry-run
```
- Performs a read-only audit of MongoDB product images.
- Checks remote HTTP availability of all 61 WordPress media files.
- Generates `.local-migrations/dry-run-<timestamp>.json`.
- Makes zero modifications to MongoDB and performs zero Blob uploads.

#### 2. Live Apply (Requires Explicit Confirmation)
When ready to execute the live migration, ensure `BLOB_READ_WRITE_TOKEN` and `MONGODB_URI` are configured in `.env.local` or your environment, then run:
```bash
node scripts/migrate-wordpress-product-images-to-blob.mjs --apply --confirm=NEOMEDITECH_IMAGE_MIGRATION
```
- Downloads and validates each WordPress image.
- Uploads to Vercel Blob under `products/migrated/<productId>-<hash>.<ext>`.
- Updates MongoDB product documents with the new Vercel Blob URLs.
- Saves an audit log and rollback map in `.local-migrations/migration-<timestamp>.json`.

#### 3. Rollback (If Needed)
If you need to restore previous image URLs in MongoDB:
```bash
node scripts/migrate-wordpress-product-images-to-blob.mjs --rollback=.local-migrations/migration-<timestamp>.json --confirm=NEOMEDITECH_IMAGE_ROLLBACK
```

#### 4. Post-Migration Seed Synchronization
After completing the live migration, copy the new Vercel Blob URLs from the migration report into `src/data/products.ts` so that future database seed operations use the permanent Blob storage URLs.

## Deployment checklist

- Configure every required variable above, including at least one `ADMIN_EMAILS` address.
- Use a production MongoDB database with backups and restricted network access.
- Verify the OAuth origin and callback URI for the live domain.
- Verify the Resend sending domain; test both registration verification and password reset.
- Confirm the MongoDB rate-limit TTL and unique indexes exist after the first protected request.
- Ensure the hosting proxy overwrites client-supplied forwarding headers before they reach the application.
- **Migrate WordPress media to Vercel Blob before switching DNS records.**
- Complete catalogue content and images in the administrator area.
- Confirm the Privacy Policy and Terms of Service with legal counsel for the business’s actual practices.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` in the production environment.
