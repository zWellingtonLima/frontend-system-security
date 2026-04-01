import { clearMsg, showMsg } from "../../shared/scripts/UI/messageBox.js";

import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { fetchData } from "../../shared/scripts/utils/fetchData.js";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const _timers = {};

document.addEventListener("DOMContentLoaded", carregarEmprestadas);

async function carregarEmprestadas() {
  await renderTable({
    endpoint: "chaves/emprestadas",
    campos: ["descricao", "tipo", "sala", "nomePessoa", "horaEntrega", "acao"],
    tbodySelector: "#tbodyEmprestadas",
    renderCampo: {
      tipo: (item) => (item.tipo === "CHAVE" ? "Chave" : "Molho"),
      sala: (item) => item.sala ?? "—",
      horaEntrega: (item) => formatDate(item.horaEntrega),
      acao: (item) => {
        const dataAttr = encodeURIComponent(JSON.stringify(item));
        return `
          <button class="btn btn-sm btn-primary"
            onclick="abrirDevolucao(decodeAndParse('${dataAttr}'))">
            Devolver
          </button>`;
      },
    },
  });
}

window.decodeAndParse = (encoded) => JSON.parse(decodeURIComponent(encoded));

window.abrirDevolucao = function (item) {
  document.getElementById("cIdEntrega").value = item.idEntrega;
  document.getElementById("cDescricaoChave").value = item.descricao;
  document.getElementById("cNomePessoa").value = item.nomePessoa ?? "—";
  document.getElementById("cDevolvidaPor").value = "";
  clearMsg("msgBoxChave");
  openModal("modalDevolucaoChave");
};

window.confirmarDevolucaoChave = async function () {
  clearMsg("msgBoxChave");

  const idEntrega = document.getElementById("cIdEntrega").value;
  const devolvidaPor = document.getElementById("cDevolvidaPor").value.trim();

  if (!devolvidaPor)
    return showMsg("msgBoxChave", "Indique quem está a devolver a chave.");

  try {
    await fetchData(
      `chaves/devolucao/${idEntrega}?devolvidaPor=${encodeURIComponent(devolvidaPor)}`,
      { method: "PATCH" },
    );

    closeModal("modalDevolucaoChave");
    carregarEmprestadas();
  } catch (err) {
    showMsg("msgBoxChave", err.message ?? "Erro ao registar devolução.");
  }
};

// ─────────────────────────────────────────────
// AUTOCOMPLETE — ENTRADAS ATIVAS
// ─────────────────────────────────────────────
window.onEntradaAtivaInput = function () {
  const query = document.getElementById("cNomePessoaEntrega").value.trim();
  document.getElementById("cIdMovimentacao").value = "";

  if (query.length < 2) {
    fecharDropdown("dropdownEntradaAtiva");
    return;
  }

  debounce("busca_entrada_ativa", async () => {
    const lista = await fetchData(
      `busca/entradas-ativas?nome=${encodeURIComponent(query)}`,
    );
    renderDropdownEntradaAtiva(lista ?? []);
  });
};

