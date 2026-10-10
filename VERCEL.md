# Deploy the full app on Vercel

This repository now includes both the static Vite frontend and an Express API Vercel Function. A separate backend host is not required for this configuration.

1. Commit and push the new api/index.js, vercel.json, package.json, package-lock.json, server/index.js, .gitignore and this guide. Never force-add .env.
2. Import the repository in Vercel, or update the existing project.
3. Root Directory: repository root (leave blank or select ./). Do not select client or server.
4. Framework Preset: Vite. Node.js Version: 22.x or 24.x.
5. Build Command: npm run build. Output Directory: client/dist. Install Command: npm ci. vercel.json supplies these values; clear conflicting dashboard overrides.
6. In Settings > Environment Variables, add SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME and BREVO_WEBHOOK_SECRET using values from local .env. They are server variables, so do not prefix names with VITE_. Set CLIENT_URL to your stable HTTPS Vercel domain with no trailing slash. Apply to Production and any Preview environments you need. PORT and SUPER_ADMIN_* are unnecessary on Vercel; seed the admin locally.
7. Deploy or redeploy after saving variables. Updating variables does not change an existing deployment.
8. Supabase schema must already be run. From your local project with credentials configured, run npm.cmd run seed once. Complete organisation details under Admin > Agreements.
9. Check https://YOUR_DOMAIN/api/health: it should return ok:true and configured:true. Check /login and refresh /admin to verify SPA routing. Confirm a real invite, signature PDF and email.
10. Point the Brevo webhook to https://YOUR_DOMAIN/api/webhooks/brevo?secret=YOUR_SECRET. Keep CLIENT_URL on the stable production URL so emailed links stay valid across preview deployments.

Local npm.cmd start and development scripts still work. The Vercel Function exports the Express app without opening a port; frontend assets come from client/dist. Function execution is capped at 300 seconds, including sequential bulk invitation emails. Rate limits use per-instance memory, so they are not a globally shared limiter across serverless instances.

Deployment errors: if Vercel says no dist directory was found, confirm output is client/dist and repository root is selected. If it cannot find client, the Root Directory is wrong. A runtime 503 with the setup message means missing Supabase environment values. A missing API or HTML instead of JSON means the new routing config was not deployed. Send the exact build/runtime error for any other failure.
