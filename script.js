// ================= dados de exemplo =================
var CHAVE = "lavra:v1";
var rascunho = {};
var FOTOS = { "Sítio Boa Esperança": "hortalicas", "Fazenda Santa Clara": "paisagem" };
function foto(s) { return "assets/fotos/" + (FOTOS[s.prop.split(" (")[0]] || "paisagem") + ".webp"; }
var STATUS = ["Aberta", "Agendada", "Em atendimento", "Concluída", "Avaliada"];
var GRUPO = { "Aberta": "ouro", "Agendada": "azul", "Em atendimento": "azul", "Concluída": "verde", "Avaliada": "verde", "Cancelada": "ouro" };
var ICONE = { "Aberta": "clock", "Agendada": "calendar", "Em atendimento": "clock", "Concluída": "check", "Avaliada": "check", "Cancelada": "clock" };
var GRUPOS = [["Aberta"], ["Agendada", "Em atendimento"], ["Concluída", "Avaliada", "Cancelada"]];
var NOTAS = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

var usuarios = {
  produtor: { nome: "Danilo Machado",  papel: "Produtor rural" },
  tecnico:  { nome: "Emelie Jovanovic", papel: "Técnica agrônoma" }
};

var solicitacoes = [
  { id: 1, produtor: "Danilo Machado", prop: "Sítio Boa Esperança (4 ha, hortaliças)", tema: "Manchas nas folhas do tomate",
    desc: "Manchas escuras nas folhas baixas há uma semana.", urg: "Alta",
    status: "Agendada", data: "2026-10-28", relatorio: "", nota: 0 },
  { id: 2, produtor: "Danilo Machado", prop: "Fazenda Santa Clara (38 ha, soja e milho)", tema: "Adubação do milho safrinha",
    desc: "Preciso de orientação sobre a dose de cobertura.", urg: "Média",
    status: "Concluída", data: "2026-10-15",
    relatorio: "Recomendada análise de solo e parcelamento da adubação.", nota: 0 }
];

var estado = { perfil: null, selecionada: null, nota: 0, filtro: null, tela: "tela-login" };

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ solicitacoes: solicitacoes, perfil: estado.perfil, tela: estado.tela, selecionada: estado.selecionada, rascunho: rascunho }));
  } catch (e) {}
}

function carregar() {
  try {
    var dados = JSON.parse(localStorage.getItem(CHAVE) || "null");
    if (!dados || !Array.isArray(dados.solicitacoes)) return;
    solicitacoes = dados.solicitacoes;
    solicitacoes.forEach(function (s) { if (typeof s.comentario !== "string") s.comentario = ""; });
    rascunho = dados.rascunho && typeof dados.rascunho === "object" ? dados.rascunho : {};
    if (Object.prototype.hasOwnProperty.call(usuarios, dados.perfil)) {
      estado.perfil = dados.perfil;
      estado.selecionada = dados.selecionada;
      estado.tela = ["tela-lista", "tela-nova", "tela-detalhe"].indexOf(dados.tela) >= 0 ? dados.tela : "tela-lista";
      if (estado.tela === "tela-detalhe" && !atual()) estado.tela = "tela-lista";
    }
  } catch (e) {}
}

function guardarCampo(id, chaveFn) {
  $(id).addEventListener("input", function () {
    rascunho[chaveFn()] = $(id).value;
    salvar();
  });
}

// ================= ícones (svg embutido) =================
var P = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  voltar: '<path d="m15 18-6-6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  sprout: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  seta: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>'
};
function ic(n) {
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>';
}

// ================= auxiliares =================
function $(id) { return document.getElementById(id); }
function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
function atual() { return solicitacoes.filter(function (s) { return s.id === estado.selecionada; })[0]; }
function dataBR(d) { return d.split("-").reverse().join("/"); }
function chip(s) { return '<span class="chip g-' + GRUPO[s] + '">' + ic(ICONE[s]) + s + '</span>'; }
function chipUrg(u) { return '<span class="chip u-' + u + '">Urgência ' + u.toLowerCase() + '</span>'; }

function etapaTxt(s) {
  var t = "Etapa <b>" + (STATUS.indexOf(s.status) + 1) + " de 5</b> · ";
  if (s.status === "Aberta") return t + "aguardando agendamento";
  if (s.status === "Agendada") return t + "visita em " + dataBR(s.data);
  if (s.status === "Em atendimento") return t + "em atendimento";
  if (s.status === "Concluída") return t + "concluída";
  if (s.status === "Cancelada") return "Atendimento cancelado";
  return t + "avaliada";
}

