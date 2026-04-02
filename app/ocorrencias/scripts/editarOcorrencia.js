import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { carregarOcorrencias } from "./carregarOcorrencias.js";

const ESTADOS = [
  { valor: "PENDENTE", label: "🟡 Pendente" },
  { valor: "EM_ANALISE", label: "🔵 Em Análise" },
  { valor: "RESOLVIDA", label: "🟢 Resolvida" },
  { valor: "CANCELADA", label: "🔴 Cancelada" },
];

let ocorrenciaAtualId = null;

document
  .getElementById("modalEdicaoOcorrencia")
  .addEventListener("modalClosed", () => {
    document.querySelector("#formEdicaoOcorrencia").reset();
    ocorrenciaAtualId = null;
  });

export function abrirModalEdicaoOcorrencia(item) {
  ocorrenciaAtualId = item.id;

  document.querySelector("#editTipoOcorrencia").value =
    item.tipoOcorrencia.tipoOcorrencia ?? "";
  document.querySelector("#editDescricao").value = item.ocorrencia ?? "";

  // Renderizar botões de estado
  const selector = document.querySelector("#estadoSelector");
  selector.innerHTML = ESTADOS.map(
    (e) => `
    <button
      type="button"
      class="btn-estado ${e.valor === item.estado ? "ativo" : ""}"
      data-estado="${e.valor}"
    >${e.label}</button>
  `,
  ).join("");

  openModal("modalEdicaoOcorrencia");
}

// Seleção de estado — delegado no selector estático
document.querySelector("#estadoSelector").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-estado");
  if (!btn) return;
  document
    .querySelectorAll("#estadoSelector .btn-estado")
    .forEach((b) => b.classList.remove("ativo"));
  btn.classList.add("ativo");
});

document
  .querySelector("#formEdicaoOcorrencia")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "A guardar...";

    const tipoOcorrencia = document
      .querySelector("#editTipoOcorrencia")
      .value.trim();

    const estadoSelecionado = document.querySelector(
      "#estadoSelector .btn-estado.ativo",
    )?.dataset.estado;

    const payload = {
      ocorrencia: document.querySelector("#editDescricao").value.trim(),
      estado: estadoSelecionado,
      tipoOcorrencia: tipoOcorrencia,
    };

    try {
      await fetchData(`ocorrencias/${ocorrenciaAtualId}`, {
        method: "PUT",
        body: payload,
      });
      closeModal("modalEdicaoOcorrencia");
      carregarOcorrencias();
    } catch (err) {
      console.error("Erro ao guardar ocorrência:", err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  });
