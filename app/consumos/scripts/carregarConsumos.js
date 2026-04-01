import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { fillSelect } from "../../shared/scripts/UI/fillSelects.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";
import { abrirModalEdicao } from "./editarConsumos.js";

// PREENCHER COMBOBOX
const tiposConsumo = await fetchData("lists/tipos-consumo");
fillSelect("#tipoConsumos", tiposConsumo, "valor", "label");

// UTILIZADOR ATUAL DA SESSÃO
function getUtilizadorAtual() {
  return sessionStorage.getItem("nome") ?? null;
}

// ULTIMAS LEITURAS
export async function carregarUltimasLeituras() {
  const LEITURA_CONFIG = {
    agua: { id: "aguaUltimaLeitura", unidade: "m³" },
    eletricidade: { id: "energiaUltimaLeitura", unidade: "kWh" },
    gas: { id: "gasUltimaLeitura", unidade: "m³" },
  };

  try {
    const data = await fetchData("consumos/ultimas-leituras");

    Object.entries(LEITURA_CONFIG).forEach(([tipo, { id, unidade }]) => {
      const el = document.querySelector(`#${id}`);
      if (!el) return;

      const valor = data[tipo];
      el.innerHTML =
        valor != null
          ? `${valor.toLocaleString("pt-PT")}<span class="unit">${unidade}</span>`
          : `—<span class="unit">${unidade}</span>`;
    });
  } catch (err) {
    console.log("[carregar-leituras] erro: ", err);
  }
}

const TIPO_CONFIG = {
  Água: { classe: "tipo-agua", label: "Água", unidade: "m³" },
  Eletricidade: { classe: "tipo-luz", label: "Eletricidade", unidade: "kWh" },
  Gás: { classe: "tipo-gas", label: "Gás", unidade: "m³" },
};

// CARREGAR HISTORICO
export function carregarHistorico() {
  const utilizadorAtual = getUtilizadorAtual();

  renderTable({
    endpoint: "consumos",
    campos: [
      "dataRegisto",
      "tipoConsumo",
      "valorLeitura",
      "consumoCalculado",
      "observacao",
      "createUser",
      "acoes",
    ],
    tbodySelector: "#tbodyConsumos",
    renderCampo: {
      tipoConsumo: (item) => {
        const config = TIPO_CONFIG[item.tipoConsumo] ?? {
          classe: "",
          label: item.tipoConsumo,
          unidade: "",
        };
        return `
          <span class="tipo-icon ${config.classe}">
            <span class="dot-tipo"></span>${config.label}
          </span>`;
      },

      valorLeitura: (item) => {
        const config = TIPO_CONFIG[item.tipoConsumo];
        const unidade = config?.unidade ?? "";
        return `${item.valorLeitura.toLocaleString("pt-PT")} <span class="diff">${unidade}</span>`;
      },

      consumoCalculado: (item) => {
        if (item.consumoCalculado == null) return "—";
        const sinal = item.consumoCalculado >= 0 ? "+" : "";
        const classe = sinal === "+" ? "diff-val" : "diff-val-minus";
        return `<span class="${classe}">${sinal}${item.consumoCalculado}</span>`;
      },

      dataRegisto: (item) => formatDate(item.createDate),

      // BOTÃO EDITAR — só aparece se foi o utilizador atual que registou
      acoes: (item) => {
        if (item.createUser !== utilizadorAtual) return "—";
        return `
          <button
            class="btn btn-sm btn-secondary btn-editar-consumo"
            data-id="${item.id}"
          >✏️ Editar</button>
        `;
      },
    },
  });

  // DELEGAR EVENTO — abre modal ao clicar em editar
  const tbody = document.querySelector("#tbodyConsumos");

  // Remove listener anterior para evitar duplicados
  const novoTbody = tbody.cloneNode(true);
  tbody.parentNode.replaceChild(novoTbody, tbody);

  novoTbody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-editar-consumo");
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = "A carregar...";

    try {
      const item = await fetchData(`consumos/${btn.dataset.id}`);
      abrirModalEdicao(item, tiposConsumo);
    } catch (err) {
      console.error("Erro ao carregar consumo:", err);
    } finally {
      btn.disabled = false;
      btn.textContent = "✏️ Editar";
    }
  });
}

carregarUltimasLeituras();
carregarHistorico();