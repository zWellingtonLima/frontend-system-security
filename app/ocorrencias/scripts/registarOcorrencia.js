import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { fillSelect } from "../../shared/scripts/UI/fillSelects.js";
import { carregarOcorrencias } from "./carregarOcorrencias.js";

const tipos = await fetchData("lists/tipos-ocorrencia");
fillSelect("#tipoOcorrencia", tipos, "valor", "label");

const form = document.querySelector("#formOcorrencia");
const alertEl = document.querySelector("#alertOcorrencia");

function showAlert(mensagem, tipo = "success") {
  alertEl.textContent = mensagem;
  alertEl.className = `alert alert-${tipo}`;
  alertEl.classList.remove("hidden");
  setTimeout(() => alertEl.classList.add("hidden"), 4000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await fetchData("ocorrencias", {
      method: "POST",
      body: {
        tipoOcorrencia: form.tipoOcorrencia.value,
        ocorrencia: form.descricao.value,
      },
    });

    showAlert("Ocorrência registada com sucesso!");
    form.reset();
    carregarOcorrencias();
  } catch {
    showAlert("Erro ao registar ocorrência.", "error");
  }
});