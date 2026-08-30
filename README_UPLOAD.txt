FINANCE TRACKER PAY — PWA V2

UPDATE V2:
- Desktop layout upgraded to premium two-column responsive layout.
- Tablet/mobile remain adaptive and single-column.
- Result page uses the same Finance Tracker visual system.
- Offline page updated to matching layout.
- Manifest orientation changed to any for desktop/tablet/mobile flexibility.
- Service worker cache bumped to ft-pay-shell-v2.

PAYMENT LOGIC LOCK:
- getSecurePayment unchanged
- createSecurePayment unchanged
- secure token handling unchanged
- token removal from URL unchanged
- sessionStorage unchanged
- amount remains server-side
- result polling remains 12 x 5 seconds
- Apps Script endpoint unchanged

UPLOAD TO REPO ROOT:
Replace index.html and result.html.
Replace offline.html, manifest.webmanifest, sw.js.
Keep assets/ and icons/ from this bundle.

Do NOT upload the zip itself as the site. Extract first.
