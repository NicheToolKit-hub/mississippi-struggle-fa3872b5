# Mississippi Struggle — Submissions, Admin Approval, Profiles & Media

## Goal
Turn the current static site into one where the public can submit prisoner profiles and content, everything is held for admin review, and approved items appear publicly. Add the new logo, a podcast/video page (uploads + embeds), expanded donation options, and the new contact email.

## 1. Branding — new logo + contact email
- Upload the gold "MS" shield as a CDN asset and create a transparent-background version for the light header (the source sits on black). Replace `src/assets/logo.png` usage in `site-header.tsx` and `site-footer.tsx`.
- Replace `hello@msstruggle.org` and the placeholder phone/address-adjacent email everywhere with **Mississippi.Struggle@gmail.com** (footer, donate receipt copy, new contact form).

## 2. Connect Lovable Cloud (backend)
Enables the database, admin login, file storage, and approval workflow. After enabling:
- **Auth**: email/password + Google sign-in. Public visitors do NOT need an account to submit (anonymous public forms). A small set of admins sign in to review.
- **Roles**: `app_role` enum (`admin`, `moderator`, `user`) + `user_roles` table + `has_role()` security-definer function (never store roles on profiles). First admin is granted manually.

## 3. Database schema (with GRANTs + RLS)
- `submissions` — unified intake for all public content. Columns: id, type (`profile | art | book | certificate | accomplishment | media | idea | story`), status (`pending | approved | rejected`), title, body, person_name, facility, submitter_name, submitter_email, media_url(s), external_embed_url, created_at, reviewed_by, review_note.
- `prisoner_profiles` — approved, published profiles: name, facility, bio, photo_url, accomplishments[], books[], featured. Linked records (art, certificates) reference a profile.
- `profile_items` — individual showcase items tied to a profile (kind = art/book/certificate/accomplishment, title, description, media_url, year).
- `media_posts` — approved podcast/video entries: title, description, kind (`podcast | video`), source (`upload | embed`), file_url or embed_url, published_at.
- `volunteer_offers` — non-monetary donate form: offer_type (`time | supplies | networking | advertising | links | ideas | other`), name, email, details.
- `contact_messages` — general contact form submissions.
- RLS: anon can `INSERT` into intake tables (submissions, volunteer_offers, contact_messages) but NOT read them; anon can `SELECT` only approved/published rows in `prisoner_profiles`, `profile_items`, `media_posts`. Admins (via `has_role`) can do everything. Every table gets explicit GRANTs.

## 4. Storage
- Private bucket `submission-uploads` (raw public uploads: art images, certificate scans, audio/video) — readable by admins.
- Public bucket `published-media` (approved photos, audio, video) for the live site.
- On approval, the relevant file is referenced/copied into published media.

## 5. Server functions (createServerFn)
- Public (no auth): `createSubmission`, `submitVolunteerOffer`, `submitContact`, plus public reads `listProfiles`, `getProfile`, `listMediaPosts` (publishable-key client, approved rows only).
- Admin (requireSupabaseAuth + has_role check): `listSubmissions`, `approveSubmission` (promotes into the public tables), `rejectSubmission`, `createMediaPost`, `toggleFeatured`, `deleteContent`.
- Wire `attachSupabaseAuth` into `src/start.ts`.

## 6. Pages / routes
- `/profiles` — grid of approved prisoner profiles (photo, name, facility, highlights).
- `/profiles/$id` — full profile: bio, accomplishments, books authored, art gallery, certificates, exemplary-behavior notes.
- `/submit` — public submission form (choose type: profile, art, book, certificate, accomplishment, story, idea) with file upload; shows "submitted for review" confirmation.
- `/podcast` — podcast & video hub: list of approved episodes/videos (embedded players for YouTube/Spotify/Apple links + native player for uploaded files) and a public "submit your episode/video" form (upload or paste a link).
- `/contact` — contact form + Mississippi.Struggle@gmail.com.
- `/donate` — add a "More ways to give" section: donate **time, supplies, networking, advertising, links, ideas, support** with a form writing to `volunteer_offers`.
- `/_authenticated/admin` — admin dashboard: tabs for pending submissions, volunteer offers, contact messages, media posts; approve/reject with a note, feature toggle, and create/manage media posts.
- `/auth` — sign-in page (email/password + Google) for admins.
- Add Profiles, Podcast, Contact to the header/footer nav. Update `sitemap[.]xml.ts`.

## 7. Approval flow
Public submit → row in `submissions` (status `pending`, files in private bucket) → admin reviews in dashboard → **Approve** creates the published record (profile/item/media_post) and exposes the media; **Reject** stores a note. Nothing is publicly visible until approved.

## 8. Security & validation
- Zod validation on every form (client + server), length caps, email format, file-type/size checks on uploads.
- Anon insert-only RLS; reads restricted to approved rows; admin gates via `has_role`.
- No PII (submitter email) ever returned on public reads.

## Technical notes
- TanStack Start: server functions in `*.functions.ts` (client-safe path), admin-only routes under `src/routes/_authenticated/`, public reads via publishable-key client with `TO anon` SELECT policies.
- Donation payments stay as the existing demo UI unless you later ask to enable real payments.
- Admin account: after build, you sign up at `/auth`, then I grant your account the `admin` role.

## Out of scope (unless requested)
- Real money processing on donations.
- Automated email notifications to admins on new submissions (can add with Lovable Email later).
