import { renderTable } from "../../shared/scripts/UI/renderTable.js";

renderTable({
  endpoint: "funcionarios",
  campos: ["nomeFuncionario", "numeroFuncionario", "setor", "registadoEm"],
  tbodySelector: "#tbodyFuncionarios",
});

// Render para Visitantes
renderTable({
  endpoint: "visitantes",
  campos: ["nomeVisitante", "empresa", "documentoIdentificacao", "registadoEm"],
  tbodySelector: "#tbodyVisitantes",
});
