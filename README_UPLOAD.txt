FINANCE TRACKER PAY — PWA FRONTEND V1
=======================================

TUJUAN
- Redesign frontend payment agar konsisten dengan branding Finance Tracker.
- Menambahkan PWA installability tanpa mengubah flow keamanan backend V5.

FILE YANG DIUPLOAD KE ROOT REPO doku-payment-test
- index.html
- result.html
- manifest.webmanifest
- sw.js
- offline.html
- assets/ft-pay-mark.svg
- assets/ft-pay-logo.svg
- icons/icon-192.png
- icons/icon-512.png
- icons/maskable-512.png
- icons/apple-touch-icon.png
- icons/favicon-64.png

LOCK YANG TIDAK DIUBAH
- API_URL Apps Script tetap sama.
- Secure token 128 hex tetap sama.
- getSecurePayment tetap read-only.
- createSecurePayment tetap token-based.
- Nominal tetap dari backend.
- Token tetap dibersihkan dari address bar dan disimpan di sessionStorage.
- result.html tetap membaca status lokal via getSecurePayment.
- Polling result tetap 12 x 5 detik.
- Code.gs V5 tidak perlu diganti untuk redesign ini.

PWA
- Manifest: manifest.webmanifest
- Service worker: sw.js
- display: standalone
- theme/background: #0B132B
- FT Pay icons: 192, 512, maskable 512, Apple 180
- Service worker TIDAK menyimpan URL yang mengandung ?token= atau ?invoice=.

CATATAN TEST
1. Upload seluruh file/folder di atas.
2. Tunggu GitHub Pages update.
3. Hard refresh sekali.
4. Buat secure payment link baru dari backend V5.
5. Buka link #token=... dan test flow ke DOKU Sandbox.
6. Test install PWA dari browser yang mendukung.

BRANDING
Deep Navy     #0B132B
Royal Blue    #1E3A8A
White         #FFFFFF
Highlight     #B6FF00
Dark Gray     #1A1F2B
