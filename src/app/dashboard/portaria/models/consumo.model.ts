export type TipoConsumo = "AGUA" | "ELETRICIDADE" | "GAS";

/** Registo de uma leitura de consumo, tal como devolvido pelo backend */
export interface ConsumoLeitura {
  id: number;
  tipo: TipoConsumo;
  valor: number;
  /** Consumo calculado face à leitura anterior do mesmo tipo. null quando é a primeira leitura */
  consumo: number | null;
  observacao: string;
  seguranca: string;
  /** ISO string, ex: 2026-04-17T15:26:00 */
  dataHora: string;
}

/** Última leitura registada para um tipo de consumo (usada nos cards do topo) */
export interface UltimaLeitura {
  tipo: TipoConsumo;
  valor: number;
  consumo: number | null;
  dataHora: string;
}

/** Contagem de registos por tipo, para os badges das abas */
export interface ConsumoContadores {
  todas: number;
  agua: number;
  eletricidade: number;
  gas: number;
}

export type PeriodoFiltro = "" | "hoje" | "semana" | "mes";

export interface ConsumoFiltro {
  tipo?: TipoConsumo;
  periodo?: PeriodoFiltro;
  pesquisa?: string;
  /** página baseada em 0, tal como o Spring Data Pageable */
  page: number;
  size: number;
}

/** Resposta paginada no formato Spring Data Page<T> */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ConsumoPayload {
  tipo: TipoConsumo;
  valor: number;
  observacao: string;
  dataHora?: string;
}
