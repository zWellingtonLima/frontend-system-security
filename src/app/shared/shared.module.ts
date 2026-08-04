import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PortariaShellComponent } from "./components/portaria-shell/portaria-shell.component";
import { BaseModalComponent } from "./components/base-modal/base-modal.component";
import { FuncionarioAutocompleteComponent } from "./components/funcionario-autocomplete/funcionario-autocomplete.component";
import { TableSearchComponent } from "./components/table-search/table-search.component";
import { PaginacaoComponent } from "./components/paginacao/paginacao.component";
import { TabelaFiltradaModule } from "./tabela-filtrada";
import { ToastComponent } from "./components/toast/toast.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TabelaFiltradaModule,
  ],
  declarations: [
    NavbarComponent,
    PortariaShellComponent,
    BaseModalComponent,
    FuncionarioAutocompleteComponent,
    TableSearchComponent,
    PaginacaoComponent,
    ToastComponent,
  ],
  exports: [
    NavbarComponent,
    PortariaShellComponent,
    BaseModalComponent,
    TableSearchComponent,
    FuncionarioAutocompleteComponent,
    PaginacaoComponent,
    TabelaFiltradaModule,
    ToastComponent,
  ],
})
export class SharedModule {}
