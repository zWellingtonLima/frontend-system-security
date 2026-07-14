import { Component, OnInit } from "@angular/core";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import {
  EstadoOcorrenciaEnumType,
  TabConfig,
  TIPO_OCORRENCIA_CONFIG,
  TipoOcorrenciaEnumType,
  TIPOS_OCORRENCIA
} from "../../models/enums";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit {
  // FORM
  criarOcorrenciaForm!: FormGroup;
  modalIsOpen: boolean = false;

  // FILTROS e TABS
  tabs = this.ocorrenciasService.tabs;
  tipos = TIPOS_OCORRENCIA;

  ocorrenciasFiltradas$ = this.ocorrenciasService.ocorrenciasFiltradas$;
  totalPaginas$ = this.ocorrenciasService.totalPaginas$;
  tabAtiva$ = this.ocorrenciasService.tabAtiva$;
  carregando$ = this.ocorrenciasService.carregandoDados$;

  paginaAtual = 0;

  constructor(
    private ocorrenciasService: OcorrenciasService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    // Carrega Ocorrências
    this.ocorrenciasService.inicializar();

    // Verificar se existe necessidade de realocar logica dos forms para outro componente
    this.criarOcorrenciaForm = this.fb.group({
      tipoOcorrencia: [
        TIPO_OCORRENCIA_CONFIG.ACESSO_NAO_AUTORIZADO.label,
        [Validators.required],
      ],
      ocorrencia: [Validators.required],
    });
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

  // Modal
  alternarVisibilidadeModal(): void {
    this.modalIsOpen = !this.modalIsOpen;
  }

  trackById(_: number, o: { id: number }) {
    return o.id;
  }
}
