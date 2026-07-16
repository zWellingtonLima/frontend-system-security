import {
  EstadoOcorrenciaEnumType,
  OcorrenciaConfigBase,
  TipoChaveEnumType,
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
export interface ChaveEmprestadas {
  idEntrega: number;
  idChave: number;
  descricao: string; // CHV-101 ou "Molho TI"
  tipo: TipoChaveEnumType;
  sala: number; // número da sala ou null se molho
  nomePessoa: string; // quem tem a chave
  horaEntrega: Date;
  observacoes: string;
}

export interface ChavesHistorico {
  descricao: string;
  tipo: TipoChaveEnumType;
  sala: string;
  nomePessoa: string;
  horaEntrega: Date;
  horaDevolucao: Date;
  devolvidaPor: string;
  observacoes: string;
}

export interface Ocorrencias {
  id: number;
  createDate: Date;
  createUser: string;
  tipoOcorrencia: string;
  ocorrencia: string;
  estado: EstadoOcorrenciaEnumType;
  horaOcorrencia: Date;
}

// ============================================================
// OCORRÊNCIAS
// ============================================================

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

export interface FiltrosLocais {
  tipo: TipoOcorrenciaEnumType | "";
  search: string;
}

export interface OcorrenciaViewModel extends OcorrenciasResponseDTO {
  tipoConfig: OcorrenciaConfigBase;
  estadoConfig: OcorrenciaConfigBase;
}
