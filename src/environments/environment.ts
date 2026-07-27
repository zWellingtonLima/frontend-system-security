const api = "http://localhost:8080/api";

export const environment = {
  production: false,
  loginApiUrl: `${api}/auth/login`,
  registerApiUrl: `${api}/auth/register`,
  refreshApiUrl: `${api}/auth/refresh`,
  // OCORRENCIAS
  ocorrenciaApiUrl: `${api}/ocorrencias`,
  ocorrenciasHojeApiUrl: `${api}/ocorrencias/hoje`,
  // CHAVES
  chavesListagemApiUrl: `${api}/chaves`,
  chavesEmprestadasApiURL: `${api}/chaves/emprestadas`,
  chavesDisponiveisApiUrl: `${api}/chaves/disponiveis`,
  chavesHistoricoApiUrl: `${api}/chaves/historico`,
  // Empréstimos: PUT {url}/{idEmprestimo} corrige os dados;
  // POST {url}/{idEmprestimo}/devolucao regista a devolução
  chavesEmprestimoApiUrl: `${api}/chaves/emprestimos`,
  chavesEmprestimoHistoricoApiUrl: `${api}/chaves/emprestimos/historico`,
  // CONSUMOS
  consumosApiUrl: `${api}/consumos`,
  // FUNCIONARIOS (lista completa, usada nos autocompletes)
  funcionariosApiUrl: `${api}/funcionarios`,
};
