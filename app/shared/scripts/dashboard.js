import { fetchData } from "./utils/fetchData.js";
import { formatDate } from "./utils/formatDate.js";

document.addEventListener("DOMContentLoaded", carregarDashboard);

async function carregarDashboard() {
  // Duas chamadas paralelas — não há dependência entre elas
  const [movimentacoes, chaves, ocorrencias] = await Promise.all([
    fetchData("lists/movimentacoes/ativas"),
    fetchData("chaves/emprestadas"),
    fetchData("ocorrencias"),
  ]);

  preencherStats(movimentacoes ?? [], chaves ?? [], ocorrencias ?? []);
  renderPresentes(movimentacoes ?? []);
  renderChavesAtivas(chaves ?? []);
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
function preencherStats(movimentacoes, chaves, ocorrencias) {
  const visitas = movimentacoes.filter((m) => m.tipoPessoa === "VISITANTE");
  const hoje = new Date().toDateString();
  const ocorrenciasHoje = ocorrencias.filter(
    (o) => new Date(o.createDate).toDateString() === hoje,
  );

  document.getElementById("statDentro").textContent = movimentacoes.length;
  document.getElementById("statVisitas").textContent = visitas.length;
  document.getElementById("statChaves").textContent = chaves.length;
  document.getElementById("statRondas").textContent = ocorrenciasHoje.length;
}

// ─────────────────────────────────────────────
// PAINEL — PRESENTES
// ─────────────────────────────────────────────
function renderPresentes(movimentacoes) {
  const container = document.getElementById("dashPresentes");

  if (!movimentacoes.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏢</div>
        Ninguém registado
      </div>`;
    return;
  }

  const visiveis = movimentacoes.slice(0, 10);
  const restantes = movimentacoes.length - visiveis.length;

  container.innerHTML =
    visiveis
      .map(
        (m) => `
      <div class="dash-list-item">
        <div class="dash-list-main">
          <span class="dash-list-nome">${m.nomePessoa}</span>
          <span class="dash-list-badge">${formatTipo(m.tipoPessoa, m.tipoVisita)}</span>
        </div>
        <div class="dash-list-sub">
          <span>${m.setorDestino ?? "—"}</span>
          <span>${formatDate(m.horaEntrada)}</span>
        </div>
      </div>`,
      )
      .join("") +
    (restantes > 0
      ? `<div class="dash-list-more"><a href="./movimentacoes/movimentacoes.html">+ ${restantes} mais</a></div>`
      : "");
}

// ─────────────────────────────────────────────
// PAINEL — CHAVES ATIVAS
// ─────────────────────────────────────────────
function renderChavesAtivas(chaves) {
  const container = document.getElementById("dashChavesAtivas");

  if (!chaves.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔑</div>
        Nenhuma chave emprestada
      </div>`;
    return;
  }

  const visiveis = chaves.slice(0, 10);
  const restantes = chaves.length - visiveis.length;

  container.innerHTML =
    visiveis
      .map(
        (c) => `
      <div class="dash-list-item">
        <div class="dash-list-main">
          <span class="dash-list-nome">${c.descricao}</span>
          <span class="dash-list-badge">${c.tipo === "CHAVE" ? "Chave" : "Molho"}</span>
        </div>
        <div class="dash-list-sub">
          <span>${c.nomePessoa ?? "—"}</span>
          <span>${formatDate(c.horaEntrega)}</span>
        </div>
      </div>`,
      )
      .join("") +
    (restantes > 0
      ? `<div class="dash-list-more"><a href="./chaves/chaves.html">+ ${restantes} mais</a></div>`
      : "");
}

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
function formatTipo(tipoPessoa, tipoVisita) {
  if (tipoPessoa === "FUNCIONARIO") return "Funcionário";
  const labels = {
    visita: "Visita",
    servico: "Serviço",
    entrega: "Entrega",
    manutencao: "Manutenção",
  };
  return labels[tipoVisita?.toLowerCase()] ?? tipoVisita ?? "—";
}
