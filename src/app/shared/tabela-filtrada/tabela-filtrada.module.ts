import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CelulaTabelaDirective } from "./celula-tabela.directive";
import { FiltrosColunaComponent } from "./filtros-coluna.component";
import { TabelaFiltradaComponent } from "./tabela-filtrada.component";

// O pacote da tabela filtrada.
//
// Só depende do `CommonModule` — em particular NÃO precisa do `FormsModule`:
// a linha de filtros usa `[value]` e `(input)`/`(change)` crus, sem
// `ngModel`. Um projeto que o importe não herda nada que não pediu.
//
// Falta de propósito o `Paginador`/`<app-paginacao>`: o rodapé da tabela é
// um `ng-content` e aceita qualquer markup. A paginação é um pacote à parte.
@NgModule({
  imports: [CommonModule],
  declarations: [
    TabelaFiltradaComponent,
    FiltrosColunaComponent,
    CelulaTabelaDirective,
  ],
  exports: [TabelaFiltradaComponent, CelulaTabelaDirective],
})
export class TabelaFiltradaModule {}
