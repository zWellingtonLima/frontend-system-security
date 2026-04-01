import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { abrirModalEdicaoOcorrencia } from "./editarOcorrencia.js";

const ESTADO_CONFIG = {
  pendente: { label: "Pendente", classe: "estado-pendente" },
  ativo: { label: "Ativo", classe: "estado-ativo" },
  resolvido: { label: "Resolvido", classe: "estado-resolvido" },
};

function getUtilizadorAtual() {
  return sessionStorage.getItem("nome") ?? null;
}

export function carregarOcorrencias() {
  const utilizadorAtual = getUtilizadorAtual();

  renderTable({
    endpoint: "ocorrencias",
    campos: ["createDate", "createUser", "tipoOcorrencia", "ocorrencia", "estado", "acoes"],
    tbodySelector: "#tbodyOcorrencias",
    renderCampo: {
      createDate: (item) => formatDate(item.createDate),

      // Badge de estado
      estado: (item) => {
        const estado = item.estado ?? "pendente";
        const config = ESTADO_CONFIG[estado] ?? { label: estado, classe: "" };
        return `<span class="badge ${config.classe}">${config.label}</span>`;
      },

      // Botão editar — só para quem registou
      acoes: (item) => {
        if (item.createUser !== utilizadorAtual) return "—";
        return `
          <button
            class="btn btn-sm btn-secondary btn-editar-ocorrencia"
            data-id="${item.id}"
          >✏️ Editar</button>
        `;
      },
    },
  });

  // Delegar evento nos botões de editar
  const tbody = document.querySelector("#tbodyOcorrencias");
  const novoTbody = tbody.cloneNode(true);
  tbody.parentNode.replaceChild(novoTbody, tbody);

  novoTbody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-editar-ocorrencia");
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = "A carregar...";

    try {
      const item = await fetchData(`ocorrencias/${btn.dataset.id}`);
      abrirModalEdicaoOcorrencia(item);
    } catch (err) {
      console.error("Erro ao carregar ocorrência:", err);
    } finally {
      btn.disabled = false;
      btn.textContent = "✏️ Editar";
    }
  });
}

carregarOcorrencias();