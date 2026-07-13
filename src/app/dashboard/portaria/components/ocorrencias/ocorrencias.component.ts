import { Component, OnInit } from "@angular/core";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import {
  EstadoOcorrenciaEnumType,
  TabConfig,
  TipoOcorrenciaEnumType,
  TIPOS_OCORRENCIA,
} from "../../models/enums";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit {
  tabs = this.ocorrenciasService.tabs;
  tipos = TIPOS_OCORRENCIA;

  ocorrenciasFiltradas$ = this.ocorrenciasService.ocorrenciasFiltradas$;
  totalPaginas$ = this.ocorrenciasService.totalPaginas$;
  tabAtiva$ = this.ocorrenciasService.tabAtiva$;
  carregando$ = this.ocorrenciasService.carregandoDados$;

  paginaAtual = 0;

  constructor(private ocorrenciasService: OcorrenciasService) {}

  ngOnInit() {
    this.ocorrenciasService.inicializar();
  }

  onTabChange(tab: TabConfig) {
    this.paginaAtual = 0;
    this.ocorrenciasService.setTab(tab);
  }

  onSearchChange(search: string) {
    this.ocorrenciasService.setFiltroLocal({ search });
  }

  onPageChange(page: number) {
    this.paginaAtual = page;
    this.ocorrenciasService.setPagina(page);
  }

  onTipoChange(tipo: TipoOcorrenciaEnumType | "") {
    this.ocorrenciasService.setFiltroLocal({ tipo });
  }

  // UPDATE
  alterarEstado(estado: EstadoOcorrenciaEnumType, idOcorrencia: number) {
    this.ocorrenciasService.alterarEstado(estado, idOcorrencia);
  }

  trackById(_: number, o: { id: number }) {
    return o.id;
  }
}
