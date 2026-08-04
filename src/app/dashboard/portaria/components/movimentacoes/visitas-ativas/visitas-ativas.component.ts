import { Component, OnInit, ViewChild } from "@angular/core";
import {
  Movimentacoes,
  novaVisita,
  TiposVisitas,
} from "../../../models/movimentacoes.model";
import { SearchFieldConfig } from "src/app/shared/components/table-search/table-search.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MovimentacoesService } from "../../../services/api/movimentacoes.service";
import { TableSearchComponent } from "src/app/shared/components/table-search/table-search.component";
import { Subject } from "rxjs";
import { ToastComponent } from "src/app/shared/components/toast/toast.component";

@Component({
  selector: "app-visitas-ativas",
  templateUrl: "./visitas-ativas.component.html",
  styleUrls: ["./visitas-ativas.component.scss"],
})
export class VisitasAtivasComponent implements OnInit {
  constructor(
    private movimentacoesService: MovimentacoesService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.movimentacoesService.carregarAtivas().subscribe();
    this.carregarTipoVisitaCombo();
    this.iniciarFormulario();
    this.carregarAtivas();
  }

  carregando: boolean = false;

  carregarAtivas(): void {
    this.movimentacoesService.listaMovimentacoesAtivas$.subscribe({
      next: (res) => {
        this.dadosOriginais = res;
        this.dadosFiltrados = res;
      },
      error: () => {
        this.mostrarToast("Erro ao carregar visitas");
      },
    });
  }

  carregarTipoVisitaCombo() {
    this.movimentacoesService.listaPartilhada$.subscribe((dados) => {
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
        .subscribe(
          () => {
            this.alternarVisibilidadeModal();
            this.movimentacoesService.carregarAtivas().subscribe();
            this.mostrarToast("Visita atualizada com sucesso!");
          },
          () => {
            this.mostrarToast("Erro ao atualizar a visita.");
            this.alternarVisibilidadeModal();
          },
        );
    }
  }

  registarFormuluarioVisita() {
    if (this.formularioRegistarVisita.valid) {
      this.movimentacoesService
        .registoVisita(this.formularioRegistarVisita.value)
        .subscribe(
          () => {
            this.alternarVisibilidadeModal();
            this.movimentacoesService.carregarAtivas().subscribe();
            this.mostrarToast("Visita registada com sucesso!");
          },
          () => {
            this.mostrarToast("Erro ao registar a visita.");
            this.alternarVisibilidadeModal();
          },
        );
    }
  }

  marcarSaidaRapido(item: Movimentacoes) {
    this.movimentacoesService.marcarSaidaRapida(item.id).subscribe(
      () => {
        this.movimentacoesService.carregarAtivas().subscribe();
        this.mostrarToast("Saída registada com sucesso!");
      },
      () => {
        this.mostrarToast("Erro ao marcar saida.");
      },
    );
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
