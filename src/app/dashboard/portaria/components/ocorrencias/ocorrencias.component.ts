import { Component, OnInit } from "@angular/core";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import {
  ESTADO_OCORRENCIA_CONFIG,
  EstadoOcorrenciaEnumType,
  TabConfig,
  TIPO_OCORRENCIA_CONFIG,
  TipoOcorrenciaEnumType,
  TIPOS_OCORRENCIA,
} from "../../models/enums";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit {
  criarOcorrenciaForm!: FormGroup;
  modalIsOpen: boolean = true;

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

  // Modal
  alternarVisibilidadeModal(): void {
    this.modalIsOpen = !this.modalIsOpen;
  }

  // UPDATE
  alterarEstado(estado: EstadoOcorrenciaEnumType, idOcorrencia: number) {
    this.ocorrenciasService.alterarEstado(estado, idOcorrencia);
  }

  trackById(_: number, o: { id: number }) {
    return o.id;
  }
}
