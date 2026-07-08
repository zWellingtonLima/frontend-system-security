// ============================================================
// OCORRÊNCIAS
// ============================================================
export const TipoOcorrenciaEnum = {
  ACESSO_NAO_AUTORIZADO: "Acesso Não Autorizado",
  COMPORTAMENTO_SUSPEITO: "Comportamento Suspeito",
  AVARIA_EQUIPAMENTO: "Avaria de Equipamento",
  OBJETO_PERDIDO_ENCONTRADO: "Objeto Perdido/Encontrado",
  INCIDENTE_COM_VISITANTE: "Incidente com Visitante",
  ALARME_DISPARADO: "Alarme Disparado",
  OUTROS: "Outros",
};

export type TipoOcorrenciaEnumType =
  (typeof TipoOcorrenciaEnum)[keyof typeof TipoOcorrenciaEnum];

export const EstadoOcorrenciaEnum = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em Análise",
  RESOLVIDA: "Resolvida",
  CANCELADA: "Cancelada",
};

export type EstadoOcorrenciaEnumType =
  (typeof EstadoOcorrenciaEnum)[keyof typeof EstadoOcorrenciaEnum];
