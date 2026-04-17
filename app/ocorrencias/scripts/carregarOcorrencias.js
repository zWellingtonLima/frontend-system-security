import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { abrirModalEdicaoOcorrencia } from "./editarOcorrencia.js";
const ESTADO_CONFIG = {
  PENDENTE: { label: "Pendente", classe: "estado-pendente" },
  EM_ANALISE: { label: "Em Análise", classe: "estado-ativo" },
  RESOLVIDA: { label: "Resolvida", classe: "estado-resolvido" },
  CANCELADA: { label: "Cancelada", classe: "estado-cancelado" },
};

const TIPO_CONFIG = {
  OBJETO_PERDIDO_ENCONTRADO: {
    label: "Objeto Perdido / Encontrado",
  },
  AVARIA_EQUIPAMENTO: { label: "Avaria Equipamento" },
  ACESSO_NAO_AUTORIZADO: {
    label: "Acesso não Autorizado",
  },
  INCIDENTE_COM_VISITANTE: {
    label: "Incidente com Visitante",
  },
  ALARME_DISPARADO: { label: "Alarme Disparado" },
  OUTROS: { label: "Outros" },
};

export function carregarOcorrencias(endpoint = "ocorrencias") {
  renderTable({
    endpoint,
    campos: [
      "createDate",
      "createUser",
      "tipoOcorrencia",
      "ocorrencia",
      "estado",
      "acoes",
    ],
    tbodySelector: "#tbodyOcorrencias",
    renderCampo: {
      createDate: (item) => formatDate(item.createDate),

      estado: (item) => {
        const config = ESTADO_CONFIG[item.estado.estadoOcorrencia] ?? {
          label: item.estado.estadoOcorrencia,
          classe: "",
        };
        return `<span class="badge ${config.classe}">${config.label}</span>`;
      },
      tipoOcorrencia: (item) => {
        const config = TIPO_CONFIG[item.tipoOcorrencia.tipoOcorrencia] ?? {
          label: item.tipoOcorrencia.tipoOcorrencia,
          classe: "",
        };
        return `<span class="badge estado-neutro">${config.label}</span>`;
      },
      acoes: (item) => {
        return `<button class="btn btn-sm btn-ghost btn-editar-ocorrencia" data-id="${item.id}">✏️ Editar</button>`;
      },
    },
  });
}

// Delegação estática — registada uma única vez
document.querySelector(".table-wrap").addEventListener("click", async (e) => {
  const btnEditar = e.target.closest(".btn-editar-ocorrencia");

  if (btnEditar) {
    btnEditar.disabled = true;
    btnEditar.textContent = "A carregar...";
    try {
      const item = await fetchData(`ocorrencias/${btnEditar.dataset.id}`);
      abrirModalEdicaoOcorrencia(item);
    } catch (err) {
      console.error("Erro ao carregar ocorrência:", err);
    } finally {
      btnEditar.disabled = false;
      btnEditar.textContent = "✏️ Editar";
    }
  }
});

// ── Filtro Todas / Hoje ───────────────────────────────────────────────────
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    carregarOcorrencias(btn.dataset.endpoint);
  });
});

carregarOcorrencias("ocorrencias/hoje");
