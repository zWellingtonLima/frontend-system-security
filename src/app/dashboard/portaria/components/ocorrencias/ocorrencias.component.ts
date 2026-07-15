import { Component, OnInit } from "@angular/core";
import { take } from "rxjs/operators";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import {
  EstadoOcorrenciaEnumType,
  TabConfig,
  TipoOcorrenciaEnumType,
  TIPOS_OCORRENCIA,
} from "../../models/enums";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { OcorrenciasCriarDTO } from "../../models/api";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit {
  // FORM
  criarOcorrenciaForm!: FormGroup;
  isCriandoOcorrencia$ = this.ocorrenciasService.criandoOcorrencia$; // Loader POST

  // MODAL
  modalIsOpen: boolean = false;

  // FILTROS e TABS
  tabs = this.ocorrenciasService.tabs;
  tipos = TIPOS_OCORRENCIA;
  tipoFiltro$ = this.ocorrenciasService.tipoFiltro$;

  ocorrenciasFiltradas$ = this.ocorrenciasService.ocorrenciasFiltradas$;
  totalPaginas$ = this.ocorrenciasService.totalPaginas$;
  tabAtiva$ = this.ocorrenciasService.tabAtiva$;
  carregando$ = this.ocorrenciasService.carregandoDados$; // Loader GET

  paginaAtual = 0;

  constructor(private ocorrenciasService: OcorrenciasService) {}

  ngOnInit() {
    // Carrega Ocorrências
    this.ocorrenciasService.inicializar();

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
    if (this.criarOcorrenciaForm.invalid) {
      Object.values(this.criarOcorrenciaForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    // Valida formulário no component, envia correto para o service
    // Regex remove multiplos espacos entre as palavras e o trim limpa começo e final do texto
    const dados: OcorrenciasCriarDTO = {
      ...this.criarOcorrenciaForm.value,
      ocorrencia: String(this.criarOcorrenciaForm.value.ocorrencia || "")
        .replace(/\s+/g, " ")
        .trim(),
    };

    this.ocorrenciasService
      .criarOcorrencia(dados)
      .pipe(take(1))
      .subscribe((sucesso) => {
        if (sucesso) {
          this.alternarVisibilidadeModal();
          this.criarOcorrenciaForm.reset({
            tipoOcorrencia: TIPOS_OCORRENCIA[0].value,
            ocorrencia: "",
          });
        }
      });
  }

  // Modal
  alternarVisibilidadeModal(): void {
    this.modalIsOpen = !this.modalIsOpen;
  }

  trackById(_: number, o: { id: number }) {
    return o.id;
  }
}
