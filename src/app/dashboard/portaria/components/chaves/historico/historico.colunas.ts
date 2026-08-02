import { DatePipe } from "@angular/common";
import { MapaColunas } from "src/app/shared/tabela-filtrada";
import { ChaveViewModel } from "../../../models/api";

const FORMATO_DATA = "d 'de' MMMM 'às' HH:mm";
const FUSO = "Europe/Lisbon";

export type ColunaHistorico =
  | "edificio"
  | "codigo"
  | "sala"
  | "nomeFuncionario"
  | "desde"
  | "devolucao";

// A ordem aqui é a ordem em que as colunas aparecem na tabela.
export const COLUNAS_HISTORICO: ColunaHistorico[] = [
  "edificio",
  "codigo",
  "sala",
  "nomeFuncionario",
  "desde",
  "devolucao",
];

export function criarColunasHistorico(
  datePipe: DatePipe,
): MapaColunas<ChaveViewModel, ColunaHistorico> {
  return {
    edificio: {
      titulo: "Edifício",
      texto: (chave) => chave.edificioLabel,
    },

    codigo: {
      titulo: "Chave / Código",
      classe: "tf-bold",
      texto: (chave) => chave.codigo,
    },

    sala: {
      titulo: "Sala / Piso",
      texto: (chave) =>
        chave.sala != null ? `Sala ${chave.sala} ${chave.pisoLabel}` : "",
    },

    nomeFuncionario: {
      titulo: "Responsável",
      classe: "tf-bold tf-col-flex",
      texto: (chave) => chave.nomeFuncionario || "",
    },

    desde: {
      titulo: "Data / Hora empréstimo",
      texto: (chave) =>
        datePipe.transform(chave.desde, FORMATO_DATA, FUSO) || "",
    },

    devolucao: {
      titulo: "Data / Hora devolução",
      texto: (chave) =>
        datePipe.transform(chave.devolucao, FORMATO_DATA, FUSO) || "",
    },
  };
}
