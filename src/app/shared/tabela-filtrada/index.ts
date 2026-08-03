// Superfície pública do pacote. Uma página só deve precisar disto:
//
//   import {
//     MapaColunas,
//     ModeloTabela,
//   } from "src/app/shared/tabela-filtrada";
//
// O `FiltrosColunaComponent` fica de fora: é detalhe interno da tabela.
export { TabelaFiltradaModule } from "./tabela-filtrada.module";
export { ModeloTabela } from "./modelo-tabela";
export {
  ColunaVM,
  DefinicaoColuna,
  LinhaTabela,
  MapaColunas,
  TipoFiltro,
} from "./tabela.model";
