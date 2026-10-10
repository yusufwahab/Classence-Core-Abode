# Classence Core Abode

Invite-only React + Express workspace with Supabase Auth/Postgres/private Storage and Brevo transactional emails.

## Fast setup

1. Node 22.12+ (or 24+) is required. Dependencies are installed at the repository root. Run `npm install` if moving this project to another machine.
2. The root `.env` is already created. Paste Supabase URL, anon key and service-role key, Brevo API key and verified sender email. Set your super-admin email, name and password (8+ characters including a number). Never put the service-role key in client files or a VITE variable.
3. Run the entire `supabase/schema.sql` once in the Supabase SQL editor. It creates tables, RLS, private buckets and service-only database functions. Keep Supabase public signup disabled. Set Auth recovery token expiry to 3600 seconds.
4. Run `npm run seed`. This creates admin `CCA-0000` and NDA version 1. Re-running does not reset the admin password.
5. In two terminals run `npm run server` and `npm run dev`. Open http://localhost:5173. Log in with `CCA-0000` and the admin password from `.env`.
6. The default NDA includes the supplied Classence company details and requires no organisation placeholder editing. To apply it to an existing database, run `npm.cmd run nda:update`. Signed agreements are preserved; an unsigned active version is updated in place, otherwise a new active version is created.
7. Add members or bulk invite. Brevo sender must be verified. Configure Brevo's transactional webhook for delivered, hardBounce, softBounce, blocked and error at `https://YOUR_HOST/api/webhooks/brevo?secret=YOUR_BREVO_WEBHOOK_SECRET`. Generate a long random secret and paste the same value in `.env`.

## Production

Set `CLIENT_URL` to the actual public HTTPS origin. Run `npm run build`, then `npm start`; Express serves the SPA and API from port 4000 (or PORT). Deploy to a Node host, with HTTPS reverse proxy, environment values, and persistent process management. Vite is development only. Restart the backend after changing `.env`. No credentials are needed in a client env file.

## Validation

`npm run build` checks frontend compilation. `npm test` verifies every meeting gate, URL removal, placeholder interpolation and PDF generation. Live activation, storage and Brevo delivery require your credentials and schema; those cannot be verified with blank `.env`.

## Decisions

- The default NDA is the replacement text supplied by the user, with ten sections, company details, the 10 October 2026 effective date and five-year confidentiality period. The version number is filled automatically.
- Version 1 is seeded active with the completed company details. Signed versions remain immutable; future revisions require a new version.
- Login session is held in localStorage; short-lived Supabase JWTs are refreshed through the backend. Server checks status and role on each request.
- Date/time controls use the browser timezone; the API stores UTC. Meetings do not disclose Google Meet URLs in list/detail responses, including admin lists. Edit requires re-entering the Meet URL.
- Bulk CSV uses simple name,email columns; quoted commas inside names are unsupported. Batches are limited to 100, processed sequentially with a 100ms gap. Existing emails fail individually.
- Member deletion is a suspension to preserve signature/access/audit records. NDA revocation preserves the PDF. The member can sign a fresh copy of a revoked agreement.
- NDA email failure preserves the signature, permits meeting access and produces a warning. All emails are logged; administrator resends create a new email log. Audit and email screens load the newest 2000/1000 entries, meeting access histories the newest 500.
- Private file URLs expire after 60 seconds. Bucket RLS gives browsers no direct access. All database access uses the server service-role client.
- No UI icon/component library, gradients, shadows or animations. Tailwind v4 tokens extend the original installation.

## Files

`client/` frontend; `server/` backend and default NDA; `supabase/schema.sql` provisioning; `.env` local secrets; `.env.example` portable template. The root package scripts are the supported entry points.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is disabled (for example `npm.cmd run dev`, `npm.cmd run server`, `npm.cmd run seed`). No execution-policy change is needed.

## Vercel deployment

The full frontend and backend can now deploy in one Vercel project. Follow [VERCEL.md](./VERCEL.md); use the repository root and client/dist output, and add backend secrets in Vercel Settings > Environment Variables.

## Separate Vercel frontend and Render backend

Set VITE_API_URL=https://classence-core-abode.onrender.com in Vercel and redeploy the frontend. Set CLIENT_URL=https://classencecore.yabvil.com on Render and restart/redeploy the backend. Keep Supabase and Brevo secrets on Render; they are unnecessary on Vercel when the frontend calls Render directly. The code adds /api itself. Leave VITE_API_URL blank for local development. Root .env is loaded by Vite, which exposes only VITE_ variables to the browser; never prefix provider secrets with VITE_. For Brevo webhooks, use the Render origin followed by /api/webhooks/brevo?secret=YOUR_SECRET.
