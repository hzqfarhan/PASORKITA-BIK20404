import { readFile,writeFile } from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
const expression=source.match(/const seed = (\[[\s\S]*?\n  \]);/)?.[1];
if(!expression)throw new Error('Original sample catalogue missing.');
const data=vm.runInNewContext('('+expression+')',Object.create(null),{timeout:1000});
await writeFile(new URL('../database/sample-products.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
await writeFile(new URL('../public/sw.js',import.meta.url),`const CACHE='pasor-express-v4';
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
`);
await writeFile(new URL('../public/offline.html',import.meta.url),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A little offline · Pasor Kita</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/refinements.css"></head><body><main class="branded-error"><img src="/assets/hero-scene.svg" alt="Pasor Kita shopping bag"><h1>A little offline.<br>Still a little local.</h1><p>Reconnect to browse current stock, manage your account and arrange your next pickup.</p><a class="primary-button" href="/">Try again ↗</a></main></body></html>`);
