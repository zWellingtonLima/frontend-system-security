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
import { Ng2SmartTableModule } from "ng2-smart-table";
import { EstadoCellComponent } from "./components/chaves/celulas/estado-cell.component";
import { AcoesCellComponent } from "./components/chaves/celulas/acoes-cell.component";

@NgModule({
  imports: [
    CommonModule,
    PortariaRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SmartTableModule,
  ],
  declarations: [
    PortariaComponent,
    DashboardComponent,
    ConsumosComponent,
    OcorrenciasComponent,
    ChavesComponent,
    CardLeiturasComponent,
    EmprestimosHistoricoComponent,
    EstadoCellComponent,
    AcoesCellComponent,
  ],
  // Obrigatório no Angular 6 (sem Ivy): a lib instancia estas células por
  // factory em runtime, não há referência a elas em template nenhum. Sem
  // isto o build passa e a tabela rebenta ao renderizar.
  entryComponents: [EstadoCellComponent, AcoesCellComponent],
  exports: [PortariaComponent],
})
export class PortariaModule {}
