import { DatePipe } from "@angular/common";
import { MapaColunas } from "src/app/shared/tabela-filtrada";
import { ChaveViewModel } from "../../../models/api";

const FORMATO_DATA = "d 'de' MMMM 'às' HH:mm";
const FUSO = "Europe/Lisbon";

export type ColunaInventario =
  | "edificio"
  | "codigo"
  | "chaveiro"
  | "estado"
  | "desde"
  | "nomeFuncionario";

// A ordem aqui é a ordem em que as colunas aparecem na tabela.
export const COLUNAS_INVENTARIO: ColunaInventario[] = [
  "edificio",
  "codigo",
  "chaveiro",
  "estado",
  "desde",
  "nomeFuncionario",
];

// As larguras somam 100% e fixam a tabela: as colunas deixam de encolher
// quando um filtro reduz as linhas. "Com quem" leva a fatia maior por ser a
// única com conteúdo de comprimento imprevisível — nomes de pessoas.
export function criarColunasInventario(
  datePipe: DatePipe,
): MapaColunas<ChaveViewModel, ColunaInventario> {
  return {
    edificio: {
      largura: "16%",
      titulo: "Edifício",
      texto: (chave) => chave.edificioLabel,
    },

    codigo: {
      largura: "14%",
      titulo: "Chave",
      classe: "tf-bold",
      texto: (chave) => chave.codigo,
    },

    chaveiro: {
      titulo: "Código Chaveiro",
      classe: "tf-col-tight",
      texto: (chave) => chave.chaveiro,
    },

    estado: {
      largura: "14%",
      titulo: "Estado",
      texto: (chave) => (chave.statusConfig ? chave.statusConfig.label : ""),
    },

    desde: {
      largura: "18%",
      titulo: "Desde",
      texto: (chave) =>
        datePipe.transform(chave.desde, FORMATO_DATA, FUSO) || "",
    },

    nomeFuncionario: {
      largura: "24%",
      titulo: "Com quem",
      classe: "tf-bold",
      texto: (chave) => chave.nomeFuncionario || "",
    },
  };
}
