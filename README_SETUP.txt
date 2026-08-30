============================================================
SPP PAYMENT DEMO V1 — QUICK SETUP
============================================================

TUJUAN
------
Aplikasi dummy SPP ini dibuat untuk membuktikan:

SPP Demo
→ Backend Apps Script
→ Finance Tracker Payment Engine
→ Finance Tracker Pay
→ DOKU Sandbox
→ PAID / EXPIRED

Payment Engine yang sudah LOCK TIDAK perlu diubah.


============================================================
STEP 1 — BUAT PROJECT APPS SCRIPT BARU
============================================================

1. Buka script.google.com
2. New Project
3. Nama contoh:
   SPP Payment Demo
4. Buka file:

   apps-script/Code.gs_FULL_SPP_DEMO_V1.txt

5. Ctrl+A pada Code.gs
6. Paste FULL file
7. Save


============================================================
STEP 2 — PASANG SECRET CLIENT
============================================================

Karena ini masih DEMO, kita sementara memakai client:

CLIENT_ID  : FINANCE_TRACKER
SOURCE_APP : FINANCE_TRACKER

Di project PAYMENT ENGINE:

Project Settings
→ Script Properties
→ cari:

PAYMENT_INTERNAL_SECRET_FINANCE_TRACKER

Copy NILAINYA.

Lalu di project SPP Payment Demo:

Project Settings
→ Script Properties
→ Add script property

Property:
SPP_PAYMENT_CLIENT_SECRET

Value:
[paste nilai secret tadi]

JANGAN menulis secret di Code.gs / GitHub.


============================================================
STEP 3 — BUAT DATABASE DEMO
============================================================

Di Apps Script SPP Demo jalankan:

setupSppPaymentDemoV1

Function ini otomatis membuat Spreadsheet baru:

SPP Payment Demo Database

Isi:
- STUDENTS
- BILLS
- ACTIVITY_LOG

Data demo:
- Ahmad Fawwaz
- SMP VIII A
- Juli 2026 = PAID sample
- Agustus 2026 = UNPAID Rp1.700.000
- September 2026 = UNPAID Rp1.700.000


============================================================
STEP 4 — PREFLIGHT
============================================================

Jalankan:

preflightSppPaymentDemoV1

Target:

RESULT: PASS


============================================================
STEP 5 — TEST BACKEND PAYMENT
============================================================

Jalankan:

testSppDemoCreatePaymentV1

Target:
success = true
payment_link tersedia

Tagihan Agustus di Spreadsheet akan berubah:

UNPAID
→ PAYMENT_CREATED


============================================================
STEP 6 — DEPLOY BACKEND
============================================================

Deploy
→ New deployment
→ Web app

Execute as:
Me

Who has access:
Anyone

Deploy

Copy URL yang berakhiran:

/exec


============================================================
STEP 7 — UPLOAD FRONTEND KE GITHUB
============================================================

Buat repo contoh:

spp-payment-demo

Upload SEMUA isi folder:

github/

JANGAN upload folder github sebagai satu folder tambahan.
index.html harus ada di root repo.

Aktifkan:
Settings
→ Pages
→ Deploy from branch
→ main / root


============================================================
STEP 8 — HUBUNGKAN PWA KE BACKEND
============================================================

Buka GitHub Pages.

Saat pertama kali dibuka akan muncul:

"Hubungkan backend demo"

Paste URL Apps Script /exec dari STEP 6.

Klik:

Simpan & Tes Koneksi

Kalau berhasil:
Dashboard SPP Demo langsung tampil.


============================================================
STEP 9 — TEST PAYMENT END-TO-END
============================================================

1. Buka Tagihan
2. Pilih Agustus 2026
3. Klik Bayar Sekarang
4. Backend membuat PAYMENT_REQUEST
5. Browser diarahkan ke Finance Tracker Pay
6. Klik Bayar dengan DOKU
7. Selesaikan payment Sandbox
8. Kembali ke SPP Demo
9. Klik Cek Status

Target:

PAYMENT_CREATED
→ PAID

Riwayat pembayaran akan ikut bertambah.


============================================================
RESET TEST
============================================================

Kalau ingin mengulang dari awal, jalankan:

resetSppDemoTransactionsV1

Function ini:
- mempertahankan data santri
- Juli tetap PAID sample
- Agustus & September kembali UNPAID
- membuat Run ID baru agar reference Payment Engine tidak bentrok


============================================================
CATATAN KEAMANAN DEMO
============================================================

Browser TIDAK mengirim nominal.

Browser hanya mengirim:

bill_id

Backend membaca:
- nama santri
- periode
- nominal
- reference

dari Spreadsheet.

Secret Payment Engine hanya ada di Script Properties backend.


============================================================
STATUS
============================================================

Payment Engine       : LOCK
DOKU Checkout        : Redirect
Environment          : Sandbox
PWA                   : Yes
Database demo         : Auto-created
Nominal browser       : No
Payment status sync   : Manual "Cek Status" + reload
============================================================
