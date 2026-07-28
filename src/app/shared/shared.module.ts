import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { PortariaShellComponent } from "./components/portaria-shell/portaria-shell.component";
import { BaseModalComponent } from "./components/base-modal/base-modal.component";
import { FuncionarioAutocompleteComponent } from "./components/funcionario-autocomplete/funcionario-autocomplete.component";
import { FiltrosColunaComponent } from "./components/filtros-coluna/filtros-coluna.component";

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, BrowserAnimationsModule],
  declarations: [
    NavbarComponent,
    PortariaShellComponent,
    BaseModalComponent,
    FuncionarioAutocompleteComponent,
    FiltrosColunaComponent,
  ],
  exports: [
    NavbarComponent,
    PortariaShellComponent,
    BaseModalComponent,
    FuncionarioAutocompleteComponent,
    FiltrosColunaComponent,
  ],
})
export class SharedModule {}
