var VERSAO = "lavra-v2";
var BASE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "diagramas.html",
  "assets/lavraLogoBranca.svg",
  "assets/lavraLogotipoBranca.svg",
  "assets/lavraLogotipoVerde.svg",
  "assets/lavraLogoVerde.svg",
  "assets/fotos/agricultor.webp",
  "assets/fotos/paisagem.webp",
  "assets/fotos/hortalicas.webp",
  "assets/fotos/folhas.webp"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(VERSAO).then(function (cache) {
    return cache.addAll(BASE);
  }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (nome) { return nome !== VERSAO; }).map(function (nome) {
      return caches.delete(nome);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener("fetch", function (event) {
  var pedido = event.request;
  if (pedido.method !== "GET") return;

  function buscarEAtualizar() {
    return fetch(pedido).then(function (resposta) {
      if (!resposta.ok && resposta.type !== "opaque") return resposta;
      return caches.open(VERSAO).then(function (cache) {
        return cache.put(pedido, resposta.clone()).then(function () { return resposta; }, function () { return resposta; });
      }, function () { return resposta; });
    }).catch(function () { return null; });
  }

  event.respondWith(caches.match(pedido, { ignoreSearch: true }).then(function (guardada) {
    if (guardada) {
      event.waitUntil(buscarEAtualizar().then(function () {}).catch(function () {}));
      return guardada;
    }
    return buscarEAtualizar().then(function (resposta) {
      if (resposta) return resposta;
      if (pedido.mode === "navigate") return caches.match("index.html").then(function (pagina) { return pagina || Response.error(); });
      return Response.error();
    });
  }).catch(function () {
    if (pedido.mode === "navigate") return caches.match("index.html").then(function (pagina) { return pagina || Response.error(); }).catch(function () { return Response.error(); });
    return Response.error();
  }));
});