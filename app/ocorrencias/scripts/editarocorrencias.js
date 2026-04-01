import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { carregarOcorrencias } from "./carregarOcorrencias.js";

const ESTADOS = [
  { valor: "pendente", label: "🟡 Pendente" },
  { valor: "ativo",    label: "🔵 Ativo"    },
  { valor: "resolvido",label: "🟢 Resolvido"},
];

export function abrirModalEdicaoOcorrencia(item) {
  document.querySelector("#modalEdicaoOcorrencia")?.remove();

  const estadoAtual = item.estado ?? "pendente";

  const modal = document.createElement("div");
  modal.id = "modalEdicaoOcorrencia";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-box">
      <div class="card-title">Editar Ocorrência</div>

      <div class="form-group">
        <label>Tipo de Ocorrência</label>
        <input id="editTipoOcorrencia" type="text" value="${item.tipoOcorrencia ?? ""}" disabled />
      </div>

      <div class="form-group">
        <label>Descrição</label>
        <textarea id="editDescricao" maxlength="500" rows="4">${item.ocorrencia ?? ""}</textarea>
      </div>

      <div class="form-group">
        <label>Estado</label>
        <div class="estado-selector">
          ${ESTADOS.map(e => `
            <button
              type="button"
              class="btn-estado ${e.valor === estadoAtual ? "ativo" : ""}"
              data-estado="${e.valor}"
            >${e.label}</button>
          `).join("")}
        </div>
      </div>

      <div class="modal-actions">
        <button id="btnCancelarEdicaoOcorrencia" class="btn btn-secondary">Cancelar</button>
        <button id="btnGuardarEdicaoOcorrencia" class="btn btn-primary">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fechar ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // Seleção de estado
  modal.querySelectorAll(".btn-estado").forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.querySelectorAll(".btn-estado").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
    });
  });

  document.querySelector("#btnCancelarEdicaoOcorrencia").addEventListener("click", () => {
    modal.remove();
  });

  document.querySelector("#btnGuardarEdicaoOcorrencia").addEventListener("click", async () => {
    const btn = document.querySelector("#btnGuardarEdicaoOcorrencia");
    btn.disabled = true;
    btn.textContent = "A guardar...";

    const estadoSelecionado = modal.querySelector(".btn-estado.ativo")?.dataset.estado ?? "pendente";

    const payload = {
      ocorrencia: document.querySelector("#editDescricao").value.trim(),
      estado: estadoSelecionado,
    };

    try {
      await fetchData(`ocorrencias/${item.id}`, {
        method: "PUT",
        body: payload,
      });

      modal.remove();
      carregarOcorrencias();
    } catch (err) {
      console.error("Erro ao guardar ocorrência:", err);
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  });
}