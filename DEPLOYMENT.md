# Deployment Guide

InsurAI is deployed as two services:

- `frontend/`: React + Vite on Vercel.
- `backend/`: Spring Boot + MySQL on Railway.

Vercel should not host the current Java/MySQL backend. The frontend needs the
public Railway API URL at build time, and the backend must allow the Vercel
domain through CORS.

## 1. Confirm the repository is ready

Run these commands locally before pushing:

```powershell
cd backend
.\mvnw.cmd clean test

cd ..\frontend
npm ci
npm run build
```

Do not commit `backend/local.properties`, `.env`, `.env.local`, database dumps,
or any password. Use the included `.env.example` files only as templates.

## 2. Deploy MySQL and the backend on Railway

1. Create a Railway project and add a **MySQL** service.
2. Add a second service using this GitHub repository.
3. Set the backend service **Root Directory** to `backend`. Railway detects the
   included `Dockerfile`, which builds with Java 21 and starts Spring Boot on
   Railway's `PORT`.
4. In the backend service's Variables section, add the following values. Use
   Railway variable references for the database values; do not copy a password
   into the repository.

```text
INSURAI_DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
INSURAI_DB_USERNAME=${{MySQL.MYSQLUSER}}
INSURAI_DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
INSURAI_ALLOWED_ORIGINS=https://*.vercel.app
GEMINI_API_KEY=your_key_only_if_you_enable_the_chat_feature
```

Replace `MySQL` above with the exact Railway MySQL service name if you choose a
different name. If you add a custom frontend domain later, append it to
`INSURAI_ALLOWED_ORIGINS`, separated by a comma.

5. Deploy the backend, open **Settings -> Networking**, and generate a public
   domain. Configure `/actuator/health` as the health-check path.
6. Confirm `https://your-railway-domain/actuator/health` responds with
   `{"status":"UP"}` before moving to Vercel.

## 3. Deploy the frontend on Vercel

1. In Vercel, select **Add New -> Project** and import this GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Select the **Vite** framework preset. Use these values if Vercel does not
   detect them automatically:

```text
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Node.js Version: 22.x
```

4. In **Settings -> Environment Variables**, add this Production variable:

```text
VITE_API_URL=https://your-railway-domain
```

Do not add database credentials or `GEMINI_API_KEY` to Vercel. Vite variables
are compiled into browser code, so only public configuration belongs there.

5. Deploy. The included `frontend/vercel.json` keeps React Router routes working
   when a user refreshes a page directly.
6. Copy the resulting Vercel domain into the Railway CORS variable for a stricter
   allowlist, for example:

```text
INSURAI_ALLOWED_ORIGINS=https://your-project.vercel.app,https://*.vercel.app
```

Redeploy Railway after changing backend variables. Redeploy Vercel whenever
`VITE_API_URL` changes because it is embedded during the frontend build.

## 4. Final verification

1. Open the Vercel URL in an incognito window.
2. Log in and open Plans, Dashboard, Claims, and an Agent screen.
3. In browser DevTools -> Network, confirm every API request targets the
   Railway HTTPS domain, never `localhost:8080` or `localhost:8081`.
4. Confirm a database-backed action such as plan retrieval or an appointment
   succeeds, then inspect Railway logs for errors.
