import { Component, OnDestroy, OnInit } from "@angular/core";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import { OcorrenciasResponseDTO } from "../../models/api";
import { Observable, Subject } from "rxjs";
import {
  EstadoOcorrenciaEnum,
  EstadoOcorrenciaEnumType,
  EstadoOcorrenciaLabel,
  TipoOcorrenciaEnum,
  TipoOcorrenciaEnumType,
  TipoOcorrenciaLabel,
} from "../../models/enums";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ocorrenciasFiltradas$ = this.ocorrenciasService.ocorrenciasFiltradas$;
  contagens$ = this.ocorrenciasService.contagens$;

  tabAtiva: EstadoOcorrenciaEnumType | "TODAS" = "TODAS";

  EstadoEnum = EstadoOcorrenciaEnum;
  EstadoLabel = EstadoOcorrenciaLabel;
  TipoEnum = TipoOcorrenciaEnum;
  TipoLabel = TipoOcorrenciaLabel;

  constructor(private ocorrenciasService: OcorrenciasService) {}

  ngOnInit() {
    this.ocorrenciasService.carregarTodasOcorrencias();
  }

  onTabChange(tab: EstadoOcorrenciaEnumType | "TODAS") {
    this.tabAtiva = tab;
    this.ocorrenciasService.setTab(tab);
  }

  onSearchChange(search: string) {
    this.ocorrenciasService.setFiltro({ search });
  }

  onTipoChange(tipo: TipoOcorrenciaEnumType | "") {
    this.ocorrenciasService.setFiltro({ tipo });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
