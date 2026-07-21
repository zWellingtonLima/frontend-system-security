import {
  EstadoOcorrenciaEnumType,
  OcorrenciaConfigBase,
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
export interface ChavesListagem {
  id: number;
  idSala: number;
  codigo: string;
}

export interface ChaveEmprestadas {
  idEntrega: number;
  idChave: number;
  descricao: string; // CHV-101 ou "Molho TI"
  // tipo: TipoChaveEnumType;
  sala: number; // número da sala ou null se molho
  nomePessoa: string;
  horaEntrega: Date;
  observacoes: string;
}

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
export interface Ocorrencias {
  id: number;
  createDate: Date;
  createUser: string;
  tipoOcorrencia: string;
  ocorrencia: string;
  estado: EstadoOcorrenciaEnumType;
  horaOcorrencia: Date;
}

export interface OcorrenciasRequestDTO {
  tipoOcorrencia: TipoOcorrenciaEnumType;
  ocorrencia: string;
  estadoOcorrenciaEnum: EstadoOcorrenciaEnumType;
}

export interface OcorrenciasCriarDTO {
  tipoOcorrencia: TipoOcorrenciaEnumType;
  ocorrencia: string;
}

export interface OcorrenciasResponseDTO {
  id: number;
  createDate: ISOTimestamp;
  tipo: TipoOcorrenciaEnumType;
  ocorrencia: string;
  estado: EstadoOcorrenciaEnumType;
  horaOcorrencia: ISOTimestamp;
  modificadoEm: ISOTimestamp;
}

// Verificar se o formato definitivo sera esse
export interface OcorrenciasPage {
  content: OcorrenciasResponseDTO[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface Filtros {
  tipo: TipoOcorrenciaEnumType | "";
  search: string;
}

export interface OcorrenciaViewModel extends OcorrenciasResponseDTO {
  tipoConfig: OcorrenciaConfigBase;
  estadoConfig: OcorrenciaConfigBase;
}
