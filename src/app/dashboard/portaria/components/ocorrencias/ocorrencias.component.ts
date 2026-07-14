import { Component, OnInit } from "@angular/core";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import {
  EstadoOcorrenciaEnumType,
  TabConfig, TipoOcorrenciaEnumType,
  TIPOS_OCORRENCIA
} from "../../models/enums";
import {
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit {
  // FORM
  criarOcorrenciaForm!: FormGroup;
  modalIsOpen: boolean = true;

  // FILTROS e TABS
  tabs = this.ocorrenciasService.tabs;
  tipos = TIPOS_OCORRENCIA;
  tipoFiltro$ = this.ocorrenciasService.tipoFiltro$;

  ocorrenciasFiltradas$ = this.ocorrenciasService.ocorrenciasFiltradas$;
  totalPaginas$ = this.ocorrenciasService.totalPaginas$;
  tabAtiva$ = this.ocorrenciasService.tabAtiva$;
  carregando$ = this.ocorrenciasService.carregandoDados$;

  paginaAtual = 0;

  constructor(private ocorrenciasService: OcorrenciasService) {}

  ngOnInit() {
    // Carrega Ocorrências
    this.ocorrenciasService.inicializar();

    // Verificar se existe necessidade de realocar logica dos forms para outro componente
    this.criarOcorrenciaForm = new FormGroup({
      tipoOcorrencia: new FormControl(TIPOS_OCORRENCIA[0].value, [
        Validators.required,
      ]),
      ocorrencia: new FormControl("", [
        Validators.required,
        Validators.minLength(5),
      ]),
    });
  }

  onTabChange(tab: TabConfig) {
    this.paginaAtual = 0;
    this.ocorrenciasService.setTab(tab);
    console.log(this.tipoFiltro$);
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

  // CRIAR NOVA OCORRENCIA
  selecionarTipo(tipo: TipoOcorrenciaEnumType): void {
    this.criarOcorrenciaForm.get("tipoOcorrencia")!.setValue(tipo);
  }

  onSubmit() {
    if (this.criarOcorrenciaForm.valid) {
      console.log(this.criarOcorrenciaForm.value);
    }

    // Regex remove multiplos espacos entre as palavras e o trim limpa começo e final do texto
    const dados = {
      ...this.criarOcorrenciaForm.value,
      ocorrencia: this.criarOcorrenciaForm.value.ocorrencia
        .replace(/\s+/g, " ")
        .trim(),
    };

    // Criar serviço para enviar os dados
    console.log(dados);
  }

  // Modal
  alternarVisibilidadeModal(): void {
    this.modalIsOpen = !this.modalIsOpen;
  }

  trackById(_: number, o: { id: number }) {
    return o.id;
  }
}
