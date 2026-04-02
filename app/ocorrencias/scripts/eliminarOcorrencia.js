import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { carregarOcorrencias } from "./carregarOcorrencias.js";

let ocorrenciaParaEliminarId = null;

document
  .getElementById("modalEliminarOcorrencia")
  .addEventListener("modalClosed", () => {
    ocorrenciaParaEliminarId = null;
  });

export function abrirModalEliminarOcorrencia(id) {
  ocorrenciaParaEliminarId = id;
  openModal("modalEliminarOcorrencia");
}

document
  .querySelector("#btnConfirmarEliminar")
  .addEventListener("click", async () => {
    const btn = document.querySelector("#btnConfirmarEliminar");
    btn.disabled = true;
    btn.textContent = "A eliminar...";

    try {
      await fetchData(`ocorrencias/${ocorrenciaParaEliminarId}`, {
        method: "DELETE",
      });
      closeModal("modalEliminarOcorrencia");
      carregarOcorrencias();
    } catch (err) {
      console.error("Erro ao eliminar ocorrência:", err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Eliminar";
    }
  });