function dica(s, prod) {          // próxima ação em destaque no cartão
  if (prod) {
    return s.status === "Concluída"
      ? '<span class="dica-acao dica-ouro">' + ic("star") + 'Avaliação pendente: toque para avaliar</span>' : "";
  }
  var m = {
    "Aberta": "Próxima ação: agendar a visita",
    "Agendada": "Próxima ação: iniciar atendimento em " + (s.data ? dataBR(s.data).slice(0, 5) : ""),
    "Em atendimento": "Próxima ação: concluir o atendimento"
  }[s.status];
  return m ? '<span class="dica-acao dica-azul">' + ic("calendar") + m + '</span>' : "";
}

// ================= navegação =================
function mostrar(tela) {
  estado.tela = tela;
  document.body.classList.toggle("em-login", tela === "tela-login");
  document.querySelectorAll(".tela").forEach(function (t) { t.classList.add("hidden"); });
  $(tela).classList.remove("hidden");
  document.querySelectorAll(".err").forEach(function (e) { e.textContent = ""; });

  var logado = estado.perfil !== null;
  $("topo").className = "topo" + (logado ? " perfil-" + estado.perfil : "");
  $("usuario").classList.toggle("hidden", !logado);
  $("btn-sair").classList.toggle("hidden", !logado);
  if (logado) {
    var u = usuarios[estado.perfil];
    $("avatar").textContent = u.nome.split(" ").map(function (p) { return p[0]; }).join("");
    $("avatar").className = "avatar av-" + estado.perfil;
    $("u-nome").textContent = u.nome;
    $("u-papel").textContent = "Área do " + (estado.perfil === "produtor" ? "produtor" : "técnico");
  }
  if (tela === "tela-lista") desenharLista();
  if (tela === "tela-detalhe") desenharDetalhe();
  if (tela === "tela-nova") {
    $("nv-tema").value = rascunho["nv-tema"] || "";
    $("nv-desc").value = rascunho["nv-desc"] || "";
  }
  window.scrollTo(0, 0);
  salvar();
}

function irInicio() {             // clicar na logo
  if (estado.perfil) mostrar("tela-lista");
  else { abas("cadastro"); mostrar("tela-login"); }
}

// ================= entrada =================
function abas(aba) {
  var entrar = aba === "entrar";
  $("form-entrar").classList.toggle("hidden", !entrar);
  $("form-cadastro").classList.toggle("hidden", entrar);
  $("aba-entrar").className = "btn " + (entrar ? "btn-acao" : "btn-borda");
  $("aba-cadastro").className = "btn " + (entrar ? "btn-borda" : "btn-acao");
}

function entrarComo(perfil) { estado.perfil = perfil; estado.filtro = null; mostrar("tela-lista"); }

function cadastrar() {            // por enquanto, os dados não são salvos
  if (!$("cad-nome").value.trim() || !$("cad-email").value.trim()) {
    $("cad-err").textContent = "Preencha nome e e-mail."; return;
  }
  if (!$("cad-lgpd").checked) {   // o usuário precisa aceitar os termos
    $("cad-err").textContent = "É preciso aceitar o uso dos dados para continuar."; return;
  }
  entrarComo(document.querySelector('input[name="perfil"]:checked').value);
}

function sair() { estado.perfil = null; abas("cadastro"); mostrar("tela-login"); }

// ================= lista =================
function filtrar(k) { estado.filtro = estado.filtro === k ? null : k; desenharLista(); }

function desenharLista() {
  var prod = estado.perfil === "produtor";
  $("btn-nova").classList.toggle("hidden", !prod);
  $("titulo-lista").textContent = prod ? "Meus pedidos" : "Pedidos para atender";

  var nomes = [prod ? "Abertas" : "Para agendar", "Em andamento", "Concluídas"], icones = ["clock", "calendar", "check"], h = "";
  GRUPOS.forEach(function (g, k) {
    var n = solicitacoes.filter(function (s) { return g.indexOf(s.status) >= 0; }).length;
    h += '<button class="stat" aria-pressed="' + (estado.filtro === k) + '" onclick="filtrar(' + k + ')">' +
         ic(icones[k]) + '<b>' + n + '</b><span>' + nomes[k] + '</span></button>';
  });
  $("stats").innerHTML = h;

  var itens = solicitacoes.slice().reverse().filter(function (s) {
    return estado.filtro === null || GRUPOS[estado.filtro].indexOf(s.status) >= 0;
  });
  h = "";
  itens.forEach(function (s) {
    var etapa = s.status === "Cancelada" ? 5 : STATUS.indexOf(s.status) + 1, seg = "";
    for (var k = 1; k <= 5; k++) seg += '<i' + (k <= etapa ? ' class="on"' : '') + '></i>';
    h += '<button class="card-p" onclick="abrir(' + s.id + ')">' +
         '<img class="cp-foto" src="' + foto(s) + '" width="1078" height="716" alt="" loading="lazy" decoding="async">' +
         '<span class="cp-top"><span>' + esc(s.tema) + '</span>' + ic("chevron") + '</span>' +
         '<span class="local">' + ic("pin") + esc(s.prop.split(" (")[0]) + (prod ? "" : " · " + esc(s.produtor)) + '</span>' +
         '<span class="chips">' + chip(s.status) + chipUrg(s.urg) + '</span>' +
         '<span class="prog p-' + GRUPO[s.status] + '">' + seg + '</span>' +
         '<span class="etapa">' + etapaTxt(s) + '</span>' + dica(s, prod) + '</button>';
  });
  $("lista").innerHTML = h || '<p class="nota">Nenhum pedido neste filtro.</p>';
}

function abrir(id) {
  estado.selecionada = id; estado.nota = 0;
  $("d-relatorio").value = rascunho["rel-" + id] || ""; $("d-dt").value = "";
  $("d-comentario").value = atual().comentario || "";
  mostrar("tela-detalhe");
}

// ================= novo pedido (produtor) =================
function enviarSolicitacao() {
  var tema = $("nv-tema").value.trim(), desc = $("nv-desc").value.trim();
  if (!tema || !desc) { $("nv-err").textContent = "Informe o que precisa e descreva o problema."; return; }
  solicitacoes.push({
    id: solicitacoes.length + 1, produtor: usuarios.produtor.nome,
    prop: document.querySelector('input[name="prop"]:checked').value, tema: tema, desc: desc,
    urg: document.querySelector('input[name="urg"]:checked').value,
    status: "Aberta", data: "", relatorio: "", nota: 0, comentario: ""
  });
  delete rascunho["nv-tema"];
  delete rascunho["nv-desc"];
  $("nv-tema").value = ""; $("nv-desc").value = "";
  mostrar("tela-lista");
}

// ================= detalhe: depende do perfil e do status =================
function desenharDetalhe() {
  var s = atual(), i = STATUS.indexOf(s.status), prod = estado.perfil === "produtor";

  $("d-capa").src = foto(s);
  $("voltar-txt").textContent = prod ? "Meus pedidos" : "Pedidos";
  $("d-tema").textContent = s.tema;
  $("d-prop").innerHTML = ic("pin") + esc(s.prop.split(" (")[0]) + (prod ? "" : " · " + esc(s.produtor));
  $("d-chips").innerHTML = chip(s.status) + chipUrg(s.urg);
  $("d-relato").innerHTML = '<h3>' + ic("leaf") + (prod ? "O que você relatou" : "O que o produtor relatou") + '</h3><p>' + esc(s.desc) + '</p>';

  // linha do tempo: feito = check, atual = anel
  var ativo = s.status === "Concluída" ? 4 : (s.status === "Avaliada" ? 5 : i), h = "";
  if (s.status === "Cancelada") {
    h = '<li class="cancelado atual"><span class="pt">×</span><span>Atendimento cancelado</span></li>';
  } else {
  STATUS.forEach(function (nome, k) {
    var c = k < ativo ? "feito" : (k === ativo ? "atual" : "");
    h += '<li class="' + c + '"><span class="pt">' + (k < ativo ? ic("check") : "") + '</span><span>' + nome +
         (k === 1 && s.data && i >= 1 ? ' <small>visita em ' + dataBR(s.data) + '</small>' : "") + '</span></li>';
  });
  }
  $("d-tl").innerHTML = h;

  $("d-rel").classList.toggle("hidden", !s.relatorio);
  $("d-rel").innerHTML = s.relatorio ? '<h3>' + ic("doc") + 'Relatório da técnica ' + usuarios.tecnico.nome + '</h3><p>' + esc(s.relatorio) + '</p>' : "";
  $("d-comentario-card").classList.toggle("hidden", !s.comentario);
  $("d-comentario-card").innerHTML = s.comentario ? '<h3>Comentário do produtor · avaliação ' + s.nota + '/5</h3><p>' + esc(s.comentario) + '</p>' : "";

  // ações: só uma por vez
  document.querySelectorAll(".acao").forEach(function (a) { a.classList.add("hidden"); });
  var aviso = "";
  if (!prod) {
    if (s.status === "Aberta") $("acao-agendar").classList.remove("hidden");
    else if (s.status === "Agendada") $("acao-iniciar").classList.remove("hidden");
    else if (s.status === "Em atendimento") $("acao-concluir").classList.remove("hidden");
    else if (s.status === "Concluída") aviso = "Aguardando a avaliação do produtor.";
    else if (s.status === "Avaliada") aviso = "Avaliação recebida: " + s.nota + " de 5, " + NOTAS[s.nota].toLowerCase() + ".";
    else if (s.status === "Cancelada") aviso = "Este atendimento foi cancelado.";
  } else {
    if (s.status === "Concluída") { $("acao-avaliar").classList.remove("hidden"); desenharEstrelas(); }
    else if (s.status === "Avaliada") aviso = "Você avaliou com " + s.nota + " de 5. Obrigado!";
    else if (s.status === "Cancelada") aviso = "Este atendimento foi cancelado.";
    else aviso = "A avaliação libera depois que a técnica concluir o atendimento.";
  }
  $("acao-cancelar").classList.toggle("hidden", ["Concluída", "Avaliada", "Cancelada"].indexOf(s.status) >= 0);
  $("d-aviso").classList.toggle("hidden", !aviso);
  $("d-aviso").textContent = aviso;
  salvar();
}

