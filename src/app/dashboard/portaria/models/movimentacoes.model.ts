export interface Movimentacoes {
  id: number;
  nomeVisitante: string;
  horaEntrada: Date;
  horaSaida: Date;
  funcionarioResponsavel: string;
  idRHFuncionario: number;
  setorFuncionario: string;
  setorDestino: string;
  tipoVisita: string;
  idTipoVisita: number;
  notas: string;
}

export interface novaVisita {
  nomeVisitante: string;
  idRHFuncionario: number;
  setorDestino: string;
  notas: string;
  idTipoVisita: number;
}

export interface TiposVisitas {
  id: number;
  tipo: string;
}

export interface movimentacoesFiltro {
  tipoVisita?: number | null | "";
  dataInicio?: string | null;
  dataFim?: string | null;
  textoBusca: string;
}

export interface movimentacoesPage {
  content: Movimentacoes[];
  number: number; // página atual (0-based)
  totalPages: number;
  totalElements: number; // total da query, não o total da página
}

// TABELA

export type MovimentacoesColunaChave =
  | "pessoa"
  | "entrada"
  | "tipo"
  | "setor"
  | "responsavel"
  | "notas"
  | "acoes";

export const movColunas: MovimentacoesColunaChave[] = [
  "pessoa",
  "entrada",
  "tipo",
  "setor",
  "responsavel",
  "notas",
  "acoes",
];

export const componenteMovimentacoesEnum = {
  ATIVAS: "ATIVAS",
  HISTORICO: "HISTORICO",
};

export type componenteMovimentacoesType =
  keyof typeof componenteMovimentacoesEnum;
