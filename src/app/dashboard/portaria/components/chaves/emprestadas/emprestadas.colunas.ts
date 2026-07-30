import { DatePipe } from "@angular/common";
import { MapaColunas } from "src/app/shared/models/modelo-tabela";
import { ChaveViewModel } from "../../../models/api";

// Formato único da coluna "Desde": é o que se mostra E o que se filtra.
const FORMATO_DESDE = "d 'de' MMMM 'às' HH:mm";
const FUSO = "Europe/Lisbon";

export type ColunaEmprestada =
  | "edificio"
  | "codigo"
  | "sala"
  | "desde"
  | "nomeFuncionario"
  | "acoes";

// A ordem aqui é a ordem em que as colunas aparecem na tabela.
export const COLUNAS_EMPRESTADAS: ColunaEmprestada[] = [
  "edificio",
  "codigo",
  "sala",
  "desde",
  "nomeFuncionario",
  "acoes",
];

// As colunas da tabela de chaves emprestadas: título, texto da célula e como
// (ou se) a coluna é filtrável. Acrescentar uma coluna simples é acrescentar
// uma entrada aqui e o nome à lista acima — o template não muda.
export function criarColunasEmprestadas(
  datePipe: DatePipe,
): MapaColunas<ChaveViewModel, ColunaEmprestada> {
  return {
    edificio: {
      titulo: "Edifício",
      filtro: "select",
      texto: (chave) => chave.edificioLabel,
    },

    codigo: {
      titulo: "Chave / Código",
      filtro: "texto",
      classe: "bold-text",
      texto: (chave) => chave.codigo,
    },

    // Desenhada pela página: o piso é um subtexto por baixo da sala
    sala: {
      titulo: "Sala / Piso",
      filtro: "texto",
      texto: (chave) =>
        chave.sala != null ? `Sala ${chave.sala} ${chave.pisoLabel}` : "",
    },

    desde: {
      titulo: "Desde",
      filtro: "texto",
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
      texto: () => "",
    },
  };
}
