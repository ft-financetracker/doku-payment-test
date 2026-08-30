/**
 * ============================================================
 * SPP PAYMENT DEMO — FRONTEND V2 AUTO SYNC
 * ============================================================
 *
 * Frontend tidak mengetahui:
 * - HMAC secret
 * - nominal yang boleh dibayar
 * - credential DOKU
 *
 * Browser hanya mengirim bill_id ke backend SPP Demo.
 * Backend yang menentukan nominal resmi dari Spreadsheet.
 *
 * ============================================================
 */


/* ============================================================
 * SECTION 1 — STATE & CONFIG
 * ============================================================
 */

const APP = {

  backendStorageKey:
    'spp_demo_backend_url',

  backendUrl:
    '',

  currentPage:
    'home',

  data:
    null
};


/* ============================================================
 * SECTION 2 — DOM
 * ============================================================
 */

const pageElement =
  document.getElementById(
    'page'
  );


const backendSetupElement =
  document.getElementById(
    'backendSetup'
  );


const backendUrlInput =
  document.getElementById(
    'backendUrl'
  );


const setupMessageElement =
  document.getElementById(
    'setupMessage'
  );


const saveBackendButton =
  document.getElementById(
    'saveBackendButton'
  );


const loadingOverlay =
  document.getElementById(
    'loadingOverlay'
  );


const loadingTextElement =
  document.getElementById(
    'loadingText'
  );


const toastElement =
  document.getElementById(
    'toast'
  );


/* ============================================================
 * SECTION 3 — START APP
 * ============================================================
 */

document.addEventListener(
  'DOMContentLoaded',
  startApp
);


async function startApp() {

  registerServiceWorker();


  bindNavigation();


  bindSetupButton();


  APP.backendUrl =
    normalizeBackendUrl(
      localStorage.getItem(
        APP.backendStorageKey
      ) || ''
    );


  if (!APP.backendUrl) {

    openBackendSetup();

    renderSetupPlaceholder();

    return;
  }


  await loadDashboard();
}


/* ============================================================
 * SECTION 4 — BACKEND SETUP
 * ============================================================
 */

function openBackendSetup() {

  backendUrlInput.value =
    APP.backendUrl || '';


  setupMessageElement.textContent =
    '';


  backendSetupElement.classList.remove(
    'hidden'
  );
}


function closeBackendSetup() {

  backendSetupElement.classList.add(
    'hidden'
  );
}


function bindSetupButton() {

  saveBackendButton.addEventListener(
    'click',
    async function () {

      const url =
        normalizeBackendUrl(
          backendUrlInput.value
        );


      if (!isValidAppsScriptExecUrl(url)) {

        setupMessageElement.textContent =
          'Gunakan URL Apps Script Web App yang berakhiran /exec.';

        return;
      }


      setupMessageElement.textContent =
        'Mengecek koneksi...';


      saveBackendButton.disabled =
        true;


      try {

        const response =
          await apiRequest(
            'ping',
            {},
            url
          );


        if (
          !response ||
          response.success !== true
        ) {

          throw new Error(
            response &&
            response.message
              ? response.message
              : 'Backend tidak merespons.'
          );
        }


        APP.backendUrl =
          url;


        localStorage.setItem(
          APP.backendStorageKey,
          url
        );


        closeBackendSetup();


        showToast(
          'Backend demo terhubung.'
        );


        await loadDashboard();

      } catch (error) {

        setupMessageElement.textContent =
          error.message ||
          'Tidak dapat menghubungi backend.';

      } finally {

        saveBackendButton.disabled =
          false;
      }
    }
  );
}


/* ============================================================
 * SECTION 5 — API JSONP
 * ============================================================
 */

