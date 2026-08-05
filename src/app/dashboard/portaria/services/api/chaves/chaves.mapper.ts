import {
  ChaveDisponivelDTO,
  ChaveOpcao,
  ChaveViewModel,
  ChavesResponseDTO,
  GrupoChaves,
} from "../../../models/api";
import {
  EDIFICIO_LABEL,
  PISO_LABEL,
  STATUS_CHAVE_CONFIG,
} from "../../../models/enums";

// Insere os rótulos de exibição (status, edifício, piso) na chave retornada
export function toViewModel(chave: ChavesResponseDTO): ChaveViewModel {
  return {
    ...chave,
    statusConfig: STATUS_CHAVE_CONFIG[chave.status],
    edificioLabel: EDIFICIO_LABEL[chave.idEdificio] || "-",
    pisoLabel: PISO_LABEL[chave.piso] || "-",
  };
}

// Normaliza o DTO de disponível para a forma consumida pelos selects
export function toChaveOpcao(chave: ChaveDisponivelDTO): ChaveOpcao {
  return {
    id: chave.id,
    idEdificio: chave.idEdificio,
    codigo: chave.codigo,
    chaveiro: chave.chaveiro,
    idRHFrequentes: chave.idRHFrequentes || [],
  };
}

export function agruparPorEdificio(opcoes: ChaveOpcao[]): GrupoChaves[] {
  const porEdificio = opcoes.reduce(
    (grupos, chave) => {
      (grupos[chave.idEdificio] = grupos[chave.idEdificio] || []).push(chave);
      return grupos;
    },
    {} as Record<number, ChaveOpcao[]>,
  );

  return Object.keys(porEdificio)
    .map(Number)
    .sort((a, b) => a - b)
    .map((idEdificio) => ({
      idEdificio,
      edificioLabel: EDIFICIO_LABEL[idEdificio] || `Edifício ${idEdificio}`,
      chaves: porEdificio[idEdificio].sort((a, b) =>
        a.codigo.localeCompare(b.codigo),
      ),
    }));
}

// Disponíveis + chave atual, em grupos ordenados por edifício e código
export function agruparParaEdicao(
  disponiveis: ChaveDisponivelDTO[],
  chaveAtual: ChaveViewModel,
): GrupoChaves[] {
  const opcoes = disponiveis.map(toChaveOpcao);

  if (!opcoes.some((c) => c.id === chaveAtual.id)) {
    opcoes.push({
      id: chaveAtual.id,
      idEdificio: chaveAtual.idEdificio,
      codigo: chaveAtual.codigo,
      chaveiro: chaveAtual.chaveiro,
      idRHFrequentes: [],
    });
  }

  return agruparPorEdificio(opcoes);
}
