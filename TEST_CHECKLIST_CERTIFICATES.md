# Certificate Test Checklist
Run this checklist after every certificate-flow change.
## A. Catalog Page
1. Open /certificates
2. Confirm every unpaid track shows:
   - Start Free Module
   - Enroll — $39
3. Confirm no paid button is missing on locked tracks
## B. Free Module
1. Open an unpaid track
2. Confirm only module 1 is available
3. Confirm modules 2–5 remain locked
## C. Checkout
1. Click Enroll on one chosen track
2. Complete payment
3. Confirm success page loads without errors
## D. Success Page
1. Confirm success page does not itself grant paid access
2. Confirm track buttons are navigation-only
3. Confirm Go to Certificates Page works
## E. Paid Unlock
1. Go to the purchased track section
2. Confirm all 5 modules unlock for the paid track
3. Confirm unpaid tracks remain locked except module 1
## F. Wrong-Track Protection
1. Pay for Track A
2. Navigate to Track B
3. Confirm Track B stays locked unless separately purchased
## G. Regression Check
1. Confirm styling/layout did not change unexpectedly
2. Confirm unrelated pages still work
3. Confirm Enroll buttons still appear on unpaid tracks