// ================= ações do técnico =================
function agendar() {
  if (!$("d-dt").value) { $("d-err").textContent = "Escolha a data da visita."; return; }
  var s = atual(); s.data = $("d-dt").value; s.status = "Agendada"; desenharDetalhe();
}
function iniciar() { atual().status = "Em atendimento"; desenharDetalhe(); }
function concluir() {
  var t = $("d-relatorio").value.trim();
  if (!t) { $("d-err").textContent = "Descreva o que foi orientado."; return; }
  var s = atual(); s.relatorio = t; s.status = "Concluída"; delete rascunho["rel-" + s.id]; desenharDetalhe();
}
function cancelarAtendimento() {
  var s = atual();
  if (!s || ["Concluída", "Avaliada", "Cancelada"].indexOf(s.status) >= 0) return;
  if (!window.confirm("Deseja cancelar este atendimento?")) return;
  s.status = "Cancelada";
  desenharLista();
  desenharDetalhe();
}

// ================= ação do produtor: avaliar (só após concluída) =================
function escolherNota(n) { estado.nota = n; desenharEstrelas(); }

function desenharEstrelas() {
  var h = "";
  for (var n = 1; n <= 5; n++) {
    h += '<button type="button" class="' + (n <= estado.nota ? "on" : "") + '" aria-label="' + n + (n === 1 ? " estrela" : " estrelas") +
         '" aria-pressed="' + (n <= estado.nota) + '" onclick="escolherNota(' + n + ')">' + ic("star") + '</button>';
  }
  $("estrelas").innerHTML = h;
  $("nota-txt").textContent = estado.nota
    ? "Avalie o atendimento: " + estado.nota + " de 5, " + NOTAS[estado.nota].toLowerCase()
    : "Avalie o atendimento: toque nas estrelas";
}

function avaliar() {
  if (!estado.nota) { $("d-err").textContent = "Escolha uma nota de 1 a 5."; return; }
  var s = atual(); s.nota = estado.nota; s.comentario = $("d-comentario").value.trim(); s.status = "Avaliada"; desenharDetalhe();
}

function aviarRede() {
  $("offline").classList.toggle("hidden", navigator.onLine !== false);
}

// ================= início =================
document.querySelectorAll("[data-ic]").forEach(function (e) { e.innerHTML = ic(e.getAttribute("data-ic")); });
guardarCampo("nv-tema", function () { return "nv-tema"; });
guardarCampo("nv-desc", function () { return "nv-desc"; });
guardarCampo("d-relatorio", function () { return "rel-" + estado.selecionada; });
window.addEventListener("online", aviarRede);
window.addEventListener("offline", aviarRede);
aviarRede();
carregar();
mostrar(estado.perfil ? estado.tela : "tela-login");
if (estado.tela === "tela-detalhe" && estado.perfil) $("d-relatorio").value = rascunho["rel-" + estado.selecionada] || "";
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
