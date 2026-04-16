# Bug Log
Use this format for every certificate-related bug fix:
## [DATE]
### Symptom
- What the user saw
### Root Cause
- Exact file
- Exact condition
- Why it happened
### Files Changed
- List of files edited
### Fix Applied
- Small description of the change
### Manual Test
1. Step
2. Step
3. Expected result
### Status
- fixed
- partial
- reverted
- needs follow-up
## 2026-04-16
### Symptom
- Success-page track buttons could lead users into the wrong certificate flow
- Paid unlock behavior was inconsistent
### Root Cause
- PaymentSuccessPage allowed track-button behavior to affect entitlement
- CertificatesPage mixed navigation and entitlement logic
### Files Changed
- PaymentSuccessPage.tsx
- CertificatesPage.tsx
### Fix Applied
- Removed unsafe local entitlement from success-page track buttons
- Kept track buttons for navigation only
### Manual Test
1. Pay for one track
2. Click a different success-page track button
3. Confirm navigation may change track section but must not unlock it
### Status
- partial

## 2026-04-16 (Risk #1 Fix)
### Symptom
- Visiting /success?track=healthcare (no payment) granted full local paid access to that track
- Stripe webhook delay or query failure also silently granted local paid access via URL param fallback
### Root Cause
- Exact file: src/components/PaymentSuccessPage.tsx
- Exact condition: three fallback branches — (1) Stripe session lookup returns no row, (2) Supabase query throws, (3) no session_id present at all — each called markTrackPurchasedLocally(t) using only the track URL param as authority
- Why it happened: original code treated the track URL param as sufficient evidence of purchase when server verification failed or was unavailable
### Files Changed
- src/components/PaymentSuccessPage.tsx
### Fix Applied
- Removed markTrackPurchasedLocally() from all three fallback branches (lines 42, 51, 59 pre-fix)
- In fallback paths, setVerifiedTrack(t) is kept only for display labeling (shows track name in UI)
- setUnverified(true) is now set in all non-server-verified paths so CertificatesPage handles unlock via its own Supabase query
- markTrackPurchasedLocally() now called only when certificate_purchases row is confirmed by stripe_session_id lookup
### Manual Test
1. Clear localStorage (Application > Storage > Clear site data)
2. Navigate to /success?track=healthcare (no session_id, no payment)
3. Confirm the "Enrollment pending confirmation" state is shown — not the "track is now unlocked" state
4. Click Go to Certificates Page
5. Confirm Healthcare track shows Start Free Module + Enroll — $39 (not unlocked)
6. Complete a real Stripe test payment for one track
7. Confirm success page shows "track is now unlocked" confirmation
8. Confirm CertificatesPage unlocks that track's modules 2–5
9. Confirm all other unpaid tracks still show Enroll — $39
### Status
- fixed

## 2026-04-16 (Risk #2 Fix)
### Symptom
- Clicking "Enroll" on the Agricultural Worksites certificate track returned a 400 error from the checkout edge function
- Stripe checkout session was never created for that track; users could not purchase it
### Root Cause
- Exact file: supabase/functions/create-cert-checkout/index.ts
- Exact condition: VALID_TRACK_IDS array contained the string "agriculture" — the frontend sends "agricultural-worksites" (the canonical ID from certificateData.ts and PROJECT_CONTEXT.md)
- Why it happened: ID was set incorrectly during initial function authorship; the validation guard then rejected every checkout attempt for that track
### Files Changed
- supabase/functions/create-cert-checkout/index.ts
### Fix Applied
- Changed "agriculture" to "agricultural-worksites" in VALID_TRACK_IDS (line 41)
- Redeployed edge function
### Manual Test
1. Navigate to /certificates and select the Agricultural Worksites track
2. Click Enroll — $39
3. Confirm the Stripe checkout page opens (no 400 error, no "Invalid trackId" error in browser console)
4. Complete the Stripe test payment
5. Confirm redirect to /success?track=agricultural-worksites&session_id=...
6. Confirm CertificatesPage unlocks modules 2–5 for Agricultural Worksites
7. Confirm all other tracks are unaffected
### Status
- fixed

