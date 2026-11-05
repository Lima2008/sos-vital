/* sw.js — service worker do SOS Vital
 * Guarda o app no celular para abrir rápido e funcionar SEM internet.
 * Páginas: tenta a internet primeiro (sempre a versão mais nova) e,
 * se não tiver sinal, usa a cópia guardada. Troque VERSAO ao publicar
 * mudanças para limpar a cópia antiga (evita "tela velha" no iPhone).
 */
const VERSAO = "sos-vital-v1-2026-11-05";
const ARQUIVOS = [
  "./",
  "guia-afogamento.html",
  "guia-avc.html",
  "guia-choque.html",
  "guia-convulsao.html",
  "guia-desmaio.html",
  "guia-engasgo.html",
  "guia-queimadura.html",
  "guia-rcp.html",
  "guia-sangramento.html",
  "guias-comum.html",
  "guias-critico.html",
  "guias.html",
  "impacto.html",
  "index.html",
  "perfil.html",
  "sos-convulsao.html",
  "sos-desmaio.html",
  "sos-engasgo.html",
  "sos-parada.html",
  "sos-sangramento.html",
  "sos.html",
  "estilo.css",
  "app.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "favicon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const ehPagina = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (ehPagina) {
    e.respondWith(
      fetch(req).then((r) => {
        const copia = r.clone();
        caches.open(VERSAO).then((c) => c.put(req, copia));
        return r;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((r) => r || fetch(req).then((resp) => {
      if (resp.ok || resp.type === "opaque") {
        const copia = resp.clone();
        caches.open(VERSAO).then((c) => c.put(req, copia));
      }
      return resp;
    }))
  );
});
