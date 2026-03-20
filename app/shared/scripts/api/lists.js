import { fetchData } from "../utils/fetchData.js";

// Listagem de FUNCIONARIOS
fetchData("funcionarios");

// Listagem de VISITANTES
fetchData("visitantes");

// Listagem de CONSUMOS
fetchData("consumos");

// Listagem de ULTIMAS LEITURAS
fetchData("consumos/ultimas-leituras");

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
fetchData("lists/movimentacoes/visitante/1");

// Listagens todas as MOVIMENTACOES FUNCIONARIOS ID
fetchData("lists/movimentacoes/funcionario/1");
