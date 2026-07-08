import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PortariaRoutingModule } from "./portaria-routing.module";
import { PortariaComponent } from "./portaria.component";
import { SharedModule } from "src/app/shared/shared.module";
import { ConsumosComponent } from './components/consumos/consumos.component';
import { OcorrenciasComponent } from './components/ocorrencias/ocorrencias.component';

@NgModule({
  imports: [CommonModule, PortariaRoutingModule, SharedModule],
  declarations: [PortariaComponent, ConsumosComponent, OcorrenciasComponent],
  exports: [PortariaComponent],
})
export class PortariaModule {}
