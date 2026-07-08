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
