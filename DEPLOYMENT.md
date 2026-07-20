# Deployment

## Local setup

Create a MySQL 8 database and use a non-root database account. Set the variables from `.env.example` in your terminal or in `backend/local.properties`; do not commit credentials.

```powershell
cd backend
.\mvnw.cmd clean test package
.\mvnw.cmd spring-boot:run
```

In another terminal, start the frontend:

```powershell
cd frontend
npm ci
$env:VITE_API_URL='http://localhost:8080'
npm run dev
```

## Production release

1. Host MySQL on a managed service and store `INSURAI_DB_URL`, `INSURAI_DB_USERNAME`, and `INSURAI_DB_PASSWORD` as platform secrets.
2. Deploy the Spring Boot service with Java 21. Build command: `./mvnw clean package`; start command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`.
3. Deploy the Vite frontend to Vercel or Netlify. Set `VITE_API_URL` to the public HTTPS backend URL at build time.
4. Add the frontend domain to `CorsConfig` before production release.
5. Use `spring.jpa.hibernate.ddl-auto=validate` after introducing managed database migrations. The current `update` setting is development-oriented.

## Operational safeguards

- Keep manual review mandatory for `PENDING_AGENT_REVIEW` underwriting outcomes.
- Keep raw health disclosures out of audit records; save outcome metadata and reason codes only.
- Use HTTPS, backups, and monitoring in production.
