// ================= DADOS FICTÍCIOS (somem ao recarregar) =================
var STATUS = ["Aberta", "Agendada", "Em atendimento", "Concluída", "Avaliada"];
var GRUPO = { "Aberta": "ouro", "Agendada": "azul", "Em atendimento": "azul", "Concluída": "verde", "Avaliada": "verde" };
var ICONE = { "Aberta": "clock", "Agendada": "calendar", "Em atendimento": "clock", "Concluída": "check", "Avaliada": "check" };
var GRUPOS = [["Aberta"], ["Agendada", "Em atendimento"], ["Concluída", "Avaliada"]];
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

var estado = { perfil: null, selecionada: null, nota: 0, filtro: null };

// ================= ÍCONES (SVG embutido) =================
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
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>'
};
function ic(n) {
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>';
}

// ================= AUXILIARES =================
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

// ================= NAVEGAÇÃO =================
function mostrar(tela) {
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
  window.scrollTo(0, 0);
}

function irInicio() {             // clicar na logo
  if (estado.perfil) mostrar("tela-lista");
  else { abas("cadastro"); mostrar("tela-login"); }
}

// ================= ENTRADA =================
function abas(aba) {
  var entrar = aba === "entrar";
  $("form-entrar").classList.toggle("hidden", !entrar);
  $("form-cadastro").classList.toggle("hidden", entrar);
  $("aba-entrar").className = "btn " + (entrar ? "btn-acao" : "btn-borda");
  $("aba-cadastro").className = "btn " + (entrar ? "btn-borda" : "btn-acao");
}

function entrarComo(perfil) { estado.perfil = perfil; estado.filtro = null; mostrar("tela-lista"); }

function cadastrar() {            // simulação: nada é salvo
  if (!$("cad-nome").value.trim() || !$("cad-email").value.trim()) {
    $("cad-err").textContent = "Preencha nome e e-mail."; return;
  }
  if (!$("cad-lgpd").checked) {   // regra de negócio: consentimento LGPD
    $("cad-err").textContent = "É preciso aceitar o uso dos dados para continuar."; return;
  }
  entrarComo(document.querySelector('input[name="perfil"]:checked').value);
}

function sair() { estado.perfil = null; abas("cadastro"); mostrar("tela-login"); }

// ================= LISTA =================
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
    var etapa = STATUS.indexOf(s.status) + 1, seg = "";
    for (var k = 1; k <= 5; k++) seg += '<i' + (k <= etapa ? ' class="on"' : '') + '></i>';
    h += '<button class="card-p" onclick="abrir(' + s.id + ')">' +
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
  $("d-relatorio").value = ""; $("d-dt").value = "";
  mostrar("tela-detalhe");
}

// ================= NOVO PEDIDO (Produtor) =================
function enviarSolicitacao() {
  var tema = $("nv-tema").value.trim(), desc = $("nv-desc").value.trim();
  if (!tema || !desc) { $("nv-err").textContent = "Informe o que precisa e descreva o problema."; return; }
  solicitacoes.push({
    id: solicitacoes.length + 1, produtor: usuarios.produtor.nome,
    prop: document.querySelector('input[name="prop"]:checked').value, tema: tema, desc: desc,
    urg: document.querySelector('input[name="urg"]:checked').value,
    status: "Aberta", data: "", relatorio: "", nota: 0
  });
  $("nv-tema").value = ""; $("nv-desc").value = "";
  mostrar("tela-lista");
}

// ================= DETALHE: depende do PERFIL e do STATUS =================
function desenharDetalhe() {
  var s = atual(), i = STATUS.indexOf(s.status), prod = estado.perfil === "produtor";

  $("voltar-txt").textContent = prod ? "Meus pedidos" : "Pedidos";
  $("d-tema").textContent = s.tema;
  $("d-prop").innerHTML = ic("pin") + esc(s.prop.split(" (")[0]) + (prod ? "" : " · " + esc(s.produtor));
  $("d-chips").innerHTML = chip(s.status) + chipUrg(s.urg);
  $("d-relato").innerHTML = '<h3>' + ic("leaf") + (prod ? "O que você relatou" : "O que o produtor relatou") + '</h3><p>' + esc(s.desc) + '</p>';

  // linha do tempo: feito = check, atual = anel
  var ativo = s.status === "Concluída" ? 4 : (s.status === "Avaliada" ? 5 : i), h = "";
  STATUS.forEach(function (nome, k) {
    var c = k < ativo ? "feito" : (k === ativo ? "atual" : "");
    h += '<li class="' + c + '"><span class="pt">' + (k < ativo ? ic("check") : "") + '</span><span>' + nome +
         (k === 1 && s.data && i >= 1 ? ' <small>visita em ' + dataBR(s.data) + '</small>' : "") + '</span></li>';
  });
  $("d-tl").innerHTML = h;

  $("d-rel").classList.toggle("hidden", !s.relatorio);
  $("d-rel").innerHTML = s.relatorio ? '<h3>' + ic("doc") + 'Relatório da técnica ' + usuarios.tecnico.nome + '</h3><p>' + esc(s.relatorio) + '</p>' : "";

  // ações: só uma por vez
  document.querySelectorAll(".acao").forEach(function (a) { a.classList.add("hidden"); });
  var aviso = "";
  if (!prod) {
    if (s.status === "Aberta") $("acao-agendar").classList.remove("hidden");
    else if (s.status === "Agendada") $("acao-iniciar").classList.remove("hidden");
    else if (s.status === "Em atendimento") $("acao-concluir").classList.remove("hidden");
    else if (s.status === "Concluída") aviso = "Aguardando a avaliação do produtor.";
    else aviso = "Avaliação recebida: " + s.nota + " de 5, " + NOTAS[s.nota].toLowerCase() + ".";
  } else {
    if (s.status === "Concluída") { $("acao-avaliar").classList.remove("hidden"); desenharEstrelas(); }
    else if (s.status === "Avaliada") aviso = "Você avaliou com " + s.nota + " de 5. Obrigado!";
    else aviso = "A avaliação libera depois que a técnica concluir o atendimento.";
  }
  $("d-aviso").classList.toggle("hidden", !aviso);
  $("d-aviso").textContent = aviso;
}

// ================= AÇÕES DO TÉCNICO =================
function agendar() {
  if (!$("d-dt").value) { $("d-err").textContent = "Escolha a data da visita."; return; }
  var s = atual(); s.data = $("d-dt").value; s.status = "Agendada"; desenharDetalhe();
}
function iniciar() { atual().status = "Em atendimento"; desenharDetalhe(); }
function concluir() {
  var t = $("d-relatorio").value.trim();
  if (!t) { $("d-err").textContent = "Descreva o que foi orientado."; return; }
  var s = atual(); s.relatorio = t; s.status = "Concluída"; desenharDetalhe();
}

// ================= AÇÃO DO PRODUTOR: avaliar (só após Concluída) =================
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
  var s = atual(); s.nota = estado.nota; s.status = "Avaliada"; desenharDetalhe();
}

// ================= INÍCIO =================
document.querySelectorAll("[data-ic]").forEach(function (e) { e.innerHTML = ic(e.getAttribute("data-ic")); });
mostrar("tela-login");
