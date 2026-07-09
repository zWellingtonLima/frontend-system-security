// ============================================================
// OCORRÊNCIAS
// ============================================================
export const TipoOcorrenciaEnum = {
  ACESSO_NAO_AUTORIZADO: "ACESSO_NAO_AUTORIZADO",
  AVARIA_EQUIPAMENTO: "AVARIA_EQUIPAMENTO",
  OBJETO_PERDIDO_ENCONTRADO: "OBJETO_PERDIDO_ENCONTRADO",
  INCIDENTE_COM_VISITANTE: "INCIDENTE_COM_VISITANTE",
  ALARME_DISPARADO: "ALARME_DISPARADO",
  OUTROS: "OUTROS",
};

export type TipoOcorrenciaEnumType = keyof typeof TipoOcorrenciaEnum;

export const TipoOcorrenciaLabel: Record<TipoOcorrenciaEnumType, string> = {
  ACESSO_NAO_AUTORIZADO: "Acesso Não Autorizado",
  AVARIA_EQUIPAMENTO: "Avaria de Equipamento",
  OBJETO_PERDIDO_ENCONTRADO: "Objeto Perdido/Encontrado",
  INCIDENTE_COM_VISITANTE: "Incidente com Visitante",
  ALARME_DISPARADO: "Alarme Disparado",
  OUTROS: "Outros",
};

export const EstadoOcorrenciaEnum = {
  PENDENTE: "PENDENTE",
  EM_ANALISE: "EM_ANALISE",
  RESOLVIDA: "RESOLVIDA",
  CANCELADA: "CANCELADA",
};

export type EstadoOcorrenciaEnumType = keyof typeof EstadoOcorrenciaEnum;

export const EstadoOcorrenciaLabel: Record<EstadoOcorrenciaEnumType, string> = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em Análise",
  RESOLVIDA: "Resolvida",
  CANCELADA: "Cancelada",
};
