export const TipoConsumoEnum = {
  ELETRICIDADE: "ELETRICIDADE",
  AGUA: "AGUA",
  GAS: "GAS",
};

export type TipoConsumoType = keyof typeof TipoConsumoEnum;
/** Registo de uma leitura de consumo, tal como devolvido pelo backend */
export interface ConsumoLeitura {
  id: number;
  leituraAtual: number;
  leituraAnterior: number;
  dataRegisto: string;
  observacao: string;
  tipoConsumo: TipoConsumoType;
  idTipoConsumo: number;
  consumoCalculado: number | null;
  edificioId: number;
  edificioName: string;
}

/** Última leitura registada para um tipo de consumo (usada nos cards do topo) */
export interface UltimaLeitura {
  nomeEdificio: string;
  tipoConsumo: number;
  leituraAnterior: number | null;
  dataRegisto: Date;
  leituraAtual: number;
  consumo: number | null;
}

/** Contagem de registos por tipo, para os badges das abas */
export interface CountTabelas {
  tipoConsumo: number;
  count: number;
}

export interface ConsumoFiltro {
  tipo?: string;
  dataInicio?: Date;
  dataFim?: Date;
  /** página baseada em 0, tal como o Spring Data Pageable */
  page: number;
  size: number;
}

/** Resposta paginada no formato Spring Data Page<T> */
export interface PageResponse<T> {
  consumos: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ConsumoPayload {
  valorLeitura: number;
  notas: string;
  edificioId: number;
  tipoConsumo: TipoConsumoType;
  dataRegisto?: string;
}

export interface EdificiosResponse {
  id: number;
  nome: string;
}
