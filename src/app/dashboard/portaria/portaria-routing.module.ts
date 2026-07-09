import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConsumosComponent } from "./components/consumos/consumos.component";
import { OcorrenciasComponent } from "./components/ocorrencias/ocorrencias.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ChavesComponent } from "./components/chaves/chaves.component";

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
    path: "chaves",
    component: ChavesComponent,
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortariaRoutingModule {}
