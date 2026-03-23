import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { clearMsg, showMsg } from "../../shared/scripts/UI/messageBox.js";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const _timers = {};

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  carregarMovimentacoes();

  // Fechar dropdowns ao clicar fora de qualquer wrapper
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-wrapper")) {
      [
        "dropdownFuncionario",
        "dropdownVisitante",
        "dropdownResponsavel",
        "dropdownChave",
      ].forEach(fecharDropdown);
    }
  });
});

// ─────────────────────────────────────────────
// TABELAS
// ─────────────────────────────────────────────
async function carregarMovimentacoes() {
  await renderTable({
    endpoint: "lists/movimentacoes/ativas",
    campos: ["nomePessoa", "tipoPessoa", "horaEntrada", "setorDestino", "acao"],
    tbodySelector: "#tbodyAtivos",
    renderCampo: {
      nome: (item) => item.nomeFuncionario ?? item.nomeVisitante ?? "—",
      tipoPessoa: (item) => formatTipo(item.tipoVisita),
      horaEntrada: (item) => formatDate(item.horaEntrada),
      setorDestino: (item) => item.setor ?? item.setorDestino ?? "—",
      acao: (item) => `
        <button class="btn btn-sm btn-danger" onclick="confirmarSaida(${item.id_movimentacao})">
          Registar Saída
        </button>`,
    },
  });

  await renderTable({
    endpoint: "lists/movimentacoes",
    campos: ["nomePessoa", "tipoPessoa", "horaEntrada", "horaSaida", "duracao"],
    tbodySelector: "#tbodyHistorico",
    renderCampo: {
      nome: (item) => item.nomeFuncionario ?? item.nomeVisitante ?? "—",
      tipoPessoa: (item) => formatTipo(item.tipoVisita),
      horaEntrada: (item) => formatDate(item.horaEntrada),
      horaSaida: (item) => formatDate(item.horaSaida),
      duracao: (item) => calcularDuracao(item.horaEntrada, item.horaSaida),
    },
  });
}

function formatTipo(tipo) {
  if (tipo === null) return "Funcionário";

  const labels = {
    funcionario: "Funcionário",
    visita: "Visita",
    servico: "Serviço",
    entrega: "Entrega",
    manutencao: "Manutenção",
  };

  if (tipo) return labels[tipo.toLowerCase()];

  return labels[tipo] ?? tipo ?? "—";
}

