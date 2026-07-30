import { DatePipe } from "@angular/common";
import { MapaColunas } from "src/app/shared/models/filtro-tabela";
import { ChaveViewModel } from "../../models/api";
import { ColunaChave } from "../../models/enums";

// Formato único da coluna "Desde": é o que se mostra E o que se filtra.
const FORMATO_DESDE = "d 'de' MMMM 'às' HH:mm";
const FUSO = "Europe/Lisbon";

// As colunas da tabela de chaves: título, texto da célula e como (ou se) a
// coluna é filtrável. Acrescentar uma coluna simples é acrescentar uma
// entrada aqui — o template não muda.
export function criarColunasChave(
  datePipe: DatePipe,
): MapaColunas<ChaveViewModel, ColunaChave> {
  return {
    edificio: {
      titulo: "Edifício",
      filtro: "select",
      texto: (chave) => chave.edificioLabel,
    },

    codigo: {
      titulo: "Chave / Código",
      filtro: "texto",
      classe: "bold-text tbl-col-tight",
      texto: (chave) => chave.codigo,
    },

    // Personalizada: o piso é um subtexto por baixo da sala
    sala: {
      titulo: "Sala / Piso",
      filtro: "texto",
      classe: "tbl-col-tight",
      personalizada: true,
      texto: (chave) =>
        chave.sala != null ? `Sala ${chave.sala} ${chave.pisoLabel}` : "",
    },

    // Personalizada: badge com ícone e cor
    estado: {
      titulo: "Estado",
      filtro: "select",
      personalizada: true,
      // `statusConfig` vem de um lookup: um status novo do backend daria
      // undefined e rebentava o filtro em todas as linhas.
      texto: (chave) => (chave.statusConfig ? chave.statusConfig.label : ""),
    },

    desde: {
      titulo: "Desde",
      filtro: "texto",
      classe: "tbl-col-tight",
      texto: (chave) =>
        datePipe.transform(chave.desde, FORMATO_DESDE, FUSO) || "",
    },

    nomeFuncionario: {
      titulo: "Com quem",
      filtro: "texto",
      classe: "bold-text",
      texto: (chave) => chave.nomeFuncionario || "",
    },

    // Sem `filtro` — nunca exclui uma linha. Sem texto pesquisável.
    acoes: {
      titulo: "Ações",
      personalizada: true,
      texto: () => "",
    },
  };
}