## 2026-04-16 (Risk #3 Fix)
### Symptom
- A user who completed all 5 modules of a track (earning a certificate) but never paid would see modules 2–5 unlocked on return, because certificate_records were incorrectly elevating the "purchased" flag
- The purchased state was contaminated by completion data, violating the architecture rule: purchased = certificate_purchases only; completed = certificate_records only
### Root Cause
- Exact file: src/utils/certPersistence.ts
- Exact lines (before fix): inside the certRows loop, line 57 set `result.purchased[row.track_id] = true` while iterating certificate_records
- certificate_records represents earned completion certificates, not verified payment; writing purchased from it allowed completion to bypass the paywall
### Files Changed
- src/utils/certPersistence.ts
### Fix Applied
- Removed the single line `(result.purchased as Record<string, boolean>)[row.track_id] = true;` from the certificate_records loop
- The loop still runs and still populates result.certIds correctly
- purchased state is now set exclusively by the certificate_purchases loop
### Manual Test Steps (based on TEST_CHECKLIST_CERTIFICATES.md)
#### Section B — Verify free-only session cannot unlock paid modules
1. Open /certificates in a fresh browser session (no prior payment)
2. Choose any track and complete module 1 (free module) and pass the quiz
3. Return to /certificates — confirm modules 2–5 still show locked for that track (Enroll — $39 still visible)
#### Section E — Verify purchase correctly unlocks
4. Click Enroll — $39 on any track and complete a Stripe test payment (card: 4242 4242 4242 4242)
5. Return to /certificates — confirm all 5 modules are unlocked for the purchased track only
#### Section F — Wrong-track protection
6. Confirm that completing module 1 on Track B (without paying) does not unlock Track B modules 2–5
#### Regression
7. Confirm /certificates catalog still shows Start Free Module + Enroll — $39 on all unpaid tracks
8. Confirm no unexpected UI or styling changes on any page
### Status
- fixed

## 2026-04-16 (Incomplete diagnosis — superseded by entry below)
### Note
- The `purchased && completed && certId` fix was correct but insufficient
- The actual root cause was a separate, deeper issue: see next entry

