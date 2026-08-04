import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import {
  Movimentacoes,
  novaVisita,
  TiposVisitas,
} from "../../../models/movimentacoes.model";
import { SearchFieldConfig } from "src/app/shared/components/table-search/table-search.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MovimentacoesService } from "../../../services/api/movimentacoes.service";
import { Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { ToastComponent } from "src/app/shared/components/toast/toast.component";

@Component({
  selector: "app-visitas-ativas",
  templateUrl: "./visitas-ativas.component.html",
  styleUrls: ["./visitas-ativas.component.scss"],
})
export class VisitasAtivasComponent implements OnInit, OnDestroy {
  constructor(
    private movimentacoesService: MovimentacoesService,
    private fb: FormBuilder,
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.movimentacoesService.carregarAtivas();
    this.carregarAtivas();
    this.carregarTipoVisitaCombo();
    this.iniciarFormulario();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregando: boolean = false;

  carregarAtivas(): void {
    this.carregando = true;
    this.movimentacoesService.listaMovimentacoesAtivas$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.dadosOriginais = res;
          this.dadosFiltrados = res;
          this.carregando = false;
        },
        error: () => {
          this.mostrarToast("Erro ao carregar visitas");
          this.carregando = false;
        },
      });
  }

  carregarTipoVisitaCombo() {
    this.movimentacoesService.listaPartilhada$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dados) => {
        this.tipoVisita = dados;
        this.montarCamposPesquisa();
      });
  }

  formularioRegistarVisita: FormGroup = new FormGroup({});
  modalIsOpen: boolean = false;
  tipoVisita?: TiposVisitas[];
  botaoEnvio?: string;
  novaVisita?: novaVisita;

  iniciarFormulario() {
    this.formularioRegistarVisita = this.fb.group({
      id: [null],
      nomeVisitante: ["", Validators.required],
      idTipoVisita: [null, Validators.required],
      idRHFuncionario: [null],
      setorFuncionario: [{ value: "", disabled: true }],
      notas: ["", [Validators.maxLength(255)]],
    });
  }

  atualizarVisita() {
    if (this.formularioRegistarVisita.valid) {
      this.movimentacoesService
        .atualizarVisita(
          this.formularioRegistarVisita.value.id,
          this.formularioRegistarVisita.value,
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alternarVisibilidadeModal();
            this.movimentacoesService.carregarAtivas();
            this.mostrarToast("Visita atualizada com sucesso!");
          },
          error: () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao atualizar a visita.");
          },
        });
    }
  }

  marcarSaidaRapido(item: Movimentacoes) {
    this.movimentacoesService
      .marcarSaidaRapida(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.movimentacoesService.carregarAtivas();
          this.mostrarToast("Saída registada com sucesso!");
        },
        error: () => {
          this.mostrarToast("Erro ao marcar saida.");
        },
      });
  }

  abrirEditar(item: Movimentacoes) {
    this.formularioRegistarVisita.reset();
    this.formularioRegistarVisita.patchValue(item);
    this.modalIsOpen = true;
    this.botaoEnvio = "Atualizar";
  }

  alternarVisibilidadeModal() {
    this.formularioRegistarVisita.reset();
    this.modalIsOpen = !this.modalIsOpen;
  }

  dadosOriginais: Movimentacoes[] = [];
  dadosFiltrados: Movimentacoes[] = [];
  camposPesquisa: SearchFieldConfig<Movimentacoes>[] = [];
  limpar$ = new Subject<void>();

  private montarCamposPesquisa(): void {
    this.camposPesquisa = [
      { campo: "nomeVisitante", label: "Visitante", tipo: "texto" },
      { campo: "horaEntrada", label: "HH:mm", tipo: "texto" },
      {
        campo: "tipoVisita",
        label: "Tipos",
        tipo: "select",
        opcoes: this.tipoVisita
          ? this.tipoVisita.map((t) => ({
              valor: t.tipo,
              label: t.tipo,
            }))
          : [],
      },
      { campo: "funcionarioResponsavel", label: "Responsável", tipo: "texto" },
      { campo: "notas", label: "Notas", tipo: "texto" },
    ];
  }

  limparFiltros(): void {
    this.limpar$.next();
  }
  onResultado(dados: Movimentacoes[]): void {
    this.dadosFiltrados = dados;
  }

  // ── Toast ──
  @ViewChild(ToastComponent) toast!: ToastComponent;
  mostrarToast(msg: string): void {
    this.toast.mostrar(msg);
  }
}
