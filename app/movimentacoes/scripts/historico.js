import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { fetchData } from "../../shared/scripts/utils/fetchData.js";

const NUM_COLS = 5;
let todasMovimentacoes = [];

document.addEventListener("DOMContentLoaded", async () => {
  await carregarHistorico();

  document.getElementById("filtroDataDe").addEventListener("change", aplicarFiltro);
  document.getElementById("filtroDataAte").addEventListener("change", aplicarFiltro);
  document.getElementById("btnLimparFiltro").addEventListener("click", () => {
    document.getElementById("filtroDataDe").value = "";
    document.getElementById("filtroDataAte").value = "";
    renderHistorico(todasMovimentacoes);
  });
});

async function carregarHistorico() {
  const tbody = document.querySelector("#tbodyHistorico");
  tbody.innerHTML = `<tr><td colspan="${NUM_COLS}">A carregar...</td></tr>`;

  try {
    todasMovimentacoes = await fetchData("lists/movimentacoes/todas") ?? [];
  } catch {
    tbody.innerHTML = `<tr><td colspan="${NUM_COLS}" class="alert alert-error">Erro ao carregar dados.</td></tr>`;
    return;
  }

  renderHistorico(todasMovimentacoes);
}

function aplicarFiltro() {
  const de = document.getElementById("filtroDataDe").value;   // "yyyy-MM-dd" ou ""
  const ate = document.getElementById("filtroDataAte").value; // "yyyy-MM-dd" ou ""

  const lista = todasMovimentacoes.filter((item) => {
    if (!item.horaEntrada) return false;
    const dataEntrada = item.horaEntrada.substring(0, 10);
    if (de && ate) return dataEntrada >= de && dataEntrada <= ate;
    if (de)        return dataEntrada === de;
    if (ate)       return dataEntrada <= ate;
    return true;
  });

  renderHistorico(lista);
}

function renderHistorico(lista) {
  const tbody = document.querySelector("#tbodyHistorico");

  if (!lista.length) {
    tbody.innerHTML = `
      <tr><td colspan="${NUM_COLS}">
        <div class="empty-state">
          <div class="icon">📊</div>
          Nenhum registo encontrado
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map((item) => `
      <tr>
        <td>${item.nomePessoa ?? "—"}</td>
        <td>${formatTipo(item.tipoPessoa, item.tipoVisita)}</td>
        <td>${formatDate(item.horaEntrada)}</td>
        <td>${formatDate(item.horaSaida)}</td>
        <td>${calcularDuracao(item.horaEntrada, item.horaSaida)}</td>
      </tr>`)
    .join("");
}

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

function calcularDuracao(entrada, saida) {
  if (!entrada || !saida) return "—";
  const diff = new Date(saida) - new Date(entrada);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
