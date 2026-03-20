import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { fillSelect } from "../../shared/scripts/UI/fillSelects.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";
import { formatDate } from "../../shared/scripts/utils/formatDate.js";

// PREENCHER COMBOBOX
const tiposConsumo = await fetchData("lists/tipos-consumo");
fillSelect("#tipoConsumos", tiposConsumo, "valor", "label");

// ULTIMAS LEITURAS
export async function carregarUltimasLeituras() {
  const LEITURA_CONFIG = {
    agua: { id: "aguaUltimaLeitura", unidade: "m³" },
    eletricidade: { id: "energiaUltimaLeitura", unidade: "kWh" },
    gas: { id: "gasUltimaLeitura", unidade: "m³" },
  };

  try {
    const data = await fetchData("consumos/ultimas-leituras");

    console.log(data);

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
  renderTable({
    endpoint: "consumos",
    campos: [
      "dataRegisto",
      "tipoConsumo",
      "valorLeitura",
      "consumoCalculado",
      "observacao",
      "createUser",
    ],
    tbodySelector: "#tbodyConsumos",
    renderCampo: {
      // Coluna tipo — com dot colorido
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
      // Coluna leitura — com unidade
      valorLeitura: (item) => {
        const config = TIPO_CONFIG[item.tipoConsumo];
        const unidade = config?.unidade ?? "";
        return `${item.valorLeitura.toLocaleString("pt-PT")} <span class="diff">${unidade}</span>`;
      },
      // Coluna diferença — sempre com sinal
      consumoCalculado: (item) => {
        if (item.consumoCalculado == null) return "—";
        const sinal = item.consumoCalculado >= 0 ? "+" : "";
        const classe = sinal == "+" ? "diff-val" : "diff-val-minus";
        return `<span class="${classe}">${sinal}${item.consumoCalculado}</span>`;
      },
      dataRegisto: (item) => formatDate(item.createDate),
    },
  });
}

carregarUltimasLeituras();
carregarHistorico();
