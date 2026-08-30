/**
 * ============================================================
 * SPP PAYMENT DEMO — SERVICE WORKER V2.1 RECOVERY
 * ============================================================
 */

const CACHE_NAME =
  'spp-payment-demo-v2-1-recovery';


const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];


self.addEventListener(
  'install',
  function (event) {

    event.waitUntil(
      caches
        .open(
          CACHE_NAME
        )
        .then(
          function (cache) {
            return cache.addAll(
              APP_SHELL
            );
          }
        )
    );


    self.skipWaiting();
  }
);


self.addEventListener(
  'activate',
  function (event) {

    event.waitUntil(
      caches
        .keys()
        .then(
          function (keys) {

            return Promise.all(
              keys
                .filter(
                  function (key) {
                    return (
                      key !==
                      CACHE_NAME
                    );
                  }
                )
                .map(
                  function (key) {
                    return caches.delete(
                      key
                    );
                  }
                )
            );
          }
        )
    );


    self.clients.claim();
  }
);


self.addEventListener(
  'fetch',
  function (event) {

    const request =
      event.request;


    if (
      request.method !== 'GET'
    ) {

      return;
    }


    const url =
      new URL(
        request.url
      );


    /*
     * Request Apps Script / Payment Engine
     * jangan dimasukkan cache PWA.
     */
    if (
      url.hostname ===
        'script.google.com'
    ) {

      return;
    }


    event.respondWith(
      fetch(
        request
      )
        .then(
          function (response) {

            const copy =
              response.clone();


            caches
              .open(
                CACHE_NAME
              )
              .then(
                function (cache) {
                  cache.put(
                    request,
                    copy
                  );
                }
              );


            return response;
          }
        )
        .catch(
          function () {

            return caches
              .match(
                request
              )
              .then(
                function (cached) {

                  return (
                    cached ||
                    caches.match(
                      './offline.html'
                    )
                  );
                }
              );
          }
        )
    );
  }
);
