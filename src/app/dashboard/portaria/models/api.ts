// ------------ AUTH ---------------
export interface TokenResponse {
  accessToken: string;
}

export interface LoginResponse extends TokenResponse {
  userId: number;
  userName: string;
}

export interface ChaveEmprestadas {
  idEntrega: number,
  idChave: number,
  descricao: string,       // CHV-101 ou "Molho TI"
  tipo: string,
  sala: number,            // número da sala ou null se molho
  nomePessoa: string,      // quem tem a chave
  horaEntrega: Date,
  observacoes: string
}

export interface Ocorrencias {
  id: number,
  createDate: Date,
  createUser: string,
  tipoOcorrencia: string,
  ocorrencia: string,
  estado: string,
  horaOcorrencia: Date
}
