# TASK: Build "Classence Core Abode", an invite-only internal meeting + NDA access platform

Build the full working MVP (frontend, backend, DB schema, emails) in one pass. Work fast, in the build order at the bottom. Do not add features that aren't listed. Do not ask me questions; where something is unspecified, pick the simplest sensible option and note it in the README.

## 1. Stack

- Frontend: React (Vite) + React Router + Tailwind CSS. Tailwind is ALREADY INSTALLED and configured in /client. Do not reinstall it or re-run its init. Check which version is installed (v3 uses tailwind.config.js `theme.extend.colors`; v4 uses `@import "tailwindcss"` and an `@theme` block in the main CSS file) and extend the theme the correct way for that version.
- No UI component library, no icon library, no extra Tailwind plugins.
- Backend: Node.js + Express (single `server/` folder).
- Database/Auth/Storage: Supabase (PostgreSQL, Supabase Auth, private Storage buckets).
- Email: Brevo transactional API (REST, `api-key` header).
- PDF: `pdf-lib` on the server. Validation: `zod`. Security: `helmet`, `cors`, `express-rate-limit`.
- Signature drawing: plain HTML `<canvas>` (no library).

Folder layout:

```
/client   (React + Tailwind, already set up)
/server   (Express)
/supabase/schema.sql
/server/scripts/seed-super-admin.js
.env.example, README.md
```

## 2. Design system (strict, Tailwind utility classes only)

Theme: PURPLE AND WHITE. Flat, clean, professional.

Forbidden: icons, emojis, gradients (never use bg-gradient-_, from-_, via-_, to-_), shadows (never use shadow-\*), animations. Only allowed motion: `transition-colors duration-100` on hover. The only overlay effect is a plain `bg-brand-950/60` behind modals.

Add these colour tokens to the Tailwind theme (never hardcode hex values in components):

- brand-50 #F5F3FF (page tint areas, notices, row hover)
- brand-100 #EDE9FE (table header bg, pill bg, selected tab bg)
- brand-200 #DDD6FE (borders, dividers)
- brand-300 #C4B5FD (input focus ring/border)
- brand-500 #8B5CF6 (secondary accents, links on hover)
- brand-600 #7C3AED (PRIMARY: buttons, links, active nav)
- brand-700 #6D28D9 (primary hover)
- brand-800 #5B21B6 (headings, sidebar active text)
- brand-950 #2E1065 (modal overlay, top bar text)
- ink #1F1A33 (body text)
- muted #6B6585 (secondary text, helper text)
- white #FFFFFF (all page and card backgrounds)
- danger #B42318, success #027A48, warning #B54708 (status text only, used sparingly)

Typography: Tailwind default system sans stack. Body `text-sm` (14px). Table text `text-[13px]`. Page headings `text-xl font-semibold text-brand-800`. Section headings `text-base font-semibold text-brand-800`. Labels `text-[13px] text-ink`. Helper text `text-xs text-muted`.
Shape and spacing: `rounded` (4px) everywhere, borders `border border-brand-200`, spacing in steps of 1/2/4/6/8 (4/8/16/24/32px). Page background is white. Purple appears as text colour, borders, button fills, table headers and tinted notice boxes, never as large page backgrounds.

Build these reusable components FIRST in /client/src/components/ui and use them on every screen so pages contain no long repeated class strings:

- `Button`: all variants `h-9 px-4 rounded text-sm transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed`.
  - primary: `bg-brand-600 text-white hover:bg-brand-700`
  - secondary: `bg-white text-brand-700 border border-brand-200 hover:bg-brand-50`
  - danger: `bg-white text-danger border border-danger hover:bg-red-50`
  - dangerSolid: `bg-danger text-white` (confirm modals only)
  - link (text button): `text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline`, no border, no height
- `Input`, `Textarea`, `Select`: `h-9 w-full border border-brand-200 rounded px-3 bg-white text-ink focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-300`. Label above, error text below in `text-xs text-danger`.
- `Pill`: `inline-block border border-brand-200 bg-brand-50 rounded px-2 py-0.5 text-xs`, with text colour by status (text-success, text-warning, text-danger, text-brand-700, text-muted). No dots, no icons.
- `Table`: `w-full text-[13px]`, thead `bg-brand-100 text-brand-800 text-left`, rows `h-10 border-b border-brand-200 hover:bg-brand-50`, no zebra. Props for `loading` (shows "Loading...") and `emptyText` (e.g. "No members yet."). Wrapped in `overflow-x-auto`.
- `Modal`: see section 7. `Toast`, `Notice` (`border border-brand-200 bg-brand-50 rounded p-4`), `Tabs` (plain text buttons; active = `font-semibold text-brand-700 border-b-2 border-brand-600`; inactive = `text-muted`), `StatBox` (`border border-brand-200 rounded p-4`, number `text-2xl font-semibold text-brand-800`, label `text-xs text-muted`), `SidePanel` (`w-[400px] bg-white border-l border-brand-200 p-6 fixed right-0 inset-y-0 overflow-y-auto`).