function apiRequest(
  action,
  params,
  overrideUrl
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const apiUrl =
        normalizeBackendUrl(
          overrideUrl ||
          APP.backendUrl
        );


      if (!apiUrl) {

        reject(
          new Error(
            'Backend belum dihubungkan.'
          )
        );

        return;
      }


      const callbackName =
        '__sppDemoCallback_' +
        Date.now() +
        '_' +
        Math.random()
          .toString(36)
          .slice(2);


      const query =
        new URLSearchParams();


      query.set(
        'action',
        action
      );


      query.set(
        'callback',
        callbackName
      );


      query.set(
        '_',
        String(
          Date.now()
        )
      );


      Object.keys(
        params || {}
      ).forEach(
        function (key) {

          query.set(
            key,
            String(
              params[key]
            )
          );
        }
      );


      const script =
        document.createElement(
          'script'
        );


      const timeout =
        window.setTimeout(
          function () {

            cleanup();

            reject(
              new Error(
                'Backend tidak merespons. Coba lagi.'
              )
            );
          },
          15000
        );


      function cleanup() {

        window.clearTimeout(
          timeout
        );


        if (
          script.parentNode
        ) {

          script.parentNode.removeChild(
            script
          );
        }


        try {

          delete window[
            callbackName
          ];

        } catch (error) {

          window[
            callbackName
          ] = undefined;
        }
      }


      window[
        callbackName
      ] =
        function (
          payload
        ) {

          cleanup();


          if (
            payload &&
            payload.success === true
          ) {

            resolve(
              payload
            );

            return;
          }


          reject(
            new Error(
              payload &&
              payload.message
                ? payload.message
                : 'Request gagal.'
            )
          );
        };


      script.onerror =
        function () {

          cleanup();

          reject(
            new Error(
              'Tidak dapat menghubungi backend.'
            )
          );
        };


      script.src =
        apiUrl +
        '?' +
        query.toString();


      document.head.appendChild(
        script
      );
    }
  );
}


/* ============================================================
 * SECTION 6 — DASHBOARD DATA
 * ============================================================
 */

async function loadDashboard(
  options
) {

  const settings =
    options || {};


  if (
    settings.silent !== true
  ) {

    showLoading(
      'Memuat tagihan...'
    );
  }


  try {

    const response =
      await apiRequest(
        'getDashboard',
        {}
      );


    APP.data =
      response.data;


    renderCurrentPage();

  } catch (error) {

    renderConnectionError(
      error.message
    );

  } finally {

    if (
      settings.silent !== true
    ) {

      hideLoading();
    }
  }
}


/* ============================================================
 * SECTION 7 — CREATE PAYMENT
 * ============================================================
 */

async function createPayment(
  billId
) {

  showLoading(
    'Membuat link pembayaran...'
  );


  try {

    const response =
      await apiRequest(
        'createPayment',
        {
          bill_id:
            billId
        }
      );


    const paymentLink =
      response.data &&
      response.data.payment_link
        ? response.data.payment_link
        : '';


    if (!paymentLink) {

      throw new Error(
        'Payment link tidak ditemukan.'
      );
    }


    /*
     * Flow yang sudah dipilih:
     * redirect biasa ke Finance Tracker Pay.
     * Tidak menggunakan popup.
     */
    window.location.href =
      paymentLink;

  } catch (error) {

    hideLoading();


    showToast(
      error.message ||
      'Gagal membuat pembayaran.'
    );
  }
}


/* ============================================================
 * SECTION 8 — REFRESH STATUS
 * ============================================================
 */

async function refreshBillStatus(
  billId
) {

  showLoading(
    'Mengecek status...'
  );


  try {

    const response =
      await apiRequest(
        'refreshStatus',
        {
          bill_id:
            billId
        }
      );


    showToast(
      response.message ||
      'Status diperbarui.'
    );


    await loadDashboard(
      {
        silent:
          true
      }
    );

  } catch (error) {

    showToast(
      error.message ||
      'Gagal mengecek status.'
    );

  } finally {

    hideLoading();
  }
}


/* ============================================================
 * SECTION 9 — NAVIGATION
 * ============================================================
 */

function bindNavigation() {

  document
    .querySelectorAll(
      '.nav-item'
    )
    .forEach(
      function (button) {

        button.addEventListener(
          'click',
          function () {

            setPage(
              button.dataset.page
            );
          }
        );
      }
    );
}


