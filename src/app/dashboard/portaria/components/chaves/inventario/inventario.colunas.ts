import { DatePipe } from "@angular/common";
import { MapaColunas } from "src/app/shared/models/modelo-tabela";
import { ChaveViewModel } from "../../../models/api";

const FORMATO_DATA = "d 'de' MMMM 'às' HH:mm";
const FUSO = "Europe/Lisbon";

export type ColunaInventario =
  | "edificio"
  | "codigo"
  | "sala"
  | "estado"
  | "desde"
  | "nomeFuncionario";

// A ordem aqui é a ordem em que as colunas aparecem na tabela.
export const COLUNAS_INVENTARIO: ColunaInventario[] = [
  "edificio",
  "codigo",
  "sala",
  "estado",
  "desde",
  "nomeFuncionario",
];

export function criarColunasInventario(
  datePipe: DatePipe,
): MapaColunas<ChaveViewModel, ColunaInventario> {
  return {
    edificio: {
      titulo: "Edifício",
      texto: (chave) => chave.edificioLabel,
    },

    codigo: {
      titulo: "Chave / Código",
      classe: "bold-text",
      texto: (chave) => chave.codigo,
    },

    sala: {
      titulo: "Sala / Piso",
      texto: (chave) =>
        chave.sala != null ? `Sala ${chave.sala} ${chave.pisoLabel}` : "",
    },

    estado: {
      titulo: "Estado",
      texto: (chave) => (chave.statusConfig ? chave.statusConfig.label : ""),
    },

    desde: {
      titulo: "Desde",
      texto: (chave) =>
        datePipe.transform(chave.desde, FORMATO_DATA, FUSO) || "",
    },

    nomeFuncionario: {
      titulo: "Com quem",
      classe: "bold-text",
      texto: (chave) => chave.nomeFuncionario || "",
    },
  };
}
