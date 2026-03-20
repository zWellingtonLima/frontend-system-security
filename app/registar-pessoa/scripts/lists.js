import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";

renderTable({
  endpoint: "funcionarios",
  campos: ["nomeFuncionario", "numeroFuncionario", "setor", "registadoEm"],
  tbodySelector: "#tbodyFuncionarios",
  renderCampo: {
    registadoEm: (item) => formatDate(item.registadoEm),
  },
});

// Render para Visitantes
renderTable({
  endpoint: "visitantes",
  campos: ["nomeVisitante", "empresa", "documentoIdentificacao", "registadoEm"],
  tbodySelector: "#tbodyVisitantes",
  renderCampo: {
    registadoEm: (item) => formatDate(item.registadoEm),
  },
});
