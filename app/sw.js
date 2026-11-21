/* Proyecto Py: guarda la app para abrir sin internet; los datos se piden frescos y, si no hay red, se usan los guardados. */
const V="py-v9",SHELL=["fondo-claro.svg","fondo-oscuro.svg","lecciones.js","bienvenida.js","./","index.html","app.css","app.js","i18n.js","i18n2.js","importar.js","cuenta.js","vivo.js","config.js","manifest.webmanifest","icon.svg","icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
