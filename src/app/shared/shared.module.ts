import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { TopbarComponent } from "./components/topbar/topbar.component";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { PortariaShellComponent } from './components/portaria-shell/portaria-shell.component';

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule],
  declarations: [NavbarComponent, TopbarComponent, PortariaShellComponent],
  exports: [NavbarComponent, TopbarComponent, PortariaShellComponent],
})
export class SharedModule {}
