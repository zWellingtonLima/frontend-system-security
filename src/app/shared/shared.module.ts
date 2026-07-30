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
import { FiltrosColunaComponent } from "./components/filtros-coluna/filtros-coluna.component";
import { PaginacaoComponent } from "./components/paginacao/paginacao.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    NavbarComponent,
    PortariaShellComponent,
    BaseModalComponent,
    FuncionarioAutocompleteComponent,
    FiltrosColunaComponent,
    TableSearchComponent,
    PaginacaoComponent,
  ],
  exports: [
    NavbarComponent,
    PortariaShellComponent,
    BaseModalComponent,
    TableSearchComponent,
    FuncionarioAutocompleteComponent,
    FiltrosColunaComponent,
    PaginacaoComponent,
  ],
})
export class SharedModule {}