function setPage(
  pageName
) {

  APP.currentPage =
    pageName;


  document
    .querySelectorAll(
      '.nav-item'
    )
    .forEach(
      function (button) {

        button.classList.toggle(
          'active',
          button.dataset.page ===
            pageName
        );
      }
    );


  renderCurrentPage();
}


function renderCurrentPage() {

  if (!APP.data) {

    return;
  }


  switch (
    APP.currentPage
  ) {

    case 'bills':

      renderBillsPage();

      break;


    case 'history':

      renderHistoryPage();

      break;


    case 'profile':

      renderProfilePage();

      break;


    case 'home':
    default:

      renderHomePage();

      break;
  }
}


/* ============================================================
 * SECTION 10 — HOME
 * ============================================================
 */

function renderHomePage() {

  const student =
    APP.data.student;


  const summary =
    APP.data.summary;


  const activeBills =
    APP.data.bills
      .filter(
        function (bill) {
          return (
            normalizeStatus(
              bill.local_status
            ) !==
            'PAID'
          );
        }
      );


  pageElement.innerHTML = `
    <section class="student-hero">

      <div class="student-top">

        <div>
          <p class="eyebrow" style="color:#B6FF00;">
            ASSALAMU'ALAIKUM
          </p>

          <h1 class="student-name">
            ${escapeHtml(student.name)}
          </h1>

          <p class="student-meta">
            ${escapeHtml(student.unit)}
            •
            ${escapeHtml(student.class_name)}
            •
            NIS ${escapeHtml(student.nis)}
          </p>
        </div>

        <div class="student-avatar">
          ${getInitials(student.name)}
        </div>

      </div>

      <div class="outstanding-box">

        <p class="outstanding-label">
          Total tagihan belum lunas
        </p>

        <div class="outstanding-amount">
          ${formatRupiah(summary.total_outstanding)}
        </div>

        <button
          class="hero-action"
          type="button"
          onclick="setPage('bills')"
        >
          Lihat Tagihan
        </button>

      </div>

    </section>


    <section class="summary-grid">

      <div class="summary-card">
        <span class="summary-value">
          ${summary.unpaid_count}
        </span>
        <span class="summary-label">
          Belum lunas
        </span>
      </div>

      <div class="summary-card">
        <span class="summary-value">
          ${summary.paid_count}
        </span>
        <span class="summary-label">
          Sudah lunas
        </span>
      </div>

      <div class="summary-card">
        <span class="summary-value">
          ${summary.total_bills}
        </span>
        <span class="summary-label">
          Total periode
        </span>
      </div>

    </section>


    <div class="section-head">
      <h2 class="section-title">
        Tagihan aktif
      </h2>

      <button
        class="text-button"
        type="button"
        onclick="setPage('bills')"
      >
        Lihat semua
      </button>
    </div>


    ${
      activeBills.length
        ? `
          <div class="bill-list">
            ${renderBillCard(activeBills[0], true)}
          </div>
        `
        : renderEmptyPaid()
    }


    <div class="notice">
      Ini adalah aplikasi <strong>Sandbox Demo</strong>.
      Nominal pembayaran dibaca dari backend Spreadsheet,
      bukan dari input browser.
    </div>
  `;


  bindRenderedBillButtons();
}


/* ============================================================
 * SECTION 11 — BILLS
 * ============================================================
 */

function renderBillsPage() {

  const bills =
    APP.data.bills;


  pageElement.innerHTML = `
    <p class="eyebrow">
      TAGIHAN SPP
    </p>

    <h1 class="page-title">
      Pembayaran sekolah
    </h1>

    <p class="page-copy">
      Pilih tagihan yang ingin dibayar.
      Setelah link dibuat, pembayaran diarahkan ke
      Finance Tracker Pay dan DOKU Sandbox.
    </p>

    <div class="section-head">
      <h2 class="section-title">
        Semua tagihan
      </h2>

      <button
        id="reloadBillsButton"
        class="text-button"
        type="button"
      >
        Muat ulang
      </button>
    </div>

    <div class="bill-list">
      ${bills.map(
        function (bill) {
          return renderBillCard(
            bill,
            false
          );
        }
      ).join('')}
    </div>
  `;


  bindRenderedBillButtons();


  document
    .getElementById(
      'reloadBillsButton'
    )
    .addEventListener(
      'click',
      function () {
        loadDashboard();
      }
    );
}


