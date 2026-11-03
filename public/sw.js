const CACHE='pasor-express-v4';
const ASSETS=['/offline.html','/styles.css','/refinements.css','/ui.js','/scene.js','/assets/hero-scene.svg','/assets/jakarta-latin.woff2','/icons/icon-192.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('pasor-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){event.respondWith(fetch(request).catch(async()=>await caches.match('/offline.html')));return;}
 const publicAsset=/^\/(?:assets|icons|vendor\/three)\//.test(url.pathname)||/^\/[a-z-]+\.(?:css|js)$/.test(url.pathname);
 if(!publicAsset||url.pathname==='/sw.js')return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}catch{return await cache.match(request)||Response.error();}})());
});
