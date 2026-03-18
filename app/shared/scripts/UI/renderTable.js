import { fetchData } from "../utils/fetchData.js";

export async function renderTable({ endpoint, campos, tbodySelector }) {
  const tbody = document.querySelector(tbodySelector);

  tbody.innerHTML = `<tr><td colspan="${campos.length}">Carregando...</td></tr>`;

  try {
    const data = await fetchData(endpoint);

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="${campos.length}">Nenhum registo foi encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = campos
        .map((campo) => `<td>${item[campo] ?? "—"}</td>`)
        .join("");

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(`Erro ao carregar "${endpoint}":`, err);
    tbody.innerHTML = `<tr><td colspan="${campos.length}" class="error">Erro ao carregar dados.</td></tr>`;
  }
}
