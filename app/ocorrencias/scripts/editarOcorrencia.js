import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { carregarOcorrencias } from "./carregarOcorrencias.js";

const TIPO_OCORRENCIA_LABELS = {
  OBJETO_PERDIDO_ENCONTRADO: "Objeto Perdido / Encontrado",
  AVARIA_EQUIPAMENTO: "Avaria Equipamento",
  ACESSO_NAO_AUTORIZADO: "Acesso não Autorizado",
  INCIDENTE_COM_VISITANTE: "Incidente com Visitante",
  ALARME_DISPARADO: "Alarme Disparado",
  OUTROS: "Outros",
};

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

  const tipoRaw = item.tipoOcorrencia.tipoOcorrencia ?? "";
  const selectTipo = document.querySelector("#editTipoOcorrencia");
  selectTipo.innerHTML = Object.entries(TIPO_OCORRENCIA_LABELS)
    .map(([valor, label]) => `<option value="${valor}">${label}</option>`)
    .join("");
  selectTipo.value = tipoRaw;
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