function calcularDuracao(entrada, saida) {
  if (!entrada || !saida) return "Em curso";
  const diff = new Date(saida) - new Date(entrada);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─────────────────────────────────────────────
// SAÍDA
// ─────────────────────────────────────────────
window.confirmarSaida = async function (idMovimentacao) {
  if (!confirm("Confirmar saída desta pessoa?")) return;

  const res = await fetchData(`movimentacoes/saida/${idMovimentacao}`, {
    method: "PATCH",
  });

  if (!res) return;

  // Aviso de chaves pendentes retornado pelo backend
  if (res.aviso) {
    alert(`⚠️ ${res.aviso}`);
  }

  carregarMovimentacoes();
};

// ─────────────────────────────────────────────
// DEBOUNCE
// ─────────────────────────────────────────────
function debounce(key, fn, ms = DEBOUNCE_MS) {
  clearTimeout(_timers[key]);
  _timers[key] = setTimeout(fn, ms);
}

// ─────────────────────────────────────────────
// AUTOCOMPLETE — PESSOAS
// ─────────────────────────────────────────────
function pessoaConfig(tipo) {
  return {
    funcionario: {
      inputId: "eNomeFuncionario",
      dropdownId: "dropdownFuncionario",
      hiddenId: "eIdFuncionario",
    },
    visitante: {
      inputId: "eNomeVisita",
      dropdownId: "dropdownVisitante",
      hiddenId: "eIdVisitante",
    },
    responsavel: {
      inputId: "eFuncResponsavel",
      dropdownId: "dropdownResponsavel",
      hiddenId: "eIdFuncResponsavel",
    },
  }[tipo];
}

window.onPessoaInput = function (tipo) {
  const cfg = pessoaConfig(tipo);
  const query = document.getElementById(cfg.inputId).value.trim();

  // Limpar o ID hidden quando o utilizador volta a editar manualmente
  document.getElementById(cfg.hiddenId).value = "";

  if (query.length < MIN_CHARS) {
    fecharDropdown(cfg.dropdownId);
    return;
  }

  const isVisitante = tipo === "visitante";
  const endpoint = isVisitante
    ? `busca/visitantes?nome=${encodeURIComponent(query)}`
    : `busca/funcionarios?nome=${encodeURIComponent(query)}`;

  debounce(`busca_${tipo}`, async () => {
    const lista = await fetchData(endpoint);
    if (lista !== undefined) renderDropdownPessoa(lista ?? [], tipo, cfg);
  });
};

function renderDropdownPessoa(lista, tipo, cfg) {
  const dropdown = document.getElementById(cfg.dropdownId);

  if (!lista.length) {
    dropdown.innerHTML = `<div class="autocomplete-empty">Pessoa não cadastrada.</div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = lista
    .map((p) => {
      const nome = p.nomeFuncionario ?? p.nomeVisitante;
      const detalhe = p.setor ?? p.empresa ?? "";
      // JSON.stringify inline para passar o objeto no onclick sem perder caracteres especiais
      const dataAttr = encodeURIComponent(JSON.stringify(p));
      return `
        <div class="autocomplete-item" onclick="selecionarPessoa(decodeAndParse('${dataAttr}'), '${tipo}')">
          <span class="autocomplete-nome">${nome}</span>
          ${detalhe ? `<span class="autocomplete-detalhe">${detalhe}</span>` : ""}
        </div>`;
    })
    .join("");

  dropdown.classList.remove("hidden");
}

// Helper para descodificar o objeto passado pelo onclick sem problemas de aspas
window.decodeAndParse = (encoded) => JSON.parse(decodeURIComponent(encoded));

window.selecionarPessoa = function (pessoa, tipo) {
  const cfg = pessoaConfig(tipo);
  document.getElementById(cfg.hiddenId).value = pessoa.id;

  if (tipo === "funcionario") {
    document.getElementById("eNomeFuncionario").value = pessoa.nomeFuncionario;
    document.getElementById("eSetorFuncionario").value = pessoa.setor;
  } else if (tipo === "visitante") {
    document.getElementById("eNomeVisita").value = pessoa.nomeVisitante;
    document.getElementById("eEmpresa").value = pessoa.empresa ?? "";
    document.getElementById("eDocumento").value =
      pessoa.documentoIdentificacao ?? "";
  } else if (tipo === "responsavel") {
    document.getElementById("eFuncResponsavel").value = pessoa.nomeFuncionario;
  }

  fecharDropdown(cfg.dropdownId);
};

// ─────────────────────────────────────────────
// AUTOCOMPLETE — CHAVES
// ─────────────────────────────────────────────
window.onChaveInput = function () {
  const query = document.getElementById("eChaveBusca").value.trim();

  // Se limpar o campo, limpa também a chave selecionada
  if (!query.length) {
    fecharDropdown("dropdownChave");
    return;
  }

  debounce("busca_chave", async () => {
    const lista = await fetchData(
      `busca/chaves?q=${encodeURIComponent(query)}`,
    );
    if (lista !== undefined) renderDropdownChave(lista ?? []);
  });
};

function renderDropdownChave(lista) {
  const dropdown = document.getElementById("dropdownChave");

  if (!lista.length) {
    dropdown.innerHTML = `<div class="autocomplete-empty">Nenhuma chave disponível.</div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = lista
    .map(
      (c) => `
      <div class="autocomplete-item" onclick="selecionarChave(${c.idChave}, '${c.descricao}', '${c.tipo}')">
        <span class="autocomplete-nome">${c.descricao}</span>
        <span class="autocomplete-detalhe">${c.tipo}</span>
      </div>`,
    )
    .join("");

  dropdown.classList.remove("hidden");
}

window.selecionarChave = function (id, descricao, tipo) {
  document.getElementById("eIdChave").value = id;
  document.getElementById("eChaveBusca").value = "";
  document.getElementById("chaveLabel").textContent = `${descricao} (${tipo})`;
  document.getElementById("chaveSelecionada").classList.remove("hidden");
  fecharDropdown("dropdownChave");
};

window.limparChave = function () {
  document.getElementById("eIdChave").value = "";
  document.getElementById("eChaveBusca").value = "";
  document.getElementById("chaveSelecionada").classList.add("hidden");
  document.getElementById("chaveLabel").textContent = "";
};

// ─────────────────────────────────────────────
// DROPDOWN — helper
// ─────────────────────────────────────────────
function fecharDropdown(id) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = "";
    el.classList.add("hidden");
  }
}

