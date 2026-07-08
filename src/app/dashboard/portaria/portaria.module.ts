import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PortariaRoutingModule } from "./portaria-routing.module";
import { PortariaComponent } from "./portaria.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [CommonModule, PortariaRoutingModule, SharedModule],
  declarations: [PortariaComponent],
  exports: [PortariaComponent],
})
export class PortariaModule {}
