import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { PortariaRoutingModule } from "./portaria-routing.module";
import { PortariaComponent } from "./portaria.component";
import { SharedModule } from "src/app/shared/shared.module";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ConsumosComponent } from "./components/consumos/consumos.component";
import { OcorrenciasComponent } from "./components/ocorrencias/ocorrencias.component";
import { ChavesComponent } from "./components/chaves/chaves.component";
import { CardLeiturasComponent } from "./components/consumos/card-leituras/card-leituras.component";
import { EmprestimosHistoricoComponent } from "./components/chaves/historico/historico.component";

@NgModule({
  imports: [
    CommonModule,
    PortariaRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PortariaComponent,
    DashboardComponent,
    ConsumosComponent,
    OcorrenciasComponent,
    ChavesComponent,
    CardLeiturasComponent,
    EmprestimosHistoricoComponent,
  ],
  exports: [PortariaComponent],
})
export class PortariaModule {}
