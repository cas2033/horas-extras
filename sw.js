const CACHE='horas-extras-offline-v7';
const SHELL=['./','./index.html','./manifest.json'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  const request=event.request;
  const url=new URL(request.url);

  if(request.mode==='navigate'){
    event.respondWith(
      caches.match('./index.html').then(cached=>{
        const update=fetch(request).then(response=>{
          if(response && response.ok){
            caches.open(CACHE).then(cache=>cache.put('./index.html',response.clone()));
          }
          return response;
        }).catch(()=>null);

        if(cached){
          event.waitUntil(update);
          return cached;
        }
        return update.then(response=>response || caches.match('./index.html'));
      })
    );
    return;
  }

  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(request).then(cached=>{
        if(cached) return cached;
        return fetch(request).then(response=>{
          if(response && response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(request,copy));
          }
          return response;
        });
      })
    );
  }
});
