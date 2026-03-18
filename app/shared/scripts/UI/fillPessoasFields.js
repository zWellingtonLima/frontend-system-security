import { fetchData } from "../utils/fetchData.js";

const renderTable = async (endpoint, campos, tbodySelector) => {
  const tbody = document.querySelector(tbodySelector);
  const data = await fetchData(endpoint);

  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = campos
      .map((campo) => `<td>${item[campo] ?? "-"}</td>`)
      .join("");
    tbody.appendChild(tr);
  });
};

// Para adicionar mais algum dado na tabela basta adicionar no array
// Para para Funcionarios
renderTable(
  "funcionarios",
  ["nomeFuncionario", "numeroFuncionario", "setor"],
  "#tbodyFuncionarios",
);

// Render para Visitantes
renderTable(
  "visitantes",
  ["nomeVisitante", "empresa", "documentoIdentificacao"],
  "#tbodyVisitantes",
);