Layouts:

- Auth pages: `mx-auto mt-24 w-full max-w-[400px] border border-brand-200 rounded p-6 bg-white`. Above the card, the product name "Classence Core Abode" in `text-xl font-semibold text-brand-800`.
- Member pages: top bar `border-b border-brand-200 bg-white h-14 px-6 flex items-center justify-between`, brand name on the left in `font-semibold text-brand-800`, text links on the right (active = `text-brand-700 font-semibold`, inactive = `text-muted hover:text-brand-600`). Content `mx-auto max-w-[800px] p-6`.
- Admin pages: `flex` layout. Sidebar `w-[220px] shrink-0 border-r border-brand-200 bg-brand-50 min-h-screen p-4` with text links only. Active link = `font-semibold text-brand-800 border-l-2 border-brand-600 pl-3 bg-white`. Inactive = `text-ink hover:text-brand-600 pl-3`. "Log out" at the bottom. Content `flex-1 p-6 min-w-0`.
- Mobile (below md): sidebar hidden and replaced by a top bar with a "Menu" text button that toggles the links. Tables scroll horizontally.

## 3. Roles and navigation

Roles: `super_admin`, `member`. Route guards on the client AND role checks on the server.

Public routes: `/login`, `/activate?token=...`, `/forgot-password`, `/reset-password`

Member routes (top bar: "Classence Core Abode" on the left; on the right: member name, "Meetings", "My Documents", "Log out", all as text links):
`/meetings`, `/meetings/:id`, `/nda`, `/documents`

Super Admin routes (left sidebar, text links only):
`/admin` Overview, `/admin/members`, `/admin/meetings`, `/admin/nda` (NDA submissions), `/admin/agreements`, `/admin/emails`, `/admin/audit`

After login: super_admin goes to `/admin`, member goes to `/meetings`.

## 4. Database

Write `/supabase/schema.sql`. Enable RLS on every table with no client policies. ALL data access goes through the Express backend using the service-role key.

- `profiles`: id (uuid, FK auth.users), classence_id (text unique, e.g. CCA-0001, generated server-side from a Postgres sequence), full_name, email (unique), role (`super_admin`|`member`), status (`invited`|`active`|`suspended`), created_at, activated_at
- `invitations`: id, profile_id, token_hash (store SHA-256 only), expires_at (7 days), used_at, created_at
- `agreements`: id, version (int), title, body (text, supports {{placeholders}}), is_active (bool, only one true), created_at, created_by
- `nda_signatures`: id, profile_id, agreement_id, full_name, email, phone, position, address, signed_date, signature_method (`drawn`|`uploaded`), signature_path, pdf_path, ip_address, user_agent, email_status (`pending`|`sent`|`delivered`|`failed`), brevo_message_id, signed_at, revoked_at (nullable), revoked_reason
- `meetings`: id, title, description, meet_url, starts_at, ends_at, access_opens_at, access_expires_at, status (`scheduled`|`cancelled`), created_by, created_at
- `meeting_revocations`: id, meeting_id, profile_id, revoked_at, reason (a member-specific block for one meeting)
- `access_logs`: id, meeting_id, profile_id, result (`granted`|`denied`), reason, ip_address, created_at
- `email_logs`: id, profile_id (nullable), type (`invite`|`nda_signed`|`password_reset`|`other`), to_email, subject, status (`queued`|`sent`|`delivered`|`failed`|`bounced`), brevo_message_id, error, created_at
- `audit_logs`: id, actor_id, action, entity_type, entity_id, metadata (jsonb), ip_address, created_at

Storage buckets (both PRIVATE): `signatures`, `nda-pdfs`. Access only via backend-generated signed URLs (60 seconds expiry).

## 5. Core business rules

