# Central menu publishing API

This Worker is the central publishing layer for Spice Street.

## Result

One GitHub token is stored centrally instead of in each browser:

```
Laptop / phone / any device
          |
          v
Cloudflare Worker
          |
          v
GitHub qr-food-menu
```

The browser never receives the GitHub PAT.

## Deploy

From `backend/worker`:

```bash
npx wrangler login
npx wrangler deploy
```

The configuration uses automatic KV provisioning. Cloudflare will create/bind the KV namespace when deploying with a current Wrangler version.

Set these two secrets on the Worker:

```bash
npx wrangler secret put ADMIN_CREDENTIAL_SHA256
npx wrangler secret put MASTER_CREDENTIAL_SHA256
```

Use the current project hashes:

- ADMIN: `8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334`
- MASTER: `3fd8ea76d8a4a2072a717edb267d982a8bc42a1cdc74d3a90514c1a4577d6cd0`

Do not commit the GitHub token. Master Admin will send the token to the Worker and the Worker stores it in KV.

After deployment, the frontend must be pointed at the Worker URL with:

```js
centralApiBase: "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev"
```

No DNS change to `nexgenlink.co.in` is required for the initial `workers.dev` setup.

## Security

- GitHub PAT stays server-side.
- Admin and Master Admin sessions are short-lived Worker sessions in KV.
- Replacing the GitHub token centrally affects all devices.
- Fine-grained GitHub PAT should be limited to `Megesh123/qr-food-menu` with Contents read/write.
