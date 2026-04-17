import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { clearMsg, showMsg } from "../../shared/scripts/UI/messageBox.js";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const DEBOUNCE_MS = 400;
const MIN_CHARS = 2;
const MAX_CHAVES = 10;
const _timers = {};

// Lista de chaves selecionadas no form de entrada: [{ id, descricao, tipo }]
let chavesEntrada = [];

// Cache das movimentações ativas (para filtro client-side)
let todasMovimentacoes = [];

// Cache de objetos para evitar serialização em atributos onclick
const _movimentacaoCache = new Map();
const _pessoaCache = new Map();

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  carregarMovimentacoes();

  document
    .getElementById("searchMovimentacoes")
    .addEventListener("input", (e) => {
      renderMovimentacoes(e.target.value.trim().toLowerCase());
    });

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
// TABELA DE ATIVOS
// ─────────────────────────────────────────────
async function carregarMovimentacoes() {
  const tbody = document.querySelector("#tbodyAtivos");
  tbody.innerHTML = `<tr><td colspan="5">A carregar...</td></tr>`;

  try {
    todasMovimentacoes = (await fetchData("lists/movimentacoes/ativas")) ?? [];
  } catch {
    tbody.innerHTML = `<tr><td colspan="5" class="alert alert-error">Erro ao carregar dados.</td></tr>`;
    return;
  }

  const filtroAtual =
    document
      .getElementById("searchMovimentacoes")
      ?.value.trim()
      .toLowerCase() ?? "";
  renderMovimentacoes(filtroAtual);
}

