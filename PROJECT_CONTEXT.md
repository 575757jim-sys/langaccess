# LangAccess Project Context
## Stack
- Frontend: React + Vite
- Styling: existing current styling only
- Backend/data: Supabase
- Payments: Stripe
- Goal: stable certificate purchase, unlock, and resume flows without regressions
## Core Rules
1. URL params may control navigation only, not paid entitlement.
2. CertificatesPage may open a track from `track=...`, but must never unlock paid modules from URL params alone.
3. Paid access must come only from verified purchase data.
4. Success page track buttons are navigation-only.
5. Unpaid tracks must always show:
   - Start Free Module
   - Enroll — $39
6. Do not remove or hide Enroll buttons from unpaid tracks.
7. Do not redesign the UI while fixing logic bugs.
8. Do not touch unrelated pages or features when fixing certificate bugs.
9. Use the exact canonical track IDs everywhere.
## Canonical Track IDs
- healthcare
- education
- construction
- social-services
- mental-health
- property-management
- warehouse
- hospitality
- agricultural-worksites
- community-outreach
## Architecture Rules
- "What track should open?" is separate from "What track is paid?"
- Navigation comes from UI selection or URL params.
- Unlocking comes only from verified purchase records.
- Never mark a track purchased locally just because a button was clicked.
## Debugging Rules
- Before editing, explain the bug source, exact file, and condition causing it.
- Propose the smallest safe fix.
- Do not change CSS unless the bug is visual.
- After each fix, provide a manual test checklist.
## Never List
- Never grant paid access from `enrolled=1` alone.
- Never grant paid access from success-page button clicks.
- Never invent alternate track IDs.
- Never fix one certificate bug by changing unrelated app features.
