import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";

renderTable({
  endpoint: "funcionarios",
  campos: ["nomeFuncionario", "numeroFuncionario", "setor", "registadoEm", "acoes"],
  tbodySelector: "#tbodyFuncionarios",
  renderCampo: {
    registadoEm: (item) => formatDate(item.registadoEm),
    acoes: (item) =>
      `<button class="btn btn-sm btn-ghost" onclick="abrirEdicaoFuncionario('${encodeURIComponent(JSON.stringify(item))}')">✏️ Editar</button>`,
  },
});

// Render para Visitantes
renderTable({
  endpoint: "visitantes",
  campos: ["nomeVisitante", "empresa", "documentoIdentificacao", "registadoEm", "acoes"],
  tbodySelector: "#tbodyVisitantes",
  renderCampo: {
    registadoEm: (item) => formatDate(item.registadoEm),
    acoes: (item) =>
      `<button class="btn btn-sm btn-ghost" onclick="abrirEdicaoVisitante('${encodeURIComponent(JSON.stringify(item))}')">✏️ Editar</button>`,
  },
});
