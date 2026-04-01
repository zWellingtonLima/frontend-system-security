import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { carregarHistorico, carregarUltimasLeituras } from "./carregarConsumos.js";

// Abre o modal de edição com os dados do consumo
export function abrirModalEdicao(item, tiposConsumo) {
  // Remove modal anterior se existir
  document.querySelector("#modalEdicaoConsumo")?.remove();

  const modal = document.createElement("div");
  modal.id = "modalEdicaoConsumo";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-box">
      <div class="card-title">Editar Leitura</div>

      <div class="form-group">
        <label>Tipo de Consumo</label>
        <select id="editTipo">
          ${tiposConsumo.map(t => `
            <option value="${t.valor}" ${t.label === item.tipoConsumo ? "selected" : ""}>
              ${t.label}
            </option>
          `).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Valor da Leitura</label>
        <input id="editValor" type="number" min="0" value="${item.valorLeitura}" />
      </div>

      <div class="form-group">
        <label>Observação</label>
        <input id="editObs" type="text" maxlength="200" value="${item.observacao ?? ""}" placeholder="Opcional" />
      </div>

      <div class="modal-actions">
        <button id="btnCancelarEdicao" class="btn btn-secondary">Cancelar</button>
        <button id="btnGuardarEdicao" class="btn btn-primary">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fechar ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.querySelector("#btnCancelarEdicao").addEventListener("click", () => {
    modal.remove();
  });

  document.querySelector("#btnGuardarEdicao").addEventListener("click", async () => {
    const btn = document.querySelector("#btnGuardarEdicao");
    btn.disabled = true;
    btn.textContent = "A guardar...";

    const payload = {
      tipoConsumo: document.querySelector("#editTipo").value,
      valorLeitura: parseInt(document.querySelector("#editValor").value),
      observacao: document.querySelector("#editObs").value.trim() || null,
    };

    try {
      await fetchData(`consumos/${item.id}`, {
        method: "PUT",
        body: payload,
      });

      modal.remove();
      carregarHistorico();
      carregarUltimasLeituras();
    } catch (err) {
      console.error("Erro ao editar consumo:", err);
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  });
}