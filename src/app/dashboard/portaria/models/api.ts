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
export interface ChaveEmprestadas {
  idEntrega: number;
  idChave: number;
  descricao: string; // CHV-101 ou "Molho TI"
  tipo: string;
  sala: number; // número da sala ou null se molho
  nomePessoa: string; // quem tem a chave
  horaEntrega: Date;
  observacoes: string;
}

// ============================================================
// OCORRÊNCIAS
// ============================================================

export interface OcorrenciasRequestDTO {
  tipoOcorrencia: TipoOcorrenciaEnumType;
  ocorrencia: string;
  estadoOcorrenciaEnum: EstadoOcorrenciaEnumType;
}

export interface OcorrenciasResponseDTO {
  id: number;
  createDate: ISOTimestamp;
  tipo: TipoOcorrenciaEnumType;
  ocorrencia: string;
  estado: EstadoOcorrenciaEnumType;
  horaOcorrencia: ISOTimestamp;
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