1. Only the Super Admin creates members. No public sign-up.
2. Login uses Classence ID + password. `POST /api/auth/login` looks up the email by classence_id, then calls Supabase `signInWithPassword`. Return a generic "Invalid Classence ID or password" on any failure. Block `suspended` users.
3. Activation: member opens the invite link, sees their name and Classence ID, sets a password (min 8 chars, at least 1 number), and the account becomes `active`. Token is single-use and expires in 7 days.
4. A member can see a meeting's details but NOT the Meet link until ALL of these are true:
   - profile status is `active`
   - they have a non-revoked `nda_signatures` row for the CURRENT active agreement version
   - the meeting status is `scheduled`
   - now is between `access_opens_at` and `access_expires_at`
   - no row in `meeting_revocations` for them and that meeting
     The Meet URL must NEVER be included in list or detail API responses. Only `POST /api/meetings/:id/access` returns it, and it logs `granted` or `denied` (with reason) to `access_logs` every time.
5. If a new agreement version is activated, members must re-sign before their next access.
6. NDA signing creates the PDF, stores it, emails it, and ONLY THEN returns success. If email sending fails, keep the signature record, mark email_status `failed`, show the member a warning, and still allow access (the Super Admin can resend).
7. Every admin action writes to `audit_logs`.

## 6. Screens (build exactly these)

### 6.1 Login `/login`

Auth card. Title "Classence Core Abode", subtitle "Private workspace. Authorized team members only." (`text-muted`).
Fields: "Classence ID" (placeholder CCA-0001), "Password" (with a plain "Show" / "Hide" text toggle).
Button: "Log in" (primary, full width). Under it, a text link "Forgot password?".
Errors show as red text above the button.

### 6.2 Activate `/activate`

Same card style. Shows "Welcome, {Full name}" and "Your Classence ID: {ID}" as plain text.
Fields: "New password", "Confirm password". Button: "Activate account".
Invalid or expired token shows "This invitation link is invalid or has expired. Contact the Super Admin." and no form.
On success, redirect to `/login` with a green message "Account activated. Log in to continue."

### 6.3 Forgot / Reset password

Forgot: one field "Classence ID", button "Send reset link". Always show "If the account exists, a reset link has been sent."
Reset page: new password + confirm, button "Update password". Use the Supabase Auth recovery flow, with the email sent via Brevo.

### 6.4 Member: Meetings `/meetings`

Heading "Meetings". If the NDA for the current version is not signed, show a `Notice` at the top: "You must sign the current NDA before accessing meeting links." with a primary button "Sign NDA".
Table: Title | Date & time | Access window | Status | Action.
Status values: "Upcoming", "Open", "Expired", "Cancelled", "Access revoked".
Action: "View" button (secondary).

### 6.5 Member: Meeting detail `/meetings/:id`

Title, description, date/time and access window as plain label/value rows (label `text-muted`, value `text-ink`).
Section "Access":

- NDA unsigned: text "NDA required." + button "Sign NDA".
- Outside window: "Access opens on {date}" or "Access expired on {date}". No button.
- Revoked: "Your access to this meeting has been revoked. Contact the Super Admin."
- Allowed: primary button "Join meeting". Clicking calls the access endpoint and opens the Meet URL in a new tab. Show the NDA signed date and version below in `text-muted`.

### 6.6 Member: NDA signing `/nda`

Single page, max 800px, 3 numbered sections shown as plain headings:

1. "Review agreement": scrollable bordered box (`max-h-[360px] overflow-y-auto border border-brand-200 rounded p-4`) rendering the active agreement body with the member's details filled in. Below it: "Version {n}".
2. "Your details": Full legal name (prefilled, editable), Email (prefilled, read-only), Phone number, Position/Role, Residential address (textarea), Date (today, read-only).
3. "Sign": two tabs as plain text buttons "Draw" and "Upload image". Draw = 500x160 canvas with `border border-brand-200 bg-white` plus a "Clear" secondary button. Upload = file input (PNG/JPG, max 2MB) with a preview.
   Below: checkbox "I have read and agree to the terms of this Non-Disclosure Agreement and I understand this electronic signature is legally binding."
   Button: "Sign and submit" (primary, disabled until all fields are valid, a signature exists, and the checkbox is ticked).
   On submit, a confirm modal appears (7.1). After success, show a full-page confirmation: "NDA signed. A copy has been sent to {email}." + buttons "Download my copy" (secondary) and "Go to meetings" (primary).
   If the current version is already signed, redirect to `/documents`.

### 6.7 Member: My Documents `/documents`

Table: Document | Agreement version | Signed on | Email status | Action ("Download" opens a 60s signed URL).

