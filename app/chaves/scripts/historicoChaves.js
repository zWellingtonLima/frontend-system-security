import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";

const TABLE_CONFIG = {
  campos: [
    "descricao",
    "tipo",
    "sala",
    "nomePessoa",
    "horaEntrega",
    "horaDevolucao",
    "devolvidaPor",
  ],
  tbodySelector: "#tbodyHistoricoChaves",
  renderCampo: {
    tipo: (item) => (item.tipo === "CHAVE" ? "Chave" : "Molho"),
    sala: (item) => item.sala ?? "—",
    horaEntrega: (item) => formatDate(item.horaEntrega),
    horaDevolucao: (item) => formatDate(item.horaDevolucao),
    devolvidaPor: (item) => item.devolvidaPor ?? "—",
  },
};

function carregarHistorico(endpoint = "chaves/historico") {
  renderTable({ endpoint, ...TABLE_CONFIG });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      carregarHistorico(btn.dataset.endpoint);
    });
  });

  carregarHistorico();
});
