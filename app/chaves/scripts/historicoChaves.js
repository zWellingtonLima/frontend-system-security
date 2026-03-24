import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";

document.addEventListener("DOMContentLoaded", () => {
  renderTable({
    endpoint: "chaves/historico",
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
  });
});
