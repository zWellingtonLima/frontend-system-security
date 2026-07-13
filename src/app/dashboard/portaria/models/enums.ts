// ============================================================
// OCORRÊNCIAS
// ============================================================
export type TipoOcorrenciaEnumType =
  | "ACESSO_NAO_AUTORIZADO"
  | "AVARIA_EQUIPAMENTO"
  | "OBJETO_PERDIDO_ENCONTRADO"
  | "INCIDENTE_COM_VISITANTE"
  | "ALARME_DISPARADO"
  | "OUTROS";
export type EstadoOcorrenciaEnumType = "PENDENTE" | "RESOLVIDA" | "CANCELADA";
export type TabOcorrencia = EstadoOcorrenciaEnumType | "TODAS";

export interface OcorrenciaConfigBase {
  label: string;
  icone: string;
  classe: string;
}

export interface TipoOcorrencia extends OcorrenciaConfigBase {
  value: TipoOcorrenciaEnumType;
}
export interface EstadoOcorrencia extends OcorrenciaConfigBase {
  value: EstadoOcorrenciaEnumType;
}

// Configuracao da paginacao
export interface TabConfig {
  value: TabOcorrencia;
  label: string;
  paginada: boolean;
  estadoParam: EstadoOcorrenciaEnumType | null;
}

// Não serve para iteração direta no *ngFor mas é bom para CONFIG["AVARIA_EQUIPAMENTO"] por exempo
export const TIPO_OCORRENCIA_CONFIG: Record<
  TipoOcorrenciaEnumType,
  OcorrenciaConfigBase
> = {
  ACESSO_NAO_AUTORIZADO: {
    icone: "fas fa-door-closed",
    label: "Acesso Não Autorizado",
    classe: "tipo--acesso",
  },
  ALARME_DISPARADO: {
    classe: "tipo--alarme",
    icone: "fas fa-bell",
    label: "Alarme Disparado",
  },
  AVARIA_EQUIPAMENTO: {
    icone: "ft-x-square",
    classe: "tipo--avaria",
    label: "Avaria de Equipamento",
  },
  OBJETO_PERDIDO_ENCONTRADO: {
    icone: "fas fa-box",
    label: "Objeto Perdido/Encontrado",
    classe: "tipo--objeto",
  },
  INCIDENTE_COM_VISITANTE: {
    icone: "ft-user-x",
    classe: "tipo--visitante",
    label: "Incidente com Visitante",
  },
  OUTROS: {
    label: "Outros",
    icone: "ft-help-circle",
    classe: "tipo--outros",
  },
};

export const ESTADO_OCORRENCIA_CONFIG: Record<
  EstadoOcorrenciaEnumType,
  OcorrenciaConfigBase
> = {
  PENDENTE: {
    classe: "estado--pendente",
    icone: "fas fa-clock",
    label: "Pendente",
  },
  RESOLVIDA: {
    classe: "estado--resolvida",
    icone: "far fa-check-circle",
    label: "Resolvida",
  },
  CANCELADA: {
    classe: "estado--cancelada",
    icone: "fas fa-stop-circle",
    label: "Cancelada",
  },
};

// Devolve um array iterável pronto para ser usado no Template HTML
export const TIPOS_OCORRENCIA: TipoOcorrencia[] = Object.keys(
  TIPO_OCORRENCIA_CONFIG,
).map((k) => {
  const chave = k as TipoOcorrenciaEnumType;
  return { value: chave, ...TIPO_OCORRENCIA_CONFIG[chave] };
});
