const CACHE='horas-extras-offline-v14';
const SHELL=['./','./index.html','./manifest.json'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(SHELL.map(url=>fetch(new Request(url,{cache:'reload'})).then(response=>{if(!response.ok)throw new Error('Falha ao atualizar '+url);return cache.put(url,response)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('horas-extras-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const request=event.request,url=new URL(request.url);
 if(request.mode==='navigate'){
  event.respondWith(fetch(new Request(request,{cache:'no-cache'})).then(async response=>{
   if(!response.ok)throw new Error('Pagina indisponivel');
   const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());return response;
  }).catch(async()=>{const cache=await caches.open(CACHE);return (await cache.match('./index.html'))||Response.error()}));return;
 }
 if(url.origin===self.location.origin){event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request).then(async response=>{if(response.ok)await cache.put(request,response.clone());return response}))) }
});