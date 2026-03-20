import { fetchData } from "../utils/fetchData.js";

export async function renderTable({
  endpoint,
  campos,
  tbodySelector,
  renderCampo,
}) {
  const tbody = document.querySelector(tbodySelector);

  tbody.innerHTML = `<tr><td colspan="${campos.length}">Carregando...</td></tr>`;

  try {
    const data = await fetchData(endpoint);

    if (!data.length) {
      tbody.innerHTML = `
        <tr><td colspan="${campos.length}">
          <div class="empty-state">
            <div class="icon">📊</div>
            Nenhum registo encontrado
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    data.forEach((item) => {
      console.log(item);

      const tr = document.createElement("tr");
      tr.innerHTML = campos
        .map((campo) => {
          const custom = renderCampo?.[campo];
          // Ou seja, se existir um campo customizado (como o de consumos), rnderiza-o
          return `<td>${custom ? custom(item) : (item[campo] ?? "—")}</td>`;
        })
        .join("");

      tbody.prepend(tr);
    });
  } catch (err) {
    console.error(`[renderTable] Erro ao carregar "${endpoint}":`, err);
    tbody.innerHTML = `
      <tr><td colspan="${campos.length}" class="alert alert-error">
        Erro ao carregar dados.
      </td></tr>`;
  }
}
