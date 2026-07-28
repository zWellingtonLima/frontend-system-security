export interface Movimentacoes {
  id: number;
  nomeVisitante: string;
  horaEntrada: Date;
  horaSaida: Date;
  funcionarioResponsavel: string;
  setorDestino: string;
  tipoVisita: string;
  idTipoVisita: number;
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

export interface movimentacoesFiltro {
  tipo?: string;
  dataInicio?: Date | null;
  dataFim?: Date | null;
  /** página baseada em 0, tal como o Spring Data Pageable */
  page: number;
  size: number;
}

export interface PageResponse<Movimentacoes> {
  movimentacoes: Movimentacoes[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
