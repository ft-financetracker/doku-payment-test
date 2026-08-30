const CACHE_NAME='ft-pay-shell-v1';
const APP_SHELL=[
  './','./index.html','./result.html','./offline.html','./manifest.webmanifest',
  './assets/ft-pay-mark.svg','./assets/ft-pay-logo.svg',
  './icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-64.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  // Never cache capability tokens or legacy invoice parameters.
  if(url.searchParams.has('token')||url.searchParams.has('invoice')){
    event.respondWith(fetch(request).catch(()=>caches.match('./offline.html')));
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(url.pathname.endsWith('result.html')?'./result.html':'./index.html',copy));
          return response;
        })
        .catch(()=>caches.match(url.pathname.endsWith('result.html')?'./result.html':'./index.html').then(r=>r||caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
      return response;
    }))
  );
});
