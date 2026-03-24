import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";

document.addEventListener("DOMContentLoaded", () => {
  renderTable({
    endpoint: "lists/movimentacoes/todas",
    campos: ["nomePessoa", "tipoPessoa", "horaEntrada", "horaSaida", "duracao"],
    tbodySelector: "#tbodyHistorico",
    renderCampo: {
      nomePessoa: (item) => item.nomePessoa ?? "—",
      tipoPessoa: (item) => formatTipo(item.tipoPessoa, item.tipoVisita),
      horaEntrada: (item) => formatDate(item.horaEntrada),
      horaSaida: (item) => formatDate(item.horaSaida),
      duracao: (item) => calcularDuracao(item.horaEntrada, item.horaSaida),
    },
  });
});

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
