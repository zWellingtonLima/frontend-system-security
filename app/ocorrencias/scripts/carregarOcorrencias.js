import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { abrirModalEdicaoOcorrencia } from "./editarOcorrencia.js";
import { abrirModalEliminarOcorrencia } from "./eliminarOcorrencia.js";

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

function getUtilizadorAtual() {
  return sessionStorage.getItem("nome") ?? null;
}

export function carregarOcorrencias() {
  const utilizadorAtual = getUtilizadorAtual();

  renderTable({
    endpoint: "ocorrencias",
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
        if (item.createUser !== utilizadorAtual) return "—";
        return `
          <div>
            <button class="btn btn-sm btn-full btn-ghost btn-editar-ocorrencia" data-id="${item.id}">✏️ Editar</button>
            <button class="btn btn-sm btn-full btn-danger btn-eliminar-ocorrencia" data-id="${item.id}">Eliminar</button>
          </div>`;
      },
    },
  });
}

// Delegação estática — registada uma única vez
document.querySelector(".table-wrap").addEventListener("click", async (e) => {
  const btnEditar = e.target.closest(".btn-editar-ocorrencia");
  const btnEliminar = e.target.closest(".btn-eliminar-ocorrencia");

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

  if (btnEliminar) {
    abrirModalEliminarOcorrencia(btnEliminar.dataset.id);
  }
});

carregarOcorrencias();