// ─────────────────────────────────────────────
// TOGGLE TIPO DE ENTRADA
// ─────────────────────────────────────────────
window.toggleEntradaTipo = function () {
  clearMsg("msgBoxEntrada");

  const isFuncionario =
    document.getElementById("eTipo").value === "funcionario";
  document
    .getElementById("secFuncionario")
    .classList.toggle("hidden", !isFuncionario);
  document
    .getElementById("secVisita")
    .classList.toggle("hidden", isFuncionario);
  limparPessoa();
};

// ─────────────────────────────────────────────
// TOGGLE CHAVE
// ─────────────────────────────────────────────
window.toggleKeySection = function () {
  const toggle = document.getElementById("keyToggle");
  const isOn = toggle.classList.toggle("on");
  document.getElementById("keySection").classList.toggle("hidden", !isOn);
  document.getElementById("keyToggleIcon").textContent = isOn ? "✓" : "";
  if (!isOn) window.limparChave();
};

// ─────────────────────────────────────────────
// SUBMISSÃO
// ─────────────────────────────────────────────
window.registarEntrada = async function () {
  clearMsg("msgBoxEntrada");

  const tipo = document.getElementById("eTipo").value;
  const isFuncionario = tipo === "funcionario";

  const idFuncionario = document.getElementById("eIdFuncionario").value;
  const idVisitante = document.getElementById("eIdVisitante").value;

  if (isFuncionario && !idFuncionario)
    return showMsg("Selecione um funcionário na lista de sugestões.");

  if (!isFuncionario && !idVisitante)
    return showMsg("Selecione um visitante na lista de sugestões.");

  const body = {
    observacoes: document.getElementById("eObs").value.trim() || null,
    tipoEntrada: "",
    setorDestino: "",
  };

  if (isFuncionario) {
    body.idFuncionario = parseInt(idFuncionario);
    body.tipoEntrada = "FUNCIONARIO";
  } else {
    body.idVisitante = parseInt(idVisitante);
    body.tipoVisita = tipo.toUpperCase();
    body.tipoEntrada = "VISITANTE";
    body.setorDestino = document.querySelector("#eSetorDestino").value;
    const idResp = document.getElementById("eIdFuncResponsavel").value;
    if (idResp) body.idFuncionarioResponsavel = parseInt(idResp);
  }

  const idChave = document.getElementById("eIdChave").value;
  if (idChave) {
    body.entregaChave = { idChave: parseInt(idChave) };
  }

  try {
    await fetchData("movimentacoes/entrada", {
      method: "POST",
      body: JSON.stringify(body),
    });

    showMsg("msgBoxEntrada", "Entrada registada com sucesso!", "success");
    closeModal("modalEntrada");
    clearEntradaForm();
    carregarMovimentacoes();
  } catch (err) {
    console.log(err);

    showMsg(
      "msgBoxEntrada",
      err.message ?? "Erro ao registar entrada",
      "error",
    );

    clearEntradaForm();
  }
};

// ─────────────────────────────────────────────
// LIMPAR FORM
// ─────────────────────────────────────────────
function limparPessoa() {
  ["eIdFuncionario", "eIdVisitante", "eIdFuncResponsavel"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  [
    "eNomeFuncionario",
    "eSetorFuncionario",
    "eNomeVisita",
    "eEmpresa",
    "eDocumento",
    "eSetorDestino",
    "eFuncResponsavel",
  ].forEach((id) => (document.getElementById(id).value = ""));
}

function clearEntradaForm() {
  limparPessoa();
  window.limparChave();
  document.getElementById("eObs").value = "";
  document.getElementById("eTipo").value = "funcionario";
  document.getElementById("keyToggle").classList.remove("on");
  document.getElementById("keyToggleIcon").textContent = "";
  document.getElementById("keySection").classList.add("hidden");
  window.toggleEntradaTipo();
}
