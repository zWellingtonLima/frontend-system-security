import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { fillSelect } from "../../shared/scripts/UI/fillSelects.js";
import { renderTable } from "../../shared/scripts/UI/renderTable.js";

const TIPO_CONFIG = {
  AGUA: { classe: "tipo-agua", label: "Água", unidade: "m³" },
  ELETRICIDADE: { classe: "tipo-luz", label: "Eletricidade", unidade: "kWh" },
  GAS: { classe: "tipo-gas", label: "Gás", unidade: "m³" },
};

// Isso preenche a combobox
const tiposConsumo = await fetchData("lists/tipos-consumo");
fillSelect("#tipoConsumos", tiposConsumo, "valor", "label");

// Isso [e pra renderizar o historico
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
      tipo: (item) => {
        const config = TIPO_CONFIG[item.tipo] ?? {
          classe: "",
          label: item.tipo,
          unidade: "",
        };
        return `
          <span class="tipo-icon ${config.classe}">
            <span class="dot-tipo"></span>${config.label}
          </span>`;
      },
      // Coluna leitura — com unidade
      leitura: (item) => {
        const config = TIPO_CONFIG[item.tipo];
        const unidade = config?.unidade ?? "";
        return `${item.leitura.toLocaleString("pt-PT")} <span class="diff">${unidade}</span>`;
      },
      // Coluna diferença — sempre com sinal
      diferenca: (item) => {
        const sinal = item.diferenca >= 0 ? "+" : "";
        return `<span class="diff-val">${sinal}${item.diferenca}</span>`;
      },
    },
  });
}

carregarHistorico();
