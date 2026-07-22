import {
  ConfigBase,
  EstadoOcorrenciaEnumType,
  StatusChaveEnumType,
  TipoOcorrenciaEnumType,
} from "./enums";

type ISOTimestamp = string;

// ------------ AUTH ---------------
export interface TokenResponse {
  accessToken: string;
}

export interface LoginResponse extends TokenResponse {
  userId: number;
  userName: string;
}

// ============================================================
// CHAVES
// ============================================================
export interface ChavesResponseDTO {
  id: number;
  idEmprestimo: number | null;
  idEdificio: number;
  codigo: string;
  sala: number | null;
  piso: string;
  status: StatusChaveEnumType;
  pessoa: string | null;
  desde: ISOTimestamp | null;
}

// Enriquecida no service com os rótulos prontos para o template
export interface ChaveViewModel extends ChavesResponseDTO {
  statusConfig: ConfigBase;
  edificioLabel: string;
  pisoLabel: string;
}

// Interface para preencher as combobox do modal de emprestar cahve
export interface ChaveDisponivelDTO {
  id: number;
  idEdificio: number;
  codigo: string;
  piso: string;
  numeroSala: number | null; // null em caso de molho
}

// Disponíveis agrupadas por idEdificio (1-> A, 2 -> B) para os selects
export type ChavesDisponiveisPorEdificio = Record<number, ChaveDisponivelDTO[]>;

export interface HistoricoEntregaChave {
  idEntrega: string;
  edificio: string;
  sala: string;
  nomePessoa: string; // quem pegou a chave
  horaEntrega: Date;
  horaDevolucao: Date;
  devolvidaPor: string;
  observacoes: string;
}

// ============================================================
// OCORRÊNCIAS
// ============================================================
export interface OcorrenciasCriarDTO {
  tipoOcorrencia: TipoOcorrenciaEnumType;
  ocorrencia: string;
}

export type OcorrenciasUpdateDTO = OcorrenciasCriarDTO;

export interface OcorrenciasResponseDTO {
  id: number;
  createDate: ISOTimestamp;
  tipo: TipoOcorrenciaEnumType;
  ocorrencia: string;
  estado: EstadoOcorrenciaEnumType;
  horaOcorrencia: ISOTimestamp;
  modificadoEm: ISOTimestamp;
}

export interface OcorrenciasPage {
  content: OcorrenciasResponseDTO[];
  number: number; // página atual (0-based)
  totalPages: number;
  totalElements: number; // total da query, não o total da página
}

export interface Filtros {
  tipo: TipoOcorrenciaEnumType | "";
  search: string;
}

export interface OcorrenciaViewModel extends OcorrenciasResponseDTO {
  tipoConfig: ConfigBase;
  estadoConfig: ConfigBase;
}

// Estado consolidado da barra de paginação para consumir direto no template
export interface PaginacaoVM {
  paginaAtual: number;
  totalPaginas: number;
  paginas: (number | "...")[];
  temAnterior: boolean;
  temProximo: boolean;
  visivel: boolean;
}