### 6.8 Admin: Overview `/admin`

Row of 4 `StatBox`es: "Total members", "Active members", "Pending invitations", "NDAs signed (current version)". Below: two tables side by side: "Upcoming meetings" (next 5) and "Recent activity" (last 10 audit entries: time, actor, action). Under them: "Failed emails" count with a link "View" to `/admin/emails?status=failed`.

### 6.9 Admin: Members `/admin/members`

Top row: search input (name, email, ID), status filter dropdown (All/Invited/Active/Suspended), buttons "Add member" (secondary) and "Bulk invite" (primary).
Table: Classence ID | Name | Email | Status | NDA (Signed / Not signed / Outdated) | Last invite sent | Actions.
Row actions (text buttons): "Resend invite" (only if invited), "Suspend" / "Reactivate", "Reset password", "View".
"View" opens the `SidePanel`: member details, NDA history, meeting access history, and a "Revoke NDA" danger button.
Pagination: "Previous" / "Next" text buttons, 25 per page.

### 6.10 Admin: Meetings `/admin/meetings`

Button "Create meeting". Table: Title | Starts | Access window | Status | NDA signed count | Actions ("Edit", "Cancel", "Manage access", "Access log").
"Manage access" opens a modal listing all active members with a "Revoke" / "Restore" button per row for that meeting.
"Access log" opens a modal table: Time | Member | Result | Reason.

### 6.11 Admin: NDA submissions `/admin/nda`

Filters: agreement version, email status, search. Table: Member | Classence ID | Version | Signed at | IP | Email status | Actions ("View PDF", "Download", "Resend email", "Revoke").
"View PDF" opens the signed URL in a new tab. "Resend email" re-sends the PDF via Brevo and updates the status.

### 6.12 Admin: Agreements `/admin/agreements`

Table: Version | Title | Status (Active/Inactive) | Created | Actions ("View", "Activate").
Button "New version" opens a large modal with Title and a large Body textarea (font-mono, `h-[400px]`) and help text listing placeholders: {{full_name}}, {{email}}, {{classence_id}}, {{address}}, {{position}}, {{date}}.
Seed a default NDA (version 1) with standard clauses: definition of confidential information, obligations, permitted use, exclusions, duration (2 years), return/destruction of materials, remedies, governing law (Nigeria), and entire-agreement clause.
"Activate" shows a confirm modal warning that all members must re-sign.

### 6.13 Admin: Emails `/admin/emails`

Filters: type, status, date. Table: Time | Type | Recipient | Subject | Status | Action ("Resend" where applicable). Status updates come from the Brevo webhook.

### 6.14 Admin: Audit log `/admin/audit`

Filters: action, actor, date range. Table: Time | Actor | Action | Target | Details (short JSON text, "Show" expands inline). Button "Download CSV".

## 7. Modals (all use one shared component)

Overlay `fixed inset-0 bg-brand-950/60 flex items-center justify-center`. Modal panel: `bg-white rounded border border-brand-200 w-full max-w-[480px]` (`max-w-[640px]` for large ones), `p-6`. Header = title (`text-base font-semibold text-brand-800`) + a "Close" text button on the right, with a bottom border `border-brand-200`. Footer = right-aligned buttons: Cancel (secondary) then the action (primary or dangerSolid). Close on Esc and overlay click, except for forms with unsaved input. Trap focus.

### 7.1 Confirm NDA signature

Title "Confirm signature". Text: "You are about to sign the Classence Non-Disclosure Agreement (Version {n}) as {name}. This cannot be undone." Buttons: Cancel, "Confirm and sign".

### 7.2 Add member

Fields: Full name, Email. Info text: "A Classence ID will be generated automatically." Buttons: Cancel, "Add and send invite".

### 7.3 Bulk invite

Two tabs: "Paste list" (textarea, one per line: `Full name, email`) and "Upload CSV" (columns name,email). After parsing, show a preview table (Name | Email | Status: "Valid", "Invalid email", "Duplicate") with a summary such as "12 valid, 1 invalid". Buttons: Cancel, "Send {n} invites". After sending, show a results table: Name | Classence ID | Result (Sent/Failed). Process sequentially with a small delay and handle Brevo failures per row without stopping the batch.

### 7.4 Create / edit meeting

