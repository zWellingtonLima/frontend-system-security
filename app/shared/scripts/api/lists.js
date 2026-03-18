const API_BASE_URL = "http://localhost:8080/api";

// Listagem de FUNCIONARIOS
fetchData("funcionarios");

// Listagem de VISITANTES
fetchData("visitantes");

// Listagem de TIPOS DE CONSUMO;
fetchData("lists/tipos-consumo");

// Listagem de TIPOS DE CONSUMO;
fetchData("lists/tipos-chave");

// Listagem de TIPOS OCORRENCIA
fetchData("lists/tipos-ocorrencia");

// Listagem de MOVIMENTACOES ATIVAS
fetchData("lists/movimentacoes/ativas");

// Listagens todas as MOVIMENTACOES
fetchData("lists/movimentacoes");

// Listagens todas as MOVIMENTACOES VISITANTES ID
fetchData("lists/movimentacoes/visistante/1");

// Listagens todas as MOVIMENTACOES FUNCIONARIOS ID
fetchData("lists/movimentacoes/funcionario/1");

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    return response.json();
  } catch (err) {
    console.log(`Falha ao tentar carregar dados de ${endpoint}: ${err}`);
  }
}
