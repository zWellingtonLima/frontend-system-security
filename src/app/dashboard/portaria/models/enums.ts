// ============================================================
// COMPARTILHADO
// ============================================================

// Forma comum de config visual (labels, ícones, classes) é reutilizada entre páginas
export interface ConfigBase {
  label: string;
  icone: string;
  classe: string;
}

// Config de tab genérica. Cada página define o seu próprio tipo de `value`. Por exemplo: Ocorrências possui 4 TABS; Chaves possui 2.
export interface TabConfig<T> {
  value: T;
  label: string;
  paginada: boolean;
}

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

export interface TipoOcorrencia extends ConfigBase {
  value: TipoOcorrenciaEnumType;
}

export type OcorrenciaTabConfig = TabConfig<TabOcorrencia>;

// Não serve para iteração direta no *ngFor mas é bom para CONFIG["AVARIA_EQUIPAMENTO"] por exempo
export const TIPO_OCORRENCIA_CONFIG: Record<
  TipoOcorrenciaEnumType,
  ConfigBase
> = {
  ACESSO_NAO_AUTORIZADO: {
    icone: "ft-shield",
    label: "Acesso Não Autorizado",
    classe: "tipo--acesso",
  },
  ALARME_DISPARADO: {
    classe: "tipo--alarme",
    icone: "far fa-bell",
    label: "Alarme Disparado",
  },
  AVARIA_EQUIPAMENTO: {
    icone: "ft-x-square",
    classe: "tipo--avaria",
    label: "Avaria de Equipamento",
  },
  OBJETO_PERDIDO_ENCONTRADO: {
    icone: "ft-box",
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
  ConfigBase
> = {
  PENDENTE: {
    classe: "estado--pendente",
    icone: "ft-clock",
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

// ============================================================
// CHAVES
// ============================================================
export type TabsChave = "EMPRESTADAS" | "TODAS";

export type ChavesTabConfig = TabConfig<TabsChave>;

export type StatusChaveEnumType = "EMPRESTADA" | "DISPONIVEL";

export const STATUS_CHAVE_CONFIG: Record<StatusChaveEnumType, ConfigBase> = {
  EMPRESTADA: {
    label: "Emprestada",
    icone: "ft-clock",
    classe: "badge-emprestada",
  },
  DISPONIVEL: {
    label: "Disponível",
    icone: "far fa-check-circle",
    classe: "badge-disponivel",
  },
};

// idEdificio chega como Integer; mapeamos para o rótulo exibido
export const EDIFICIO_LABEL: Record<number, string> = {
  1: "Edifício A",
  2: "Edifício B",
};

// Posso depois alterar para o padrão Português usando Cave, Rés-do-chão etc
export const PISO_LABEL: Record<string, string> = {
  "-1": "Piso -1",
  "0": "Piso 0",
  "1": "Piso 1",
  "2": "Piso 2",
  "3": "Piso 3",
};