Fields: Title, Description (textarea), Google Meet link (must start with https://meet.google.com/), Starts at, Ends at, Access opens at, Access expires at (defaults: opens 15 min before start, expires at end time). Validate: opens <= starts < ends <= expires. Buttons: Cancel, "Save meeting".

### 7.5 Confirm actions (generic)

Used for: Suspend member, Revoke NDA (requires a reason textarea), Cancel meeting, Activate agreement, Revoke meeting access. The danger button label states the action (e.g. "Suspend member").

### 7.6 Toasts

Plain bar fixed top-center: `bg-white border border-brand-200 rounded px-4 py-2`, auto-dismiss after 4s. Success text `text-success`, error text `text-danger`. No icons.

## 8. API (all under /api, JSON, zod-validated, rate-limited; auth via Supabase JWT in the Authorization header)

Public: `POST /auth/login`, `POST /auth/activate`, `GET /auth/invitation/:token`, `POST /auth/forgot-password`, `POST /webhooks/brevo` (verify with a shared secret query param).
Member: `GET /me`, `GET /meetings`, `GET /meetings/:id`, `POST /meetings/:id/access`, `GET /agreements/active`, `POST /nda/sign`, `GET /documents`, `GET /documents/:id/download`.
Admin (super_admin only): CRUD for `/admin/members`, `POST /admin/members/bulk`, `POST /admin/members/:id/resend-invite`, `/suspend`, `/reactivate`, `/reset-password`, `/admin/meetings` CRUD + `/revocations`, `/admin/nda`, `/admin/nda/:id/resend`, `/admin/nda/:id/revoke`, `/admin/nda/:id/pdf`, `/admin/agreements` + `/activate`, `/admin/emails`, `/admin/audit`, `/admin/stats`.

`POST /nda/sign` flow: validate -> upload signature image (drawn canvas arrives as base64 PNG) to `signatures` -> render agreement body with placeholders -> generate PDF with pdf-lib (title, version, body text wrapped across pages, signature image, details block, signed timestamp, IP address, and a document reference ID in the footer) -> upload to `nda-pdfs` -> insert `nda_signatures` -> send email with PDF attached (base64) via Brevo -> log to `email_logs` + `audit_logs` -> return success.

## 9. Emails (Brevo, plain HTML, no images, no gradients, white background, dark text, one purple button)

Use inline styles in email HTML: button background #7C3AED, white text, 4px radius, padding 10px 20px; headings colour #5B21B6; body text #1F1A33.

1. Invitation: subject "You have been invited to Classence Core Abode". Body: greeting by name, their Classence ID, an "Activate your account" button, expiry note (7 days), and a line that the workspace is private and confidential.
2. NDA signed: subject "Your signed Classence NDA (v{n})". Body: confirmation, date/time signed, PDF attached.
3. Password reset: subject "Reset your Classence password". Button + 1 hour expiry.
   Send via `POST https://api.brevo.com/v3/smtp/email` with `sender`, `to`, `subject`, `htmlContent`, `attachment: [{name, content}]`. Save the returned `messageId` to the log row. The webhook maps events (delivered, hardBounce, softBounce, blocked, error) to `email_logs.status` and `nda_signatures.email_status`.

## 10. Security checklist (must implement)

- Service-role key only on the server. Never expose it to the client.
- Helmet, strict CORS to CLIENT_URL, rate limit login (5/min/IP) and token endpoints.
- Invite tokens: 32 random bytes, store only the SHA-256 hash.
- Meet URL never leaves the server except via the access endpoint.
- Signed URLs expire in 60s for any file. No public buckets.
- Sanitize and validate all inputs; limit uploads to 2MB; accept only PNG/JPG signatures.
- Do not leak whether a Classence ID exists (generic errors).
- The Super Admin cannot suspend or delete themselves.

## 11. .env.example

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=Classence Core Abode
BREVO_WEBHOOK_SECRET=
CLIENT_URL=http://localhost:5173
PORT=4000
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_NAME=
SUPER_ADMIN_PASSWORD=
```

`seed-super-admin.js` creates the Super Admin in Supabase Auth + profiles with classence_id `CCA-0000`, and seeds NDA v1 as active.

## 12. Build order (target: 30 minutes, do not skip ahead)

1. (3 min) Schema SQL, seed script, Express skeleton, auth middleware, Supabase + Brevo clients. Also extend the EXISTING Tailwind theme with the purple tokens from section 2 and build the /components/ui primitives (do not reinstall Tailwind).
2. (5 min) Auth endpoints + Login, Activate, Forgot/Reset screens + route guards.
3. (6 min) Admin Members (add, bulk invite, resend, suspend) + invite email.
4. (5 min) NDA flow: agreement fetch, signing page with canvas, PDF generation, storage, email with attachment.
5. (4 min) Meetings: admin CRUD, member list/detail, access endpoint with all rules + access logs.
6. (4 min) Admin NDA submissions, Emails, Audit, Agreements, Overview.
7. (3 min) Brevo webhook, polish empty/loading/error states, README with setup steps.

## 13. Done when

- Super Admin can bulk-invite, and members activate and log in with their Classence ID.
- A member without a signed NDA cannot obtain a Meet link by UI or by calling the API directly.
- Signing produces a PDF in private storage, a Brevo email with the attachment, and rows in nda_signatures, email_logs, audit_logs.
- Revoked, expired or cancelled meetings deny access and log the denial.
- The UI uses only the purple and white palette from section 2, with zero icons, zero gradients and zero shadows, and every screen is built from the shared /components/ui primitives.

The NDA should be in this format:

# CLASSENCE

## CORE TEAM CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT

**Agreement Reference:** [Automatically Generated]

**Version:** 1.0

**Effective Date:** [Date and Time of Electronic Signature]

This Core Team Confidentiality and Non-Disclosure Agreement (“Agreement”) is entered into between:

**CLASSENCE**, being the entity or business operating under the Classence name, with its registered or principal business address at [Classence Address] (“Classence” or the “Disclosing Party”); and

**[Full Legal Name]**, identified by Classence ID [Classence ID], with the registered email address [Email Address] (“Recipient” or the “Receiving Party”).

Classence and the Recipient are individually referred to as a “Party” and collectively as the “Parties.”

### 1. PURPOSE OF THIS AGREEMENT

The Recipient may participate in Classence's internal meetings, product development activities, educational technology initiatives, planning sessions, technical discussions, business operations, and other Core Team activities.

In connection with these activities, the Recipient may receive, access, discuss, create, or otherwise encounter confidential information belonging to Classence or its partners, collaborators, users, and other authorized information providers.

The purpose of this Agreement is to protect that information against unauthorized disclosure, use, copying, distribution, exploitation, or access.

### 2. DEFINITION OF CONFIDENTIAL INFORMATION

“Confidential Information” means information disclosed or made accessible to the Recipient by or on behalf of Classence, whether before or after the effective date of this Agreement, in written, oral, electronic, visual, digital, or any other form, where the information is identified as confidential or ought reasonably to be understood as confidential given its nature or the circumstances of disclosure.

Confidential Information includes, without limitation:

**2.1 Business and strategic information**

- Business plans, internal strategies, financial information, budgets, revenue models, pricing, forecasts, and fundraising plans.
- Business proposals, partnership discussions, negotiations, investor communications, and growth strategies.
- Internal meeting discussions, minutes, recordings, presentations, documents, and decisions not intended for public distribution.

**2.2 Technical and product information**

- Source code, repositories, algorithms, system architecture, APIs, databases, credentials, authentication mechanisms, technical documentation, and security procedures.
- Product concepts, prototypes, wireframes, designs, user interfaces, development roadmaps, feature specifications, and unreleased products.
- Proprietary workflows, research, experiments, technical findings, and implementation details.

**2.3 Educational and user-related information**

- Non-public information relating to students, schools, educators, institutional partners, users, and other stakeholders.
- Assessment records, unpublished educational content, internal analytics, personal data, and other restricted records accessed through Classence activities.

**2.4 Team and operational information**

- Internal communications, team responsibilities, access permissions, operational procedures, internal credentials, and administrative records.
- Documents, files, and discussions shared through Classence Core Abode or any other authorized Classence communication channel.

**2.5 Third-party information**

Information entrusted to Classence by a partner, client, school, service provider, or other third party under an obligation of confidentiality is also Confidential Information where the Recipient receives or accesses it through Classence.

Confidential Information may be protected whether or not it bears a “Confidential” label.

### 3. OBLIGATIONS OF THE RECIPIENT

The Recipient agrees to:

a. Keep Confidential Information strictly confidential and protect it using reasonable care and appropriate security measures.

b. Use Confidential Information solely for authorized Classence activities and not for personal gain, unauthorized commercial purposes, or activities unrelated to the approved purpose.

c. Not disclose, publish, forward, distribute, reproduce, or otherwise make Confidential Information available to any unauthorized person without prior written authorization from Classence.

d. Not share meeting links, access credentials, private repositories, internal documents, screenshots, recordings, or other restricted materials with unauthorized individuals.

e. Take reasonable steps to prevent unauthorized access, copying, loss, misuse, or disclosure of Confidential Information.

f. Not use Confidential Information to compete unfairly with Classence, misappropriate its business opportunities, or obtain an unauthorized advantage.

g. Promptly notify the designated Classence administrator of any suspected or actual unauthorized access, disclosure, loss, or misuse of Confidential Information.

h. Comply with reasonable security, access-control, data-protection, and confidentiality policies communicated by Classence.

### 4. MEETINGS AND INTERNAL COMMUNICATIONS

The Recipient acknowledges that internal Classence meetings may involve confidential technical, commercial, operational, strategic, and educational information.

Accordingly, the Recipient shall not, without appropriate authorization:

a. Record, livestream, photograph, screenshot, or transcribe a confidential meeting for unauthorized purposes.

b. Share meeting recordings, notes, presentations, or discussions outside the authorized team.

c. Invite an unauthorized individual to a confidential meeting or transfer meeting access credentials to another person.

d. Publish or disclose internal decisions, proposed features, business discussions, or other confidential matters on social media, public forums, personal websites, or external communication channels.

Where Classence authorizes a recording or disclosure, the Recipient shall comply with any conditions attached to that authorization.

### 5. EXCEPTIONS TO CONFIDENTIALITY

The obligations under this Agreement do not apply to information that the Recipient can reasonably demonstrate:

a. Is or becomes publicly available through no breach of this Agreement or other duty of confidentiality.

b. Was lawfully known to the Recipient before disclosure by Classence, without an existing confidentiality restriction.

c. Is lawfully received from an independent third party who is not under an obligation to keep it confidential.

d. Is independently developed by the Recipient without using or relying on Classence's Confidential Information.

e. Is approved for public disclosure through prior written authorization from Classence.

The Recipient bears the responsibility of providing reasonable evidence where an exception is claimed.

### 6. LEGALLY REQUIRED DISCLOSURE

If the Recipient is required by applicable law, a valid court order, or a competent regulatory authority to disclose Confidential Information, the Recipient may disclose only the portion legally required.

Where legally permitted, the Recipient shall give Classence prompt written notice before disclosure and reasonably cooperate with any lawful effort to protect the information from unnecessary public disclosure.

Nothing in this Agreement requires the Recipient to violate the law, obstruct lawful proceedings, or refrain from making a disclosure that is legally protected.

### 7. INTELLECTUAL PROPERTY AND OWNERSHIP

All Confidential Information remains the property of Classence or the relevant third-party owner.

Nothing in this Agreement transfers ownership of Classence's trademarks, source code, designs, documents, proprietary systems, or other intellectual property to the Recipient.

The Recipient shall not represent that they own or are authorized to commercially exploit Classence's intellectual property merely because they have been granted access to it.

This Agreement does not, by itself, assign ownership of every work, idea, invention, design, or contribution created by the Recipient. Any intellectual property assignment, licensing arrangement, or ownership allocation shall be addressed in a separate written agreement where appropriate.

The Recipient retains any rights that cannot lawfully be excluded or transferred under applicable law.

### 8. PERSONAL DATA AND INFORMATION SECURITY

Where the Recipient accesses personal data or other protected records through Classence, the Recipient shall:

a. Access and use such information only for authorized purposes.

b. Follow applicable data-protection requirements and Classence's reasonable privacy and security policies.

c. Not export, retain, disclose, or reuse personal data beyond the scope of authorized activities.

d. Take reasonable measures to protect the information against unauthorized access, alteration, loss, or disclosure.

e. Promptly report suspected personal-data breaches or security incidents to the designated Classence administrator.

This Agreement supplements, and does not replace, any applicable privacy notice, data-processing agreement, or other legal obligation.

### 9. RETURN, DELETION, AND RETENTION OF INFORMATION

Upon Classence's reasonable request, termination of the Recipient's engagement, or cessation of the relevant authorization, the Recipient shall stop using the Confidential Information and return or securely delete copies under the Recipient's control, subject to applicable legal obligations and legitimate retention requirements.

The Recipient shall not retain confidential documents, credentials, private repository copies, or other restricted materials for unauthorized future use.

Where deletion or return is requested, the Recipient shall confirm compliance upon reasonable request, except to the extent retention is legally required or the information remains in routine backups that cannot reasonably be selectively removed, provided it remains protected and is not restored or used for unauthorized purposes.

### 10. DURATION OF CONFIDENTIALITY

This Agreement takes effect on the date and time the Recipient electronically signs it.

The Recipient's confidentiality obligations continue throughout their involvement with Classence and for **five (5) years after the end of that involvement**, unless a longer period is agreed in writing.

Information that qualifies as a trade secret under applicable law shall remain protected for as long as it retains that status and the law permits its protection.

Personal data and third-party information shall remain subject to any longer protection period required by applicable law or a separate binding obligation.

Expiration of the ordinary confidentiality period does not excuse an earlier breach or remove liability that has already arisen.

### 11. NO UNAUTHORIZED RIGHTS OR COMMITMENTS

Nothing in this Agreement grants the Recipient authority to enter into contracts on behalf of Classence, make representations on its behalf, bind Classence to financial commitments, or access systems beyond the permissions expressly granted.

Participation in a meeting or membership of the Core Team does not, by itself, establish an employment relationship, partnership, agency, or ownership interest in Classence.

Any such relationship shall be determined by the applicable appointment, employment, partnership, or other written agreement and the relevant law.

### 12. BREACH AND REMEDIES

The Recipient acknowledges that unauthorized disclosure or misuse of Confidential Information may cause harm to Classence, its partners, or other affected parties.

In the event of an actual or threatened breach, Classence may pursue remedies available under applicable law, including appropriate injunctive or equitable relief where legally justified, damages where established, and other lawful remedies.

Classence may also suspend or revoke the Recipient's access to its systems, meetings, repositories, and internal documents where reasonably necessary to protect Confidential Information.

Nothing in this Agreement creates an automatic financial penalty or removes any legal defence or right available to either Party.

### 13. GOVERNING LAW AND DISPUTE RESOLUTION

This Agreement shall be governed by the laws of the Federal Republic of Nigeria, subject to any mandatory applicable law.

The Parties shall first seek to resolve disputes arising from this Agreement through good-faith discussions.

Where a dispute cannot be resolved amicably, either Party may pursue the remedies available before a court of competent jurisdiction in Nigeria.

Nothing in this clause prevents either Party from seeking urgent lawful relief where necessary.

### 14. GENERAL PROVISIONS

**14.1 Entire agreement:** This Agreement constitutes the Parties' agreement concerning the confidentiality subject matter addressed herein and supersedes prior discussions on that subject, to the extent legally permissible.

**14.2 Amendments:** Any amendment must be recorded in writing and accepted by both Parties where required. A material revision shall not be treated as retroactively accepted merely because the Recipient signed an earlier version.

**14.3 Severability:** If any provision is found invalid or unenforceable, the remaining provisions shall continue to apply to the extent legally permissible.

**14.4 No waiver:** Failure to enforce a provision on one occasion does not automatically waive the right to enforce it later.

**14.5 Assignment:** The Recipient may not transfer their obligations under this Agreement to another person without Classence's prior written consent. Any assignment by Classence shall remain subject to applicable law.

**14.6 Electronic execution:** The Parties intend that this Agreement may be accepted and signed electronically, subject to applicable law. The electronic signing record, agreement version, timestamp, and associated authentication records may be retained as evidence of execution.

**14.7 No exclusion of statutory rights:** Nothing in this Agreement excludes rights, protections, or disclosures that cannot lawfully be waived or restricted.

### 15. ACKNOWLEDGMENT AND ACCEPTANCE

By signing this Agreement, the Recipient confirms that:

a. They have had the opportunity to read and understand the Agreement.

b. They understand the confidentiality obligations and agree to comply with them.

c. They are signing voluntarily and intend their electronic signature to signify acceptance of this Agreement.

d. The identifying information provided for this Agreement is accurate to the best of their knowledge.

e. They understand that unauthorized use or disclosure of Confidential Information may result in access restrictions and legal consequences under applicable law.

## SIGNATURES

**FOR CLASSENCE**

Legal entity/business name: [Full Legal Name of Classence's Contracting Entity]

Authorized representative: [Name]

Title: [Title]

Signature: [Authorized Signature, if required]

Date: [Date]

**THE RECIPIENT**

Full legal name: [Recipient Full Name]

Classence ID: [Classence ID]

Email address: [Verified Email Address]

Electronic signature: [Signature Image]

Date and time signed: [Timestamp]

Agreement reference: [Unique Agreement Reference]

**END OF AGREEMENT**

Note that everywhere there is a placeholder in the document should be filled by the admin on his own panel role account so that it takes effect once the document is sent to every member of the classence team in their respective document with no existing place holder
