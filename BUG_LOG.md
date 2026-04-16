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
