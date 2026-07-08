import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PortariaRoutingModule } from "./portaria-routing.module";
import { PortariaComponent } from "./portaria.component";
import { SharedModule } from "src/app/shared/shared.module";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardService } from './services/dashboard-service';

@NgModule({
  imports: [CommonModule, PortariaRoutingModule, SharedModule],
  declarations: [PortariaComponent, DashboardComponent],
  exports: [PortariaComponent],
  providers: [DashboardService]
})
export class PortariaModule {}