function renderDropdownEntradaAtiva(lista) {
  const dropdown = document.getElementById("dropdownEntradaAtiva");

  if (!lista.length) {
    dropdown.innerHTML = `<div class="autocomplete-empty">
      Nenhuma pessoa disponível no edifício.
    </div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = lista
    .map((e) => {
      const dataAttr = encodeURIComponent(JSON.stringify(e));
      return `
        <div class="autocomplete-item"
          onclick="selecionarEntradaAtiva(decodeAndParse('${dataAttr}'))">
          <span class="autocomplete-nome">${e.nomePessoa}</span>
          <span class="autocomplete-detalhe">${e.setorDestino ?? "—"}</span>
        </div>`;
    })
    .join("");

  dropdown.classList.remove("hidden");
}

window.selecionarEntradaAtiva = function (entrada) {
  document.getElementById("cIdMovimentacao").value = entrada.idMovimentacao;
  document.getElementById("cNomePessoaEntrega").value = entrada.nomePessoa;
  document.getElementById("pessoaEntregaLabel").textContent =
    `${entrada.nomePessoa} — ${entrada.setorDestino ?? "—"}`;
  document.getElementById("pessoaSelecionadaInfo").classList.remove("hidden");
  fecharDropdown("dropdownEntradaAtiva");
};

window.limparPessoaEntrega = function () {
  document.getElementById("cIdMovimentacao").value = "";
  document.getElementById("cNomePessoaEntrega").value = "";
  document.getElementById("pessoaSelecionadaInfo").classList.add("hidden");
  document.getElementById("pessoaEntregaLabel").textContent = "";
};

// ─────────────────────────────────────────────
// DEBOUNCE
// ─────────────────────────────────────────────
function debounce(key, fn, ms = DEBOUNCE_MS) {
  clearTimeout(_timers[key]);
  _timers[key] = setTimeout(fn, ms);
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
// AUTOCOMPLETE — CHAVE (entrega avulsa)
// Reutiliza o mesmo endpoint de busca de chaves disponíveis
// ─────────────────────────────────────────────
window.onChaveBuscaEntregaInput = function () {
  const query = document.getElementById("cChaveBuscaEntrega").value.trim();

  if (!query.length) {
    fecharDropdown("dropdownChaveEntrega");
    return;
  }

  debounce("busca_chave_entrega", async () => {
    const lista = await fetchData(
      `busca/chaves?q=${encodeURIComponent(query)}`,
    );
    renderDropdownChaveEntrega(lista ?? []);
  });
};

function renderDropdownChaveEntrega(lista) {
  const dropdown = document.getElementById("dropdownChaveEntrega");

  if (!lista.length) {
    dropdown.innerHTML = `<div class="autocomplete-empty">Nenhuma chave disponível.</div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = lista
    .map(
      (c) => `
      <div class="autocomplete-item"
        onclick="selecionarChaveEntrega(${c.idChave}, '${c.descricao}', '${c.tipo}')">
        <span class="autocomplete-nome">${c.descricao}</span>
        <span class="autocomplete-detalhe">${c.tipo}</span>
      </div>`,
    )
    .join("");

  dropdown.classList.remove("hidden");
}

window.selecionarChaveEntrega = function (id, descricao, tipo) {
  document.getElementById("cIdChaveEntrega").value = id;
  document.getElementById("cChaveBuscaEntrega").value = "";
  document.getElementById("chaveLabelEntrega").textContent =
    `${descricao} (${tipo})`;
  document.getElementById("chaveEntregaSelecionada").classList.remove("hidden");
  fecharDropdown("dropdownChaveEntrega");
};

window.limparChaveEntrega = function () {
  document.getElementById("cIdChaveEntrega").value = "";
  document.getElementById("cChaveBuscaEntrega").value = "";
  document.getElementById("chaveEntregaSelecionada").classList.add("hidden");
  document.getElementById("chaveLabelEntrega").textContent = "";
};
// ─────────────────────────────────────────────
// AUTOCOMPLETE — DEVOLVIDA POR
// ─────────────────────────────────────────────

window.onDevolvidaPorInput = function () {
  const query = document.getElementById("cDevolvidaPor").value.trim();

  if (query.length < 2) {
    fecharDropdown("dropdownDevolvidaPor");
    return;
  }

  debounce("busca_devolvida_por", async () => {
    const lista = await fetchData(`busca?nome=${encodeURIComponent(query)}`);
    renderDropdownDevolvidaPor(lista ?? []);
  });
};

function renderDropdownDevolvidaPor(lista) {
  const dropdown = document.getElementById("dropdownDevolvidaPor");

  if (!lista.length) {
    dropdown.innerHTML = `<div class="autocomplete-empty">Nenhuma pessoa encontrada.</div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  dropdown.innerHTML = lista
    .map(
      (p) => `
            <div class="autocomplete-item" onclick="selecionarDevolvidaPor('${p.nome}', '${p.tipo}')">
                <span>${p.nome}</span>
                <span class="autocomplete-badge ${p.tipo === "FUNCIONARIO" ? "badge-func" : "badge-visit"}">
                    ${p.tipo === "FUNCIONARIO" ? "Funcionário" : "Visitante"}
                </span>
            </div>`,
    )
    .join("");

  dropdown.classList.remove("hidden");
}

function selecionarDevolvidaPor(nome, tipo) {
  document.getElementById("cDevolvidaPor").value = nome;
  // se precisar guardar o tipo junto:
  document.getElementById("cDevolvidaPorTipo").value = tipo;
  fecharDropdown("dropdownDevolvidaPor");
}
// ─────────────────────────────────────────────
// SUBMISSÃO — ENTREGA AVULSA
// ─────────────────────────────────────────────
window.confirmarEntregaAvulsa = async function () {
  clearMsg("msgBoxEntregarChave");

  const idMovimentacao = document.getElementById("cIdMovimentacao").value;
  const idChave = document.getElementById("cIdChaveEntrega").value;

  if (!idMovimentacao)
    return showMsg(
      "msgBoxEntregarChave",
      "Selecione uma pessoa na lista de sugestões.",
    );

  if (!idChave)
    return showMsg("msgBoxEntregarChave", "Selecione uma chave disponível.");

  try {
    await fetchData("chaves/entregar", {
      method: "POST",
      body: {
        idMovimentacao: parseInt(idMovimentacao),
        idChave: parseInt(idChave),
      },
    });

    closeModal("modalEntregarChave");
    limparFormEntregaAvulsa();
    carregarEmprestadas();
  } catch (err) {
    showMsg("msgBoxEntregarChave", err.message ?? "Erro ao registar entrega.");
  }
};

function limparFormEntregaAvulsa() {
  limparPessoaEntrega();
  limparChaveEntrega();
  clearMsg("msgBoxEntregarChave");
}
