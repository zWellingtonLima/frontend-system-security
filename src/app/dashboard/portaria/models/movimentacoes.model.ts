export interface Movimentacoes {
  id: number;
  nomeVisitante: string;
  horaEntrada: Date;
  horaSaida: Date;
  funcionarioResponsavel: string;
  setorDestino: string;
  idTipoVisita: string;
  notas: string;
}

export interface novaVisita {
  nomeVisitante: string;
  idRHFuncionarioResponsavel: string;
  setorDestino: string;
  notas: string;
  idTipoVisita: number;
}

export interface TiposVisitas {
  id: number;
  tipo: string;
}
