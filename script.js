// ================= DADOS FICTÍCIOS (somem ao recarregar a página) =================
var STATUS = ["Aberta", "Agendada", "Em atendimento", "Concluída", "Avaliada"];

var usuarios = {
  produtor: { nome: "Marcos Oliveira", papel: "Produtor Rural" },
  tecnico:  { nome: "Ana Lima",        papel: "Técnica Agrônoma" }
};

var solicitacoes = [
  { id: 1, prop: "Sítio Boa Esperança (4 ha, hortaliças)", tema: "Manchas nas folhas do tomate",
    desc: "Manchas escuras nas folhas baixas há uma semana.", urg: "Alta",
    status: "Agendada", data: "2026-10-28", relatorio: "", nota: 0, comentario: "" },
  { id: 2, prop: "Fazenda Santa Clara (38 ha, soja e milho)", tema: "Adubação do milho safrinha",
    desc: "Preciso de orientação sobre a dose de cobertura.", urg: "Média",
    status: "Concluída", data: "2026-10-15",
    relatorio: "Recomendada análise de solo e parcelamento da adubação.", nota: 0, comentario: "" }
];

var estado = { perfil: null, selecionada: null, nota: 0 };

// ================= FUNÇÕES AUXILIARES =================
function $(id) { return document.getElementById(id); }

function esc(texto) {            // evita que texto digitado vire HTML
  var d = document.createElement("div");
  d.textContent = texto;
  return d.innerHTML;
}

function atual() {
  return solicitacoes.filter(function (s) { return s.id === estado.selecionada; })[0];
}

// ================= NAVEGAÇÃO ENTRE TELAS =================
function mostrar(tela) {
  document.querySelectorAll(".tela").forEach(function (t) {
    if (t.tagName === "MAIN") t.classList.add("hidden");   // esconde só as telas principais
  });
  $(tela).classList.remove("hidden");
  document.querySelectorAll(".err").forEach(function (e) { e.textContent = ""; });

  var logado = estado.perfil !== null;
  $("btn-sair").classList.toggle("hidden", !logado);
  $("logo").classList.toggle("hidden", logado);
  $("iniciais").classList.toggle("hidden", !logado);
  if (logado) $("iniciais").textContent = usuarios[estado.perfil].nome.split(" ").map(function (p) { return p[0]; }).join("");
  $("topo-sub").textContent = logado
    ? usuarios[estado.perfil].nome + " · " + usuarios[estado.perfil].papel
    : "Atendimento técnico rural";
  $("crumb").textContent = logado ? (estado.perfil === "produtor" ? "Área do produtor" : "Área do técnico") : "";

  if (tela === "tela-lista") desenharLista();
  if (tela === "tela-detalhe") desenharDetalhe();
}

// ================= LOGIN E CADASTRO =================
function abas(aba) {
  var entrar = aba === "entrar";
  $("form-entrar").classList.toggle("hidden", !entrar);
  $("form-cadastro").classList.toggle("hidden", entrar);
  $("aba-entrar").classList.toggle("alt", !entrar);
  $("aba-cadastro").classList.toggle("alt", entrar);
}

function entrarComo(perfil) {
  estado.perfil = perfil;
  mostrar("tela-lista");
}

function cadastrar() {
  if (!$("cad-nome").value.trim() || !$("cad-email").value.trim()) {
    $("cad-err").textContent = "Informe seu nome e e-mail.";
    return;
  }
  if (!$("cad-lgpd").checked) {   // regra de negócio: consentimento LGPD obrigatório
    $("cad-err").textContent = "Marque a autorização para continuar.";
    return;
  }
  entrarComo($("cad-perfil").value);
}

function sair() {
  estado.perfil = null;
  abas("entrar");
  mostrar("tela-login");
}

// ================= LISTA DE SOLICITAÇÕES =================
function desenharLista() {
  var produtor = estado.perfil === "produtor";
  $("btn-nova").classList.toggle("hidden", !produtor);
  $("titulo-lista").textContent = produtor ? "Meus pedidos" : "Pedidos para atender";

  function conta(lista) {
    return solicitacoes.filter(function (s) { return lista.indexOf(s.status) >= 0; }).length;
  }
  $("stats").innerHTML =
    '<div class="stat"><b>' + conta(["Aberta"]) + '</b><span>Abertas</span></div>' +
    '<div class="stat"><b>' + conta(["Agendada", "Em atendimento"]) + '</b><span>Em andamento</span></div>' +
    '<div class="stat"><b>' + conta(["Concluída", "Avaliada"]) + '</b><span>Concluídas</span></div>';

  var html = "";
  solicitacoes.slice().reverse().forEach(function (s) {
    html += '<button class="item" data-s="' + s.status + '" onclick="abrir(' + s.id + ')">' +
            '<div class="item-top"><b>' + esc(s.tema) + '</b><span class="chip s-' + s.status + '">' + s.status + '</span></div>' +
            '<span class="sub"><span class="urg urg-' + s.urg + '"></span>' + esc(s.prop.split(" (")[0]) + ' · urgência ' + s.urg.toLowerCase() + '</span></button>';
  });
  $("lista").innerHTML = html;
}

function abrir(id) {
  estado.selecionada = id;
  estado.nota = 0;
  $("d-comentario").value = "";
  $("d-relatorio").value = "";
  $("d-dt").value = "";
  mostrar("tela-detalhe");
}

// ================= NOVA SOLICITAÇÃO (Produtor) =================
function enviarSolicitacao() {
  var tema = $("nv-tema").value.trim(), desc = $("nv-desc").value.trim();
  if (!tema || !desc) {
    $("nv-err").textContent = "Diga sobre o que precisa de ajuda e conte o que aconteceu.";
    return;
  }
  solicitacoes.push({
    id: solicitacoes.length + 1, prop: $("nv-prop").value, tema: tema, desc: desc,
    urg: $("nv-urg").value, status: "Aberta", data: "", relatorio: "", nota: 0, comentario: ""
  });
  $("nv-tema").value = "";
  $("nv-desc").value = "";
  mostrar("tela-lista");
}

// ================= DETALHE: o que aparece depende do PERFIL e do STATUS =================
function desenharDetalhe() {
  var s = atual(), i = STATUS.indexOf(s.status), produtor = estado.perfil === "produtor";

  $("d-tema").textContent = s.tema;
  $("d-prop").textContent = s.prop;
  $("d-desc").textContent = s.desc;

  document.querySelectorAll("#d-tl li").forEach(function (li, k) {
    li.classList.toggle("on", k <= i);
  });
  $("d-data").textContent = (i >= 1 && s.data) ? " · visita em " + s.data.split("-").reverse().join("/") : "";

  $("d-rel").classList.toggle("hidden", !s.relatorio);
  $("d-rel").textContent = s.relatorio ? "Relatório do técnico: " + s.relatorio : "";

  document.querySelectorAll(".acao").forEach(function (a) { a.classList.add("hidden"); });
  var aviso = "";

  if (!produtor) {                                   // visão do Técnico
    if (s.status === "Aberta") $("acao-agendar").classList.remove("hidden");
    else if (s.status === "Agendada") $("acao-iniciar").classList.remove("hidden");
    else if (s.status === "Em atendimento") $("acao-concluir").classList.remove("hidden");
    else if (s.status === "Concluída") aviso = "Aguardando a avaliação do produtor.";
    else aviso = "Avaliação recebida: " + s.nota + " de 5. " + s.comentario;
  } else {                                           // visão do Produtor
    if (s.status === "Concluída") { $("acao-avaliar").classList.remove("hidden"); marcarEstrelas(); }
    else if (s.status === "Avaliada") aviso = "Você avaliou com " + s.nota + " de 5. Obrigado!";
    else aviso = "A avaliação fica disponível depois que o técnico concluir o atendimento.";
  }
  $("d-aviso").classList.toggle("hidden", !aviso);
  $("d-aviso").textContent = aviso;
}

// ================= AÇÕES DO TÉCNICO (cada uma avança um status) =================
function agendar() {
  var data = $("d-dt").value;
  if (!data) { $("d-err").textContent = "Escolha a data da visita."; return; }
  var s = atual(); s.data = data; s.status = "Agendada";
  desenharDetalhe();
}

function iniciar() {
  atual().status = "Em atendimento";
  desenharDetalhe();
}

function concluir() {
  var texto = $("d-relatorio").value.trim();
  if (!texto) { $("d-err").textContent = "Descreva o que foi orientado."; return; }
  var s = atual(); s.relatorio = texto; s.status = "Concluída";
  desenharDetalhe();
}

// ================= AÇÃO DO PRODUTOR: avaliação (só após Concluída) =================
function escolherNota(n) {
  estado.nota = n;
  marcarEstrelas();
}

function marcarEstrelas() {
  document.querySelectorAll("#estrelas button").forEach(function (b, k) {
    b.classList.toggle("on", k < estado.nota);
  });
}

function avaliar() {
  if (!estado.nota) { $("d-err").textContent = "Escolha uma nota de 1 a 5."; return; }
  var s = atual();
  s.nota = estado.nota;
  s.comentario = $("d-comentario").value.trim();
  s.status = "Avaliada";
  desenharDetalhe();
}

// ================= INÍCIO =================
mostrar("tela-login");