function renderMovimentacoes(filtro) {
  const tbody = document.querySelector("#tbodyAtivos");
  const lista = filtro
    ? todasMovimentacoes.filter((m) =>
        m.nomePessoa?.toLowerCase().includes(filtro),
      )
    : todasMovimentacoes;

  if (!lista.length) {
    const msg = filtro
      ? "Nenhum resultado para essa pesquisa."
      : "Ninguém no edifício.";
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state">
          <div class="icon">📊</div>
          ${msg}
        </div>
      </td></tr>`;
    return;
  }

  _movimentacaoCache.clear();
  lista.forEach((item) => _movimentacaoCache.set(item.id_movimentacao, item));

  tbody.innerHTML = lista
    .map(
      (item) => `
      <tr>
        <td>${item.nomePessoa ?? "—"}</td>
        <td>${formatTipo(item.tipoPessoa, item.tipoVisita)}</td>
        <td>${formatDate(item.horaEntrada)}</td>
        <td>${item.setorDestino ?? "—"}</td>
        <td>${renderAcoes(item)}</td>
      </tr>`,
    )
    .join("");
}

function renderAcoes(item) {
  const numChaves = item.entregasPendentes?.length ?? 0;

  const badge = `<span class="chave-badge${numChaves === 0 ? " chave-badge--hidden" : ""}"
    title="${numChaves} chave(s) pendente(s)">
    🔑${numChaves > 1 ? `<sup>${numChaves}</sup>` : ""}
  </span>`;

  return `
    <div class="acoes-cell">
      ${badge}
      <button class="btn btn-sm btn-ghost"
        onclick="abrirModalDetalhes(${item.id_movimentacao})">
        Ver Detalhes
      </button>
    </div>`;
}

function formatTipo(tipoPessoa, tipoVisita) {
  if (tipoPessoa === "FUNCIONARIO") return "Funcionário";
  const labels = {
    visitante: "Visitante",
    servico: "Serviço",
    entrega: "Entrega",
    manutencao: "Manutenção",
  };
  return labels[tipoVisita?.toLowerCase()] ?? tipoVisita ?? "—";
}

// ─────────────────────────────────────────────
// MODAL DETALHES / AÇÕES
// ─────────────────────────────────────────────
window.abrirModalDetalhes = function (id) {
  const movimentacao = _movimentacaoCache.get(id);
  if (!movimentacao) return;

  document.getElementById("detNomePessoa").textContent =
    movimentacao.nomePessoa ?? "—";
  document.getElementById("detTipo").textContent = formatTipo(
    movimentacao.tipoPessoa,
    movimentacao.tipoVisita,
  );
  document.getElementById("detHoraEntrada").textContent = formatDate(
    movimentacao.horaEntrada,
  );
  document.getElementById("detSetor").textContent =
    movimentacao.setorDestino ?? "—";
  document.getElementById("detObs").textContent =
    movimentacao.observacoes || "Sem observações";

  clearMsg("msgBoxDetalhes");

  const pendentes = movimentacao.entregasPendentes ?? [];
  const secChaves = document.getElementById("detSecChaves");

  if (pendentes.length > 0) {
    secChaves.innerHTML = `
      <div class="det-chave-header">
        🔑 ${pendentes.length} Chave(s) Pendente(s)
      </div>
      ${pendentes.map((p) => renderCartaoChave(p)).join("")}`;
    secChaves.classList.remove("hidden");
  } else {
    secChaves.innerHTML = "";
    secChaves.classList.add("hidden");
  }

  document.getElementById("detAcoes").innerHTML = renderBotoesDetalhes(
    movimentacao,
    pendentes.length,
  );

  openModal("modalDetalhes");
};

function renderCartaoChave(pendente) {
  const uid = `chave_${pendente.idEntrega}`;
  return `
    <div class="det-chave-card" id="card_${uid}">
      <div class="det-chave-card-info">
        <span class="autocomplete-nome">${pendente.descricao}</span>
        <span class="autocomplete-detalhe">${pendente.tipo}</span>
        <button class="btn btn-ghost btn-sm"
          onclick="toggleDevolucaoInline('${uid}', ${pendente.idEntrega})">
          Devolver
        </button>
      </div>
      <div class="det-devolucao-inline hidden" id="inline_${uid}">
        <div class="det-devolucao-inline-header">Devolver — ${pendente.descricao}</div>
        <div class="form-group">
          <label>Devolvida por</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="devolvidaPor_${uid}"
              placeholder="Nome de quem entrega a chave"
              autocomplete="off"
              oninput="onDevolvidaPorInlineInput('${uid}')" />
            <div class="autocomplete-dropdown hidden" id="dropdownDevolvidaPor_${uid}"></div>
          </div>
        </div>
        <div id="msg_${uid}" class="alert" style="display:none"></div>
        <div class="det-devolucao-inline-footer">
          <button class="btn btn-ghost btn-sm"
            onclick="toggleDevolucaoInline('${uid}')">
            Cancelar
          </button>
          <button class="btn btn-primary btn-sm"
            onclick="confirmarDevolucaoInline(${pendente.idEntrega}, '${uid}')">
            Confirmar Devolução
          </button>
        </div>
      </div>
    </div>`;
}

function renderBotoesDetalhes(movimentacao, numPendentes) {
  const id = movimentacao.id_movimentacao;

  if (numPendentes > 0) {
    const labelCombinado =
      numPendentes === 1
        ? "✓ Registar Saída + Devolver Chave"
        : `✓ Registar Saída + Devolver ${numPendentes} Chaves`;

    return `
      <div class="det-acoes-group">
        <button class="btn btn-primary btn-full"
          onclick="registrarSaidaComDevolucao(${id})">
          ${labelCombinado}
        </button>
        <button class="btn btn-saida-aviso btn-full"
          onclick="confirmarSaidaSemDevolver(${id})">
          ⚠ Só Registar Saída (chave(s) ficam pendentes)
        </button>
      </div>`;
  }

  return `
    <div class="det-acoes-group">
      <button class="btn btn-primary btn-full"
        onclick="confirmarSaidaSimples(${id})">
        ✓ Registar Saída
      </button>
    </div>`;
}

// ─────────────────────────────────────────────
// TOGGLE / CONFIRMAR DEVOLUÇÃO INLINE POR CHAVE
// ─────────────────────────────────────────────
window.toggleDevolucaoInline = function (uid) {
  const inline = document.getElementById(`inline_${uid}`);
  const isAberto = !inline.classList.contains("hidden");

  if (isAberto) {
    inline.classList.add("hidden");
    const input = document.getElementById(`devolvidaPor_${uid}`);
    input.value = "";
    input.dataset.selecionado = "";
    fecharDropdown(`dropdownDevolvidaPor_${uid}`);
    clearMsg(`msg_${uid}`);
  } else {
    inline.classList.remove("hidden");
    inline.scrollIntoView({ behavior: "smooth", block: "nearest" });
    document.getElementById(`devolvidaPor_${uid}`).focus();
  }
};

window.confirmarDevolucaoInline = async function (idEntrega, uid) {
  clearMsg(`msg_${uid}`);

  const inputDevolvidaPor = document.getElementById(`devolvidaPor_${uid}`);
  const devolvidaPor = inputDevolvidaPor.value.trim();

  if (!devolvidaPor)
    return showMsg(`msg_${uid}`, "Indique quem está a devolver a chave.");
  if (inputDevolvidaPor.dataset.selecionado !== "1")
    return showMsg(`msg_${uid}`, "Selecione uma opção da lista.");

  try {
    await fetchData(
      `movimentacoes/devolucao/${idEntrega}?devolvidaPor=${encodeURIComponent(devolvidaPor)}`,
      { method: "PATCH" },
    );

    // Remove apenas o cartão desta chave sem fechar o modal
    document.getElementById(`card_${uid}`)?.remove();

    carregarMovimentacoes();

    // Fecha o modal se já não restam chaves pendentes
    const secChaves = document.getElementById("detSecChaves");
    if (secChaves.querySelectorAll(".det-chave-card").length === 0) {
      closeModal("modalDetalhes");
    }
  } catch (err) {
    showMsg(
      `msg_${uid}`,
      err.message ?? "Erro ao registar devolução.",
      "error",
    );
  }
};

// ─────────────────────────────────────────────
// AUTOCOMPLETE — DEVOLVIDA POR (INLINE)
// ─────────────────────────────────────────────
window.onDevolvidaPorInlineInput = function (uid) {
  const input = document.getElementById(`devolvidaPor_${uid}`);
  const query = input.value.trim();
  input.dataset.selecionado = "";

  if (query.length < 2) {
    fecharDropdown(`dropdownDevolvidaPor_${uid}`);
    return;
  }

  debounce(`busca_devolvida_por_${uid}`, async () => {
    const lista = await fetchData(
      `busca/geral?nome=${encodeURIComponent(query)}`,
    );
    renderDropdownDevolvidaPorInline(uid, lista ?? []);
  });
};

function renderDropdownDevolvidaPorInline(uid, lista) {
  const dropdown = document.getElementById(`dropdownDevolvidaPor_${uid}`);

  if (!lista.length) {
    fecharDropdown(`dropdownDevolvidaPor_${uid}`);
    return;
  }

  dropdown.innerHTML = lista
    .map(
      (p) => `
      <div class="autocomplete-item"
        data-nome="${p.nome}"
        onclick="selecionarDevolvidaPorInline('${uid}', this.dataset.nome)">
        <span class="autocomplete-nome">${p.nome}</span>
        <span class="autocomplete-detalhe">${p.tipo}</span>
      </div>`,
    )
    .join("");

  dropdown.classList.remove("hidden");
}

window.selecionarDevolvidaPorInline = function (uid, nome) {
  const input = document.getElementById(`devolvidaPor_${uid}`);
  input.value = nome;
  input.dataset.selecionado = "1";
  fecharDropdown(`dropdownDevolvidaPor_${uid}`);
};

// ─────────────────────────────────────────────
// AÇÕES GLOBAIS DO MODAL
// ─────────────────────────────────────────────
window.registrarSaidaComDevolucao = async function (idMovimentacao) {
  clearMsg("msgBoxDetalhes");

  try {
    const res = await fetchData(
      `movimentacoes/saida-com-devolucao/${idMovimentacao}`,
      { method: "PATCH" },
    );
    closeModal("modalDetalhes");
    carregarMovimentacoes();
    if (res?.aviso) setTimeout(() => alert(`✅ ${res.aviso}`), 150);
  } catch (err) {
    showMsg(
      "msgBoxDetalhes",
      err.message ?? "Erro ao registar saída.",
      "error",
    );
  }
};

window.confirmarSaidaSemDevolver = async function (idMovimentacao) {
  clearMsg("msgBoxDetalhes");

  if (
    !confirm(
      "⚠️ As chaves ficarão pendentes de devolução.\nTem a certeza que quer registar apenas a saída?",
    )
  )
    return;

  try {
    const res = await fetchData(`movimentacoes/saida/${idMovimentacao}`, {
      method: "PATCH",
    });
    closeModal("modalDetalhes");
    carregarMovimentacoes();
    if (res?.aviso) setTimeout(() => alert(`⚠️ ${res.aviso}`), 150);
  } catch (err) {
    showMsg(
      "msgBoxDetalhes",
      err.message ?? "Erro ao registar saída.",
      "error",
    );
  }
};

window.confirmarSaidaSimples = async function (idMovimentacao) {
  clearMsg("msgBoxDetalhes");

  if (!confirm("Confirmar saída desta pessoa?")) return;

  try {
    await fetchData(`movimentacoes/saida/${idMovimentacao}`, {
      method: "PATCH",
    });
    closeModal("modalDetalhes");
    carregarMovimentacoes();
  } catch (err) {
    showMsg(
      "msgBoxDetalhes",
      err.message ?? "Erro ao registar saída.",
      "error",
    );
  }
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
  document.getElementById(cfg.hiddenId).value = "";

  if (query.length < MIN_CHARS) {
    fecharDropdown(cfg.dropdownId);
    return;
  }

  const endpoint =
    tipo === "visitante"
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

  lista.forEach((p) => _pessoaCache.set(p.id, p));

  dropdown.innerHTML = lista
    .map((p) => {
      const nome = p.nomeFuncionario ?? p.nomeVisitante;
      const detalhe = p.setor ?? p.empresa ?? "";
      return `
        <div class="autocomplete-item"
          onclick="selecionarPessoa(${p.id}, '${tipo}')">
          <span class="autocomplete-nome">${nome}</span>
          ${detalhe ? `<span class="autocomplete-detalhe">${detalhe}</span>` : ""}
        </div>`;
    })
    .join("");

  dropdown.classList.remove("hidden");
}

window.selecionarPessoa = function (id, tipo) {
  const pessoa = _pessoaCache.get(id);
  if (!pessoa) return;
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
// AUTOCOMPLETE — CHAVES (multi-seleção)
// ─────────────────────────────────────────────
window.onChaveInput = function () {
  const query = document.getElementById("eChaveBusca").value.trim();

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
  const idsJaSelecionados = new Set(chavesEntrada.map((c) => c.id));
  const listaFiltrada = lista.filter((c) => !idsJaSelecionados.has(c.idChave));

  if (!listaFiltrada.length) {
    dropdown.innerHTML = `<div class="autocomplete-empty">
      ${
        lista.length === 0
          ? "Nenhuma chave disponível."
          : "Todas as chaves encontradas já foram adicionadas."
      }
    </div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = listaFiltrada
    .map(
      (c) => `
      <div class="autocomplete-item"
        onclick="selecionarChave(${c.idChave}, '${c.descricao}', '${c.tipo}')">
        <span class="autocomplete-nome">${c.descricao}</span>
        <span class="autocomplete-detalhe">${c.tipo}</span>
      </div>`,
    )
    .join("");

  dropdown.classList.remove("hidden");
}

window.selecionarChave = function (id, descricao, tipo) {
  if (chavesEntrada.length >= MAX_CHAVES) {
    alert(
      `Não é possível associar mais de ${MAX_CHAVES} chaves a uma entrada.`,
    );
    return;
  }
  if (chavesEntrada.some((c) => c.id === id)) return;

  chavesEntrada.push({ id, descricao, tipo });
  document.getElementById("eChaveBusca").value = "";
  fecharDropdown("dropdownChave");
  renderChipsChaves();
};

window.removerChave = function (id) {
  chavesEntrada = chavesEntrada.filter((c) => c.id !== id);
  renderChipsChaves();
};

function renderChipsChaves() {
  const container = document.getElementById("chavesAdicionadas");

  if (chavesEntrada.length === 0) {
    container.innerHTML = "";
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  container.innerHTML = chavesEntrada
    .map(
      (c) => `
      <div class="selected-chip">
        <span>${c.descricao} <span style="opacity:.6">(${c.tipo})</span></span>
        <button type="button" onclick="removerChave(${c.id})">✕</button>
      </div>`,
    )
    .join("");
}

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
  if (!isOn) limparTodasChaves();
};

function limparTodasChaves() {
  chavesEntrada = [];
  document.getElementById("eChaveBusca").value = "";
  renderChipsChaves();
  fecharDropdown("dropdownChave");
}

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
    return showMsg(
      "msgBoxEntrada",
      "Selecione um funcionário na lista de sugestões.",
    );

  if (!isFuncionario && !idVisitante)
    return showMsg(
      "msgBoxEntrada",
      "Selecione um visitante na lista de sugestões.",
    );

  const body = {
    observacoes: document.getElementById("eObs").value.trim() || null,
  };

  if (isFuncionario) {
    body.idFuncionario = parseInt(idFuncionario);
    body.tipoEntrada = "FUNCIONARIO";
  } else {
    body.idVisitante = parseInt(idVisitante);
    body.tipoVisita = tipo.toUpperCase();
    body.tipoEntrada = "VISITANTE";
    body.setorDestino =
      document.getElementById("eSetorDestino").value.trim() || null;
    const idResp = document.getElementById("eIdFuncResponsavel").value;
    if (idResp) body.idFuncionarioResponsavel = parseInt(idResp);
  }

  if (chavesEntrada.length > 0) {
    body.entregasChave = chavesEntrada.map((c) => ({ idChave: c.id }));
  }

  try {
    await fetchData("movimentacoes/entrada", {
      method: "POST",
      body: body,
    });
    closeModal("modalEntrada");
    clearEntradaForm();
    carregarMovimentacoes();
  } catch (err) {
    showMsg(
      "msgBoxEntrada",
      err.message ?? "Erro ao registar entrada.",
      "error",
    );
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
  limparTodasChaves();
  clearMsg("msgBoxEntrada");
  document.getElementById("eObs").value = "";
  document.getElementById("eTipo").value = "funcionario";
  document.getElementById("keyToggle").classList.remove("on");
  document.getElementById("keyToggleIcon").textContent = "";
  document.getElementById("keySection").classList.add("hidden");
  window.toggleEntradaTipo();
}
