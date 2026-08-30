SPP PAYMENT DEMO V2.1 — FRONTEND RECOVERY
==========================================

TUJUAN
------
Mengembalikan frontend ke struktur V1 yang sudah terbukti stabil,
sementara Backend V2 Auto Sync tetap dipakai.

YANG DIUBAH
-----------
- app.js kembali memakai struktur V1 stable
- tombol Cek Status hanya disembunyikan dengan CSS
- JS tombol tidak dihapus
- service worker cache diganti ke:
  spp-payment-demo-v2-1-recovery

YANG TIDAK DIUBAH
-----------------
- Apps Script Backend V2
- Trigger Auto Sync
- Payment Engine
- FT Pay
- DOKU
- Spreadsheet

CARA PASANG
-----------
HANYA UPDATE GITHUB.

Tiban isi folder github/ ke repo SPP Demo:

index.html
offline.html
manifest.webmanifest
sw.js
css/
js/
icons/

JANGAN ubah Code.gs lagi.

Setelah GitHub Pages hijau:
1. Tutup PWA.
2. Buka ulang.
3. Jika masih membawa cache lama, buka dari browser dan hard refresh.
