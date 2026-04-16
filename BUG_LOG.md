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
