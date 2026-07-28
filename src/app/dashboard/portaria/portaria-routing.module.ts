import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConsumosComponent } from "./components/consumos/consumos.component";
import { OcorrenciasComponent } from "./components/ocorrencias/ocorrencias.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ChavesComponent } from "./components/chaves/chaves.component";
import { MovimentacoesComponent } from "./components/movimentacoes/movimentacoes.component";
import { HistoricoMovimentacoesComponent } from "./components/movimentacoes/historico/historico-movimentacoes.component";

const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
  },
  {
    path: "consumos",
    component: ConsumosComponent,
  },
  {
    path: "ocorrencias",
    component: OcorrenciasComponent,
  },
  {
    path: "movimentacoes",
    component: MovimentacoesComponent,
  },
  {
    path: "chaves",
    component: ChavesComponent,
  },
  {
    path: "historico/movimentacoes",
    component: HistoricoMovimentacoesComponent,
  },

  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "ocorrencias",
  },
  {
    path: "chaves",
    redirectTo: "/chaves",
    pathMatch: "full",
  },
  {
    path: "movimentacoes",
    redirectTo: "/movimentacoes",
    pathMatch: "full",
  },
  {
    path: "historico/movimentacoes",
    redirectTo: "historico/movimentacoes",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortariaRoutingModule {}
