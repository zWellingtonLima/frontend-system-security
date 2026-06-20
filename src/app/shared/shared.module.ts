import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { TopbarComponent } from "./components/topbar/topbar.component";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule],
  declarations: [NavbarComponent, TopbarComponent],
  exports: [NavbarComponent, TopbarComponent],
})
export class SharedModule {}
