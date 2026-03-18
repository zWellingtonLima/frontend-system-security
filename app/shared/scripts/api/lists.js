const API_BASE_URL = "http://localhost:8080/api";

// Listagem de FUNCIONARIOS
fetch(`${API_BASE_URL}/funcionarios`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagem de VISITANTES
fetch(`${API_BASE_URL}/visitantes`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagem de TIPOS DE CONSUMO
fetch(`${API_BASE_URL}/lists/tipos-consumo`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagem de TIPOS DE CONSUMO
fetch(`${API_BASE_URL}/lists/tipos-chave`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagem de TIPOS OCORRENCIA
fetch(`${API_BASE_URL}/lists/tipos-ocorrencia`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagem de MOVIMENTACOES ATIVAS
fetch(`${API_BASE_URL}/lists/movimentacoes/ativas`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagens todas as MOVIMENTACOES
fetch(`${API_BASE_URL}/lists/movimentacoes/ativas`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagens todas as MOVIMENTACOES VISITANTES ID
fetch(`${API_BASE_URL}/lists/movimentacoes/visitante/1`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// Listagens todas as MOVIMENTACOES FUNCIONARIOS ID
fetch(`${API_BASE_URL}/lists/movimentacoes/funcionario/1`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
