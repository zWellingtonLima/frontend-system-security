import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { fillSelect } from "../../shared/scripts/UI/fillSelects.js";
import {
  carregarHistorico,
  carregarUltimasLeituras,
} from "./carregarConsumos.js";

let consumoAtualId = null;

// Resetar formulário quando o modal fechar
document
  .getElementById("modalEdicaoConsumo")
  .addEventListener("modalClosed", () => {
    document.querySelector("#formEdicaoConsumo").reset();
    consumoAtualId = null;
  });

export function abrirModalEdicao(item, tiposConsumo) {
  consumoAtualId = item.id;
  fillSelect("#editTipo", tiposConsumo, "valor", "label", item.tipoConsumo);
  document.querySelector("#editValor").value = item.valorLeitura;
  document.querySelector("#editObs").value = item.observacao ?? "";
  openModal("modalEdicaoConsumo");
}

document
  .querySelector("#formEdicaoConsumo")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "A guardar...";

    const payload = {
      tipoConsumo: document.querySelector("#editTipo").value,
      valorLeitura: parseInt(document.querySelector("#editValor").value),
      observacao: document.querySelector("#editObs").value.trim() || null,
    };

    try {
      await fetchData(`consumos/${consumoAtualId}`, {
        method: "PUT",
        body: payload,
      });
      closeModal("modalEdicaoConsumo");
      carregarHistorico();
      carregarUltimasLeituras();
    } catch (err) {
      console.error("Erro ao editar consumo:", err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  });
