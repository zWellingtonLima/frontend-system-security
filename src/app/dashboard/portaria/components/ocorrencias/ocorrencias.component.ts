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
import { OcorrenciaViewModel } from "../../models/api";

type ModoModal = "criar" | "editar";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // FORM
  ocorrenciaForm!: FormGroup;
  estaSalvando$ = this.ocorrenciasService.estaSalvando$; // Loader POST/PUT
  filtrosForm!: FormGroup;

  // MODAL
  modalIsOpen: boolean = false;
  modoModal: ModoModal = "criar";
  ocorrenciaEmEdicao: number | null = null;

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

    this.ocorrenciaForm = new FormGroup({
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
    this.ocorrenciaForm.get("tipoOcorrencia")!.setValue(tipo);
  }

  // Abre o modal em modo edição preenchido com os valores atuais.
  // A resposta traz `tipo`; o form usa `tipoOcorrencia`.
  abrirEdicao(ocor: OcorrenciaViewModel): void {
    this.modoModal = "editar";
    this.ocorrenciaEmEdicao = ocor.id;
    this.ocorrenciaForm.patchValue({
      tipoOcorrencia: ocor.tipo,
      ocorrencia: ocor.ocorrencia,
    });
    this.modalIsOpen = true;
  }

  onSubmit() {
    if (this.ocorrenciaForm.invalid) {
      Object.values(this.ocorrenciaForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    const requisicao =
      this.modoModal === "editar" && this.ocorrenciaEmEdicao !== null
        ? this.ocorrenciasService.atualizarOcorrencia(
            this.ocorrenciaEmEdicao,
            this.ocorrenciaForm.value,
          )
        : this.ocorrenciasService.criarOcorrencia(this.ocorrenciaForm.value);

    requisicao.pipe(take(1)).subscribe((sucesso) => {
      if (sucesso) this.fecharModal();
    });
  }

  // Modal
  abrirCriacao(): void {
    this.modoModal = "criar";
    this.ocorrenciaEmEdicao = null;
    this.ocorrenciaForm.reset({
      tipoOcorrencia: TIPOS_OCORRENCIA[0].value,
      ocorrencia: "",
    });
    this.modalIsOpen = true;
  }

  fecharModal(): void {
    this.modalIsOpen = false;
    this.modoModal = "criar";
    this.ocorrenciaEmEdicao = null;
    this.ocorrenciaForm.reset({
      tipoOcorrencia: TIPOS_OCORRENCIA[0].value,
      ocorrencia: "",
    });
  }

  trackById(_: number, o: { id: number }) {
    return o.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
