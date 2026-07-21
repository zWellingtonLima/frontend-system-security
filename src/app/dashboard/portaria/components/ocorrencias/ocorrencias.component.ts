import { Component, OnDestroy, OnInit } from "@angular/core";
import { debounceTime, take, takeUntil } from "rxjs/operators";
import { OcorrenciasService } from "../../services/api/ocorrencias.service";
import {
  EstadoOcorrenciaEnumType,
  OcorrenciaTabConfig,
  TipoOcorrenciaEnumType,
  TIPOS_OCORRENCIA,
} from "../../models/enums";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // FORM
  criarOcorrenciaForm!: FormGroup;
  isCriandoOcorrencia$ = this.ocorrenciasService.estaCriandoOcorrencia$; // Loader POST
  filtrosForm!: FormGroup;

  // MODAL
  modalIsOpen: boolean = false;

  // FILTROS e TABS
  tabs = this.ocorrenciasService.tabs;
  tipos = TIPOS_OCORRENCIA;

  ocorrencias$ = this.ocorrenciasService.ocorrenciasList$;
  tabAtiva$ = this.ocorrenciasService.tabAtiva$;
  carregando$ = this.ocorrenciasService.estaCarregandoDados$; // Loader GET

  paginacao$ = this.ocorrenciasService.paginacao$;

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

    this.filtrosForm = new FormGroup({
      search: new FormControl(""),
      tipo: new FormControl(""),
    });

    this.filtrosForm
      .get("search")!
      .valueChanges.pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.ocorrenciasService.setFiltro({ search });
      });

    this.filtrosForm
      .get("tipo")!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((tipo) => {
        this.ocorrenciasService.setFiltro({ tipo });
      });
  }

  onTabChange(tab: OcorrenciaTabConfig) {
    // Limpa a UI dos filtros sem emitir valueChanges (evitaria um fetch duplicado);
    // o reset do estado interno acontece no service.setTab
    // remover o emitEvent causa duplo fetch
    this.filtrosForm.reset({ search: "", tipo: "" }, { emitEvent: false });
    this.ocorrenciasService.setTab(tab);
  }

  // Setas anterior/seguinte - recebe a página de destino (0-based)
  onPageChange(pagina: number) {
    this.ocorrenciasService.setPagina(pagina);
  }

  // Botões numerados - converte a página exibida (1-based) para 0-based
  irParaPagina(p: number | "...") {
    if (typeof p !== "number") return;
    this.ocorrenciasService.setPagina(p - 1);
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

    this.ocorrenciasService
      .criarOcorrencia(this.criarOcorrenciaForm.value)
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