/* ============================================================
 * SECTION 12 — HISTORY
 * ============================================================
 */

function renderHistoryPage() {

  const paidBills =
    APP.data.bills
      .filter(
        function (bill) {
          return (
            normalizeStatus(
              bill.local_status
            ) ===
            'PAID'
          );
        }
      );


  pageElement.innerHTML = `
    <p class="eyebrow">
      RIWAYAT
    </p>

    <h1 class="page-title">
      Pembayaran selesai
    </h1>

    <p class="page-copy">
      Riwayat tagihan yang sudah berstatus lunas.
    </p>

    <div class="section-head">
      <h2 class="section-title">
        Transaksi
      </h2>
    </div>

    ${
      paidBills.length
        ? `
          <div class="bill-list">
            ${paidBills.map(
              function (bill) {
                return renderBillCard(
                  bill,
                  false
                );
              }
            ).join('')}
          </div>
        `
        : renderEmptyHistory()
    }
  `;


  bindRenderedBillButtons();
}


/* ============================================================
 * SECTION 13 — PROFILE
 * ============================================================
 */

function renderProfilePage() {

  const student =
    APP.data.student;


  pageElement.innerHTML = `
    <p class="eyebrow">
      PROFIL SANTRI
    </p>

    <h1 class="page-title">
      ${escapeHtml(student.name)}
    </h1>

    <p class="page-copy">
      Data pada halaman ini hanya data dummy untuk pengujian
      Payment Engine.
    </p>

    <div class="section-head">
      <h2 class="section-title">
        Informasi
      </h2>
    </div>

    <section class="info-card">

      ${renderInfoRow(
        'NIS',
        student.nis
      )}

      ${renderInfoRow(
        'Jenjang',
        student.unit
      )}

      ${renderInfoRow(
        'Kelas',
        student.class_name
      )}

      ${renderInfoRow(
        'Wali',
        student.guardian_name
      )}

      ${renderInfoRow(
        'WhatsApp',
        student.guardian_phone
      )}

      ${renderInfoRow(
        'Status',
        student.status
      )}

    </section>


    <div class="section-head">
      <h2 class="section-title">
        Koneksi
      </h2>
    </div>

    <section class="info-card">

      ${renderInfoRow(
        'Environment',
        'SANDBOX'
      )}

      ${renderInfoRow(
        'Backend',
        'Terhubung'
      )}

    </section>


    <div style="margin-top:14px;">

      <button
        id="changeBackendButton"
        class="secondary-button"
        type="button"
        style="width:100%;"
      >
        Ganti URL Backend
      </button>

    </div>
  `;


  document
    .getElementById(
      'changeBackendButton'
    )
    .addEventListener(
      'click',
      openBackendSetup
    );
}


/* ============================================================
 * SECTION 14 — BILL COMPONENT
 * ============================================================
 */

function renderBillCard(
  bill,
  primary
) {

  const status =
    normalizeStatus(
      bill.local_status
    );


  const statusMeta =
    getStatusMeta(
      status
    );


  const canPay =
    status !== 'PAID';


  const hasPaymentLink =
    Boolean(
      bill.payment_link
    ) &&
    (
      status ===
        'PAYMENT_CREATED' ||
      status ===
        'OPEN'
    );


  let primaryLabel =
    'Bayar Sekarang';


  if (hasPaymentLink) {

    primaryLabel =
      'Lanjutkan Pembayaran';

  } else if (
    status === 'EXPIRED'
  ) {

    primaryLabel =
      'Buat Link Baru';
  }


  return `
    <article
      class="bill-card ${
        primary
          ? 'is-primary'
          : ''
      }"
    >

      <div class="bill-head">

        <div>

          <h3 class="bill-period">
            ${escapeHtml(bill.period)}
          </h3>

          <p class="bill-description">
            ${escapeHtml(bill.description)}
          </p>

        </div>

        <span class="status-chip ${statusMeta.className}">
          ${statusMeta.label}
        </span>

      </div>

      <div class="bill-amount">
        ${formatRupiah(bill.amount)}
      </div>

      <p class="bill-due">
        Jatuh tempo:
        ${formatDateId(bill.due_date)}
      </p>

      ${
        status === 'PAID'
          ? `
            <p class="bill-due">
              Lunas:
              ${
                bill.paid_at
                  ? formatDateTimeId(
                      bill.paid_at
                    )
                  : '—'
              }
            </p>
          `
          : ''
      }

      ${
        canPay
          ? `
            <div class="bill-actions">

              <button
                class="primary-button js-pay-button"
                type="button"
                data-bill-id="${escapeHtml(bill.bill_id)}"
              >
                ${primaryLabel}
              </button>


            </div>
          `
          : ''
      }

    </article>
  `;
}


