# Deployment Guide — Job Application Tracker

Follow these steps in order. Each step builds on the previous one.

---

## Step 1 — Initialize Git

Open a terminal in the **root** `job-tracker/` folder (not inside backend or frontend):

```bash
cd "job-tracker"
git init
git add .
git commit -m "feat: complete job application tracker with chrome extension"
```

---

## Step 2 — Create GitHub Repository

1. Go to [github.com](https://github.com) → click **New** (top-left)
2. **Repository name:** `job-application-tracker`
3. Set visibility to **Public**
4. **Do NOT** check "Add a README file" or "Add .gitignore" — we already have them
5. Click **Create repository**
6. Copy the repository URL (looks like `https://github.com/YOUR_USERNAME/job-application-tracker.git`)

---

## Step 3 — Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/job-application-tracker.git
git branch -M main
git push -u origin main
```

Verify: open `https://github.com/YOUR_USERNAME/job-application-tracker` — all files should be visible.

---

## Step 4 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → click **Sign up with GitHub**
2. Click **New +** → **Web Service**
3. Click **Connect** next to your `job-application-tracker` repo

Configure the service:

| Setting | Value |
|---------|-------|
| Name | `job-tracker-api` |
| Region | Singapore (or closest to your users) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

4. Click **Advanced** → **Add Environment Variable** and add each one:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A 64-character random string |
| `JWT_EXPIRES_IN` | `7d` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | _(leave blank for now — fill after Vercel step)_ |

5. Click **Create Web Service**
6. Wait 3–5 minutes for the build to complete
7. Copy the service URL, e.g. `https://hireatlas-api.onrender.com`

**Test it:**
```
GET https://hireatlas-api.onrender.com/api/health
```
Should return `{ "status": "ok", ... }`

---

## Step 5 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → click **Sign up with GitHub**
2. Click **Add New** → **Project**
3. Find and **Import** your `job-application-tracker` repo

Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://hireatlas-api.onrender.com/api` |

5. Click **Deploy**
6. Wait 1–2 minutes
7. Copy your live URL, e.g. `https://hire-atlas.vercel.app`

---

## Step 6 — Update Render with the Vercel URL

Now that you have the frontend URL, tell the backend which origins are allowed:

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Open **job-tracker-api** → **Environment**
3. Add or update these two variables:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://hire-atlas.vercel.app` |
| `CLIENT_URL_WWW` | `https://www.hire-atlas.vercel.app` |

4. Render auto-redeploys (~2 minutes). Wait for the green **Live** status.

---

## Step 7 — Update Extension for Production

Now that the backend URL is live, update the extension files:

**`extension/utils/storage.js`** — replace the default URL:
```js
// Change this line:
resolve(r.jt_api_url || 'https://your-backend.onrender.com')
// To:
resolve(r.jt_api_url || 'https://hireatlas-api.onrender.com')
```

**`extension/manifest.json`** — update `host_permissions`:
```json
"https://your-backend.onrender.com/*"
// Change to:
"https://hireatlas-api.onrender.com/*"
```

Then reload the extension:
1. Open `chrome://extensions`
2. Find **Job Application Tracker**
3. Click the **refresh icon** (circular arrow)

---

## Step 8 — Update README with Live URLs

Edit `README.md` — replace the placeholder URLs in the Live Demo table:

```md
| Frontend | https://hire-atlas.vercel.app |
| Backend API | https://hireatlas-api.onrender.com |
```

Then commit and push:
```bash
git add README.md extension/utils/storage.js extension/manifest.json
git commit -m "chore: update production URLs"
git push
```

Vercel picks up the commit automatically and redeploys.

---

## Step 9 — Full Production Test

Run through [TESTING.md](TESTING.md) to verify every feature works end-to-end on the live URLs.

---

## Generating a JWT Secret

If you don't have `openssl` handy, use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Getting a Gmail App Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Search for **App passwords**
4. Select app: **Mail** → device: **Other** → type `Job Tracker`
5. Copy the 16-character password → paste it as `EMAIL_PASS`

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free **M0** cluster
2. **Database Access** → Add user with username + password
3. **Network Access** → Add IP `0.0.0.0/0` (allow all — Render IPs change)
4. **Connect** → **Drivers** → copy the connection string
5. Replace `<password>` with your DB user password
6. Replace `myFirstDatabase` with `job-tracker`
7. Paste as `MONGO_URI` in Render

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error in browser | Check `CLIENT_URL` in Render matches Vercel URL exactly (no trailing slash) |
| 401 on all requests | JWT_SECRET mismatch — make sure it's the same value as when tokens were issued |
| Backend sleeping (Render free tier) | The keep-alive ping runs every 14 min — first request after sleep takes ~30s |
| Extension login fails | Check the API URL in the extension popup matches `https://hireatlas-api.onrender.com` |
| CSV import fails | File must be UTF-8 encoded. Re-save from Excel as CSV UTF-8 |
