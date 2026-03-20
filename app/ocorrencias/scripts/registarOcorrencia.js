import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { fillSelect } from "../../shared/scripts/UI/fillSelects.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";

const tipos = await fetchData("lists/tipos-ocorrencia");
fillSelect("#tipoOcorrencia", tipos, "valor", "label");

// Pra renderizar o historico
renderTable({
  endpoint: "ocorrencias",
  campos: ["createDate", "createUser", "tipoOcorrencia", "ocorrencia"],
  tbodySelector: "#tbodyOcorrencias",
  renderCampo: {
    createDate: (item) => formatDate(item.createDate),
  },
});

// Cria uma nova ocorrencia
const form = document.querySelector("#formOcorrencia");
const alert = document.querySelector("#alertOcorrencia");

function showAlert(mensagem, tipo = "success") {
  alert.textContent = mensagem;
  alert.className = `alert alert-${tipo}`;
  alert.classList.remove("hidden");
  setTimeout(() => alert.classList.add("hidden"), 4000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("Valor enviado ao backend: ", form.tipoOcorrencia.value);

  try {
    await fetchData("ocorrencias", {
      method: "POST",
      body: JSON.stringify({
        tipoOcorrencia: form.tipoOcorrencia.value,
        ocorrencia: form.descricao.value,
      }),
    });

    showAlert("Ocorrência registada com sucesso!");
    form.reset();

    // Atualiza a tabela após registrar
    renderTable({
      endpoint: "ocorrencias",
      campos: ["createDate", "createUser", "tipoOcorrencia", "ocorrencia"],
      tbodySelector: "#tbodyOcorrencias",
      renderCampo: {
        createDate: (item) => formatDate(item.createDate),
      },
    });
  } catch {
    showAlert("Erro ao registar ocorrência.", "error");
  }
});