## 2026-04-16 (Root Cause Fix — purchased:true persisting in localStorage, hiding Enroll button)
### Symptom
- Construction and Social Services showed "Start Free Module" but NOT "Enroll — $39"
- No "Download Certificate" button visible either
- The `purchased && completed && certId` guard (from the prior fix) correctly blocked Download, so the else branch ran
- But inside the else branch, "Enroll — $39" is inside `{!purchased && ...}` — it only renders when `purchased === false`
- `purchased` was `true` for these two tracks → Start Free Module rendered, Enroll did not
### Root Cause
- Exact file: src/components/CertificatesPage.tsx
- Exact JSX branch: lines 567–589 (pre-fix), `{!purchased && (<div>...<button>Enroll — $39</button>...</div>)}`
- Exact boolean condition: `purchased === true` for construction and social-services
- Why `purchased` was true: a previous development/testing session had written `purchased: { construction: true, 'social-services': true }` into localStorage via `saveLocalProgress()`. On each page load, `loadLocalProgress()` (line 59) reads this stale value immediately as initial state. `purchased` is `true` before Supabase runs.
- Why Start Free Module still appeared: it is rendered unconditionally inside the else branch — no `!purchased` guard on it. Only the Enroll block is wrapped in `{!purchased && ...}`.
- Why Supabase didn't fix it: the first `useEffect` only ran `setProgress` if `remote.moduleScores` or `remote.certIds` had entries — `remote.purchased` was empty (no DB records), so the `if` guard prevented the merge entirely. Stale localStorage `purchased: true` was never cleared.
- Why Construction and Social Services specifically: these were the only tracks that had `purchased: true` written to localStorage during prior development sessions. Other tracks did not.
### Files Changed
- src/components/CertificatesPage.tsx only
### Fix Applied
- Rewrote the first `useEffect` Supabase sync (lines 69–93)
- `purchased` is now always replaced with `remote.purchased` (Supabase is authoritative for purchase state)
- `moduleScores`, `completedModules`, and `certIds` are merged only when there is remote activity (unchanged behavior for those fields)
- `setProgress` now always runs after Supabase responds, not only when moduleScores/certIds are non-empty
- Stale `purchased: true` values in localStorage are cleared as soon as the Supabase response arrives
- Diagnostic console logs added for construction and social-services to expose `purchased`, `completed`, `certId`, `expandedTrack`, `showRecovery`, and which footer branch fires
### Manual Test Steps — Construction and Social Services
1. Open /certificates
2. Open browser DevTools > Console; look for [DIAG] construction and [DIAG] social-services lines
3. Confirm both log `purchased: false` and `footer branch: START+ENROLL`
4. Confirm Construction card shows both "Start Free Module" AND "Enroll — $39"
5. Confirm Social Services card shows both "Start Free Module" AND "Enroll — $39"
6. Confirm no "Download Certificate" button on either card
#### Section A — All Tracks
7. Confirm every other unpaid track also shows Start Free Module + Enroll — $39
#### Section B — Free Module
8. Open any unpaid track > Start Free Module; confirm modules 2–5 remain locked
#### Section E — Paid Unlock (regression)
9. If able to test payment: complete Stripe checkout for one track, return to /certificates
10. Confirm Download Certificate appears only on the purchased+completed track
11. Confirm all other tracks still show Start Free Module + Enroll — $39
#### Section G — Regression Check
12. Confirm styling/layout did not change unexpectedly
13. Confirm unrelated pages still work
### Status
- fixed

## 2026-04-16 (Stripe webhook silent skip — certificate_purchases never written)
### Symptom
- Real Stripe test payment completes successfully
- User lands on /certificates?track=education&enrolled=1 — track opens correctly
- Modules 2–5 remain locked; purchased is false
- `select * from certificate_purchases` returns zero rows immediately after payment
### Root Cause
- Exact file: supabase/functions/stripe-webhook/index.ts
- Exact condition: line 214 (pre-fix) — `if (trackId && sessionId)` guard silently skips the entire upsert when either value is missing
- Primary suspected cause: STRIPE_WEBHOOK_SECRET in deployed secrets does not match the signing secret for the registered Stripe webhook endpoint, so signature verification fails at line 171 and returns HTTP 400 before reaching the insert block — OR the webhook endpoint URL is not registered in the Stripe dashboard at all
- Secondary possibility: if signature passes, `meta.session_id` could be undefined if Stripe is not forwarding metadata (confirmed to be sent correctly by checkout function)
- No error was logged in either failure path — the webhook returned 400 silently (signature mismatch) or skipped the insert silently (missing sessionId)
### Files Changed
- supabase/functions/stripe-webhook/index.ts
### Fix Applied
- Added explicit `console.log` and `console.error` around the upsert (lines 214–228 post-fix):
  - Logs `trackId`, `sessionId`, and `stripe_session` values before the guard so missing values are visible
  - Logs "inserting certificate_purchases row" when the guard passes
  - Logs upsert SUCCESS or FAILED with the full Supabase error object
- Redeployed edge function
- This is a diagnostic fix only — no logic was changed
### Manual Test (3 steps)
1. In the Stripe Dashboard > Developers > Webhooks: confirm the webhook endpoint URL is exactly `<SUPABASE_URL>/functions/v1/stripe-webhook` and that the signing secret shown there matches what is stored as `STRIPE_WEBHOOK_SECRET` in Supabase edge function secrets
2. Complete a fresh Stripe test payment (card 4242 4242 4242 4242), then open Supabase Dashboard > Edge Functions > stripe-webhook > Logs — confirm you see `[Webhook] cert purchase path` log lines; if you see `Invalid signature` in the 400 response, the webhook secret is mismatched and must be re-synced
3. After confirming the webhook fires and logs "upsert SUCCESS", run `select * from certificate_purchases` in Supabase SQL Editor — confirm one row exists; then visit /certificates?track=<trackId>&enrolled=1 and confirm modules 2–5 are unlocked
### Status
- diagnostic fix deployed — root cause confirmation pending webhook log inspection

## 2026-04-16 (Post-Payment Unlock — modules 2–5 remain locked after successful payment)
### Symptom
- After paying for Education (or any track), user lands on /certificates?track=education&enrolled=1
- Correct track opens and scrolls into view
- All modules 2–5 remain locked — purchased is false
- Start Free Module shows, Enroll — $39 shows again as if not purchased
### Root Cause — Two compounding issues
#### Issue A: Supabase sync useEffect wipes purchase set by URL-params useEffect (race condition from previous session's fix)
- Two useEffects fire on mount simultaneously
- The URL-params useEffect calls lookupPurchaseBySessionAndTrack → applyVerifiedPurchase → sets purchased[education]=true
- The Supabase sync useEffect (from previous fix) was changed to ALWAYS call setProgress with purchased = remote.purchased
- If the Supabase sync useEffect resolves AFTER applyVerifiedPurchase has already run, and the DB has no certificate_purchases row yet (webhook timing), it sets purchased = {} — wiping the unlock
#### Issue B: Stripe webhook timing — certificate_purchases row may not exist yet when the first lookup fires
- Stripe webhook fires asynchronously after payment; can take 1–10 seconds
- lookupPurchaseBySessionAndTrack queries certificate_purchases immediately on page load
- If webhook has not yet written the row, data=null, lookup returns DENIED, user sees locked modules
- No retry was attempted — it showed showRecovery immediately and gave up
### Exact Files Changed
- src/components/CertificatesPage.tsx only
### Fix A — Supabase sync useEffect (lines 69–88)
- Restored merge behavior: purchased = { ...prev.purchased, ...remote.purchased } (merges on top, never replaces)
- Re-added early return if no remote activity — only runs setProgress when Supabase has real data
- This ensures applyVerifiedPurchase cannot be undone by the Supabase sync running later
### Fix B — lookupPurchaseBySessionAndTrack retry loop (lines 225–270)
- Converted to async function with a retry loop: up to 5 attempts, 1500ms between each (total max ~7.5s wait)
- On each attempt: queries certificate_purchases by session_id + track_id
- If found: calls applyVerifiedPurchase immediately and returns
- If not found after all attempts: shows showRecovery and opens track (existing fallback behavior preserved)
- Console logs report attempt number, query inputs, and result on every attempt
### Manual Test Steps
1. Open /certificates
2. Find Education track — confirm it shows Start Free Module + Enroll — $39 (not yet purchased)
3. Click Enroll — $39 — complete Stripe test checkout (card: 4242 4242 4242 4242)
4. Land on /success?track=education&session_id=cs_xxx
5. Click "Go to Certificates Page"
6. Land on /certificates?track=education&enrolled=1&session_id=cs_xxx
7. Open DevTools > Console — confirm [CertificatesPage] logs show:
   - selected track: education
   - app session id: (UUID)
   - purchase query input with matching session_id and track_id
   - attempt 1 or later: purchase query result with data.track_id = 'education'
   - unlock decision: GRANTED
8. Education card: confirm all 5 module dots are blue/unlocked, modules 2–5 are clickable
9. Construction card: confirm still shows Start Free Module + Enroll — $39 (not unlocked)
10. Social Services card: same — still locked
### Status
- fixed
