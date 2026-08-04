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
import { EmprestadasComponent } from "./components/chaves/emprestadas/emprestadas.component";
import { InventarioComponent } from "./components/chaves/inventario/inventario.component";
import { MovimentacoesComponent } from "./components/movimentacoes/movimentacoes.component";
import { HistoricoMovimentacoesComponent } from "./components/movimentacoes/historico/historico-movimentacoes.component";
import { VisitasAtivasComponent } from "./components/movimentacoes/visitas-ativas/visitas-ativas.component";

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
    EmprestadasComponent,
    InventarioComponent,
    CardLeiturasComponent,
    MovimentacoesComponent,
    HistoricoMovimentacoesComponent,
    EmprestimosHistoricoComponent,
    VisitasAtivasComponent,
  ],
  exports: [PortariaComponent],
})
export class PortariaModule {}