function bindRenderedBillButtons() {

  document
    .querySelectorAll(
      '.js-pay-button'
    )
    .forEach(
      function (button) {

        button.addEventListener(
          'click',
          function () {

            const billId =
              button.dataset.billId;


            const bill =
              APP.data.bills.find(
                function (item) {
                  return (
                    item.bill_id ===
                    billId
                  );
                }
              );


            if (
              bill &&
              bill.payment_link &&
              (
                normalizeStatus(
                  bill.local_status
                ) ===
                  'PAYMENT_CREATED' ||
                normalizeStatus(
                  bill.local_status
                ) ===
                  'OPEN'
              )
            ) {

              window.location.href =
                bill.payment_link;

              return;
            }


            createPayment(
              billId
            );
          }
        );
      }
    );
}


/* ============================================================
 * SECTION 15 — EMPTY / ERROR
 * ============================================================
 */

function renderSetupPlaceholder() {

  pageElement.innerHTML = `
    <div class="empty-state" style="margin-top:40px;">

      <div class="empty-icon">
        ⚙
      </div>

      <h3>
        Backend belum dihubungkan
      </h3>

      <p>
        Selesaikan setup backend Apps Script untuk membuka
        dashboard SPP Demo.
      </p>

    </div>
  `;
}


function renderConnectionError(
  message
) {

  pageElement.innerHTML = `
    <div class="empty-state" style="margin-top:40px;">

      <div
        class="empty-icon"
        style="
          background:#FFF0EE;
          color:#B42318;
        "
      >
        !
      </div>

      <h3>
        Backend tidak dapat dimuat
      </h3>

      <p>
        ${escapeHtml(
          message ||
          'Periksa URL backend.'
        )}
      </p>

      <div style="margin-top:16px;">

        <button
          id="openSetupFromError"
          class="primary-button"
          type="button"
        >
          Periksa Backend
        </button>

      </div>

    </div>
  `;


  document
    .getElementById(
      'openSetupFromError'
    )
    .addEventListener(
      'click',
      openBackendSetup
    );
}


function renderEmptyPaid() {

  return `
    <div class="empty-state">

      <div class="empty-icon">
        ✓
      </div>

      <h3>
        Semua tagihan lunas
      </h3>

      <p>
        Tidak ada tagihan aktif saat ini.
      </p>

    </div>
  `;
}


function renderEmptyHistory() {

  return `
    <div class="empty-state">

      <div class="empty-icon">
        ↻
      </div>

      <h3>
        Belum ada riwayat
      </h3>

      <p>
        Pembayaran yang sudah lunas akan muncul di sini.
      </p>

    </div>
  `;
}


/* ============================================================
 * SECTION 16 — UI HELPERS
 * ============================================================
 */

function showLoading(
  text
) {

  loadingTextElement.textContent =
    text || 'Memuat...';


  loadingOverlay.classList.remove(
    'hidden'
  );
}


function hideLoading() {

  loadingOverlay.classList.add(
    'hidden'
  );
}


let toastTimer;


function showToast(
  message
) {

  window.clearTimeout(
    toastTimer
  );


  toastElement.textContent =
    message;


  toastElement.classList.remove(
    'hidden'
  );


  toastTimer =
    window.setTimeout(
      function () {

        toastElement.classList.add(
          'hidden'
        );
      },
      3200
    );
}


