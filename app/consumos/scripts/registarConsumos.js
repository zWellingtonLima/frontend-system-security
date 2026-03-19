import { fetchData } from "../../shared/scripts/utils/fetchData.js";
import { carregarHistorico } from "./carregarConsumos.js";

const formConsumos = document.querySelector("#formConsumos");

formConsumos.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    tipoConsumo: formConsumos.tipoConsumos.value,
    valorLeitura: parseInt(formConsumos.valorLeitura.value),
    observacao: formConsumos.observacao.value.trim() || null,
  };

  console.log(dados);

  try {
    await fetchData("consumos", {
      method: "POST",
      body: JSON.stringify(dados),
    });

    formConsumos.reset();
    carregarHistorico(); // ← atualiza a tabela sem reload
  } catch (err) {
    console.error("Erro ao registar consumo:", err);
  }
});
