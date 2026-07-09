import { EstadoOcorrenciaEnumType, TipoOcorrenciaEnumType } from "./enums";

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
  createUser: string;
  tipoOcorrencia: {
    id: number;
    tipoOcorrencia: TipoOcorrenciaEnumType;
    label: string;
  };
  ocorrencia: string;
  estado: {
    id: number;
    tipoOcorrencia: EstadoOcorrenciaEnumType;
    label: string;
  };
  horaOcorrencia: ISOTimestamp;
}

export interface OcorrenciasFiltros {
  estado: EstadoOcorrenciaEnumType | "TODAS";
  tipo: TipoOcorrenciaEnumType | "";
  search: string;
}

export interface OcorrenciasContagem {
  total: number;
  pendentes: number;
  emAnalise: number;
  resolvidas: number;
  canceladas: number;
}
