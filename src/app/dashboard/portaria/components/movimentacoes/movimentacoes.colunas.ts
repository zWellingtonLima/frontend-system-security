import { DatePipe } from "@angular/common";
import { MapaColunas } from "src/app/shared/models/filtro-tabela";
import {
  Movimentacoes,
  MovimentacoesColunaChave,
} from "../../models/movimentacoes.model";

// Formato único da coluna "Desde": é o que se mostra E o que se filtra.
const FORMATO_DESDE = "d 'de' MMMM 'às' HH:mm";
const FUSO = "Europe/Lisbon";

// As colunas da tabela de chaves: título, texto da célula e como (ou se) a
// coluna é filtrável. Acrescentar uma coluna simples é acrescentar uma
// entrada aqui — o template não muda.
export function criarColunasChave(
  datePipe: DatePipe,
): MapaColunas<Movimentacoes, MovimentacoesColunaChave> {
  return {
    pessoa: {
      titulo: "Pessoa",
      filtro: "texto",
      texto: (chave) => chave.nomeVisitante,
    },

    entrada: {
      titulo: "Entrada",
      filtro: "texto",
      classe: "bold-text",
      texto: (chave) =>
        datePipe.transform(chave.horaEntrada, FORMATO_DESDE, FUSO) || "",
    },

    // Personalizada: o piso é um subtexto por baixo da sala
    tipo: {
      titulo: "Tipo visita",
      filtro: "texto",
      texto: (chave) => chave.tipoVisita,
    },

    // Personalizada: badge com ícone e cor
    setor: {
      titulo: "Setor",
      filtro: "texto",
      texto: (chave) => chave.setorDestino || "",
    },

    responsavel: {
      titulo: "Responsável",
      filtro: "texto",
      texto: (chave) => chave.funcionarioResponsavel,
    },

    notas: {
      titulo: "Notas",
      filtro: "texto",
      texto: (chave) => chave.notas || "",
    },

    // Sem `filtro` — nunca exclui uma linha. Sem texto pesquisável.
    acoes: {
      titulo: "Ações",
      personalizada: true,
      texto: () => "",
    },
  };
}
