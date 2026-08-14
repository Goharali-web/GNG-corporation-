# GNG Corporation Website

A premium, high-performance, and minimal website engineered for AI automation workflows and next-generation immersive web experiences.

## 🚀 Deployment on Vercel

This repository is structured to deploy seamlessly on [Vercel](https://vercel.com). Routing and security headers are managed automatically via [vercel.json](file:///c:/Users/HP/Desktop/GNG%20Corporation%20website/vercel.json).

### 1. Serverless API Architecture
To avoid exposing sensitive database configurations or admin passwords to the client-side browser, all operations are proxied through Node.js Serverless Functions located in the [api/](file:///c:/Users/HP/Desktop/GNG%20Corporation%20website/api) directory:
- `/api/submit-booking`: Securely logs appointment submissions to Supabase.
- `/api/admin-login`: Validates admin dashboard credentials against server variables and returns secure HMAC tokens.
- `/api/get-bookings`: Fetches database rows for verified admins.
- `/api/delete-booking`: Deletes database rows for verified admins.

### 2. Environment Variables Configuration
Before deploying, you **must** configure the following environment variables in your Vercel Project Dashboard (Settings > Environment Variables):

| Variable Name | Description | Example Value |
|---|---|---|
| `SUPABASE_URL` | Your Supabase database endpoint | `https://your-project-id.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon publishable key | `sb_publishable_T-kioo9_...` |
| `ADMIN_EMAIL` | The admin email to access the logs dashboard | `ga480926@gmail.com` |
| `ADMIN_PASSWORD` | The admin password to access the logs dashboard | `nM^desWM%?19_)gng` |
| `ADMIN_SESSION_SECRET` | Any random string used to sign session tokens | `a-long-random-string-signature-hash` |

*See [.env.example](file:///c:/Users/HP/Desktop/GNG%20Corporation%20website/.env.example) for a template configuration.*

---

## ⚠️ CRITICAL SECURITY WARNING

> [!WARNING]
> **ROTATE PREVIOUSLY HARDCODED SECRETS IMMEDIATELY**
>
> If you previously committed code containing hardcoded credentials (such as the Supabase key, Admin credentials, or GitHub access tokens) to a public repository, those secrets remain visible in your Git history. 
> 
> Please rotate all of the following credentials immediately to prevent unauthorized access:
> 1. **Supabase Anon API Keys** (Reset via the API settings section in your Supabase Dashboard).
> 2. **Admin Password** (Update your `ADMIN_PASSWORD` environment variable in Vercel to a fresh password).
> 3. **GitHub Access Token** (Revoke and regenerate the token `ghp_36...` via your GitHub Developer settings).

---

## 🛠️ Local Development & Scripts

### Run Serverless Functions Locally
To test the API endpoints locally, install the Vercel CLI and run:
```bash
npm install -g vercel
vercel dev
```

### Push to GitHub Repository
Run the automation scripts to update files in your remote repository:
```cmd
push.bat
```