function renderInfoRow(
  label,
  value
) {

  return `
    <div class="info-row">
      <span class="info-label">
        ${escapeHtml(label)}
      </span>
      <span class="info-value">
        ${escapeHtml(value || '—')}
      </span>
    </div>
  `;
}


/* ============================================================
 * SECTION 17 — FORMATTERS
 * ============================================================
 */

function formatRupiah(
  value
) {

  return new Intl.NumberFormat(
    'id-ID',
    {
      style:
        'currency',
      currency:
        'IDR',
      maximumFractionDigits:
        0
    }
  ).format(
    Number(
      value || 0
    )
  );
}


function formatDateId(
  value
) {

  if (!value) {

    return '—';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );
  }


  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day:
        '2-digit',
      month:
        'long',
      year:
        'numeric'
    }
  ).format(
    date
  );
}


function formatDateTimeId(
  value
) {

  if (!value) {

    return '—';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );
  }


  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day:
        '2-digit',
      month:
        'short',
      year:
        'numeric',
      hour:
        '2-digit',
      minute:
        '2-digit'
    }
  ).format(
    date
  );
}


function normalizeStatus(
  value
) {

  return String(
    value || 'UNPAID'
  ).toUpperCase();
}


function getStatusMeta(
  status
) {

  const map = {

    PAID: {
      label:
        'LUNAS',
      className:
        'paid'
    },

    PAYMENT_CREATED: {
      label:
        'MENUNGGU BAYAR',
      className:
        'pending'
    },

    OPEN: {
      label:
        'MENUNGGU BAYAR',
      className:
        'pending'
    },

    EXPIRED: {
      label:
        'KADALUWARSA',
      className:
        'expired'
    },

    UNPAID: {
      label:
        'BELUM LUNAS',
      className:
        'unpaid'
    }
  };


  return (
    map[
      status
    ] ||
    map.UNPAID
  );
}


function getInitials(
  name
) {

  return String(
    name || 'S'
  )
    .split(
      /\s+/
    )
    .filter(
      Boolean
    )
    .slice(
      0,
      2
    )
    .map(
      function (part) {
        return part[0];
      }
    )
    .join(
      ''
    )
    .toUpperCase();
}


function normalizeBackendUrl(
  value
) {

  return String(
    value || ''
  )
    .trim()
    .replace(
      /\/+$/,
      ''
    );
}


function isValidAppsScriptExecUrl(
  value
) {

  return (
    /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(
      value
    )
  );
}


function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    );
}


/* ============================================================
 * SECTION 18 — RETURN / VISIBILITY
 * ============================================================
 */

/*
 * Saat user kembali dari tab/payment flow,
 * dashboard dimuat ulang supaya status terbaru terlihat.
 */
document.addEventListener(
  'visibilitychange',
  function () {

    if (
      document.visibilityState ===
        'visible' &&
      APP.backendUrl &&
      APP.data
    ) {

      loadDashboard(
        {
          silent:
            true
        }
      );
    }
  }
);


/* ============================================================
 * SECTION 19 — AUTO REFRESH DASHBOARD
 * ============================================================
 */

/*
 * Backend SPP Auto Sync setiap 1 menit.
 * Frontend memuat ulang dashboard setiap 30 detik
 * selama aplikasi sedang terlihat.
 *
 * Browser TIDAK mengecek DOKU secara langsung.
 */
window.setInterval(
  function () {

    if (
      document.visibilityState ===
        'visible' &&
      APP.backendUrl &&
      APP.data
    ) {

      loadDashboard(
        {
          silent:
            true
        }
      );
    }
  },
  30000
);


/* ============================================================
 * SECTION 20 — SERVICE WORKER
 * ============================================================
 */

function registerServiceWorker() {

  if (
    'serviceWorker' in navigator
  ) {

    window.addEventListener(
      'load',
      function () {

        navigator.serviceWorker
          .register(
            './sw.js'
          )
          .catch(
            function (error) {

              console.warn(
                'Service Worker:',
                error
              );
            }
          );
      }
    );
  }
}
