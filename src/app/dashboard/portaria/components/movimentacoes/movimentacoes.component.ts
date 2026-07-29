import { Component, OnInit } from "@angular/core";
import {
  Movimentacoes,
  novaVisita,
  TiposVisitas,
} from "../../models/movimentacoes.model";
import { MovimentacoesService } from "../../services/api/movimentacoes.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SearchFieldConfig } from "src/app/shared/components/table-search/table-search.component";

@Component({
  selector: "app-movimentacoes",
  templateUrl: "./movimentacoes.component.html",
  styleUrls: ["./movimentacoes.component.scss"],
  })
export class MovimentacoesComponent implements OnInit {
  
  constructor(
    private movimentacoesService: MovimentacoesService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.carregarTipoVisitaCombo();
    this.iniciarFormulario();
    this.carregarAtivas();
  }
  movimentacoes: Movimentacoes[] = [];
  carregando: boolean = false;

  carregarAtivas() {
    this.movimentacoesService.carregarAtivas().subscribe((res) => {
      this.dadosOriginais = res;
      this.dadosFiltrados = res;
    });
  }

  carregarTipoVisitaCombo() {
    this.movimentacoesService.carregarTipoVisita().subscribe((res) => {
      this.tipoVisita = res;
      this.montarCamposPesquisa();
    });
  }

  formularioRegistarVisita: FormGroup = new FormGroup({});
  modalIsOpen: boolean = false;
  modoEdicao: boolean = false;
  tipoVisita?: TiposVisitas[];
  botaoEnvio?: string;
  novaVisita?: novaVisita;

  iniciarFormulario() {
    this.formularioRegistarVisita = this.fb.group({
      id: [null],
      nomeVisitante: ["", Validators.required],
      setorDestino: ["", Validators.required],
      idTipoVisita: [null, Validators.required],
      funcionarioResponsavel: [null],
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
            this.carregarAtivas();
            this.mostrarToast("Visita atualizada com sucesso!");
          },
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao atualizar a visita.");
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
            this.carregarAtivas();
            this.mostrarToast("Visita registada com sucesso!");
          },
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao registar a visita.");
          },
        );
    }
  }

  leituraIdParaExcluir?: number;

  abrirExcluir(item: Movimentacoes) {
    this.leituraIdParaExcluir = item.id;
  }
  marcarSaidaRapido(item: Movimentacoes) {
    this.movimentacoesService.marcarSaidaRapida(item.id).subscribe(
      () => {
        this.carregarAtivas();
        this.mostrarToast("Saída registada com sucesso!");
      },
      () => {
        this.mostrarToast("Erro ao marcar saida.");
      },
    );
  }

  abrirModalEmprestar() {
    this.botaoEnvio = "Registar";
    this.modalIsOpen = !this.modalIsOpen;
  }

  abrirEditar(item: Movimentacoes) {
    this.formularioRegistarVisita.patchValue(item);
    this.modoEdicao = true;
    this.modalIsOpen = true;
    this.botaoEnvio = "Atualizar";
  }

  alternarVisibilidadeModal() {
    this.modalIsOpen = !this.modalIsOpen;

    if (this.modalIsOpen) {
      this.modoEdicao = false;
      this.botaoEnvio = "Registar";
    }
    this.formularioRegistarVisita.reset();
  }

  dadosOriginais: Movimentacoes[] = [];
  dadosFiltrados: Movimentacoes[] = [];
  camposPesquisa: SearchFieldConfig<Movimentacoes>[] = [];

  filtrosAtuais: { [campo: string]: string } = {};

  private montarCamposPesquisa(): void {
    console.log(this.tipoVisita);
    this.camposPesquisa = [
      { campo: "nomeVisitante", label: "", tipo: "texto" },
      { campo: "horaEntrada", label: "Data", tipo: "data" },
      {
        campo: "tipoVisita",
        label: "Todos os tipos",
        tipo: "select",
        opcoes: this.tipoVisita
          ? this.tipoVisita.map((element) => ({
              valor: element.tipo,
              label: element.tipo,
            }))
          : [],
      },
      { campo: "setorDestino", label: "", tipo: "texto" },
      { campo: "funcionarioResponsavel", label: "", tipo: "texto" },
      { campo: "notas", label: "", tipo: "texto" },
    ];
  }

  onFiltrosChange(filtros: { [campo: string]: string }): void {
    this.filtrosAtuais = filtros;
    this.dadosFiltrados = this.filtrarLocal(this.dadosOriginais, filtros);
  }

  private filtrarLocal(
    dados: Movimentacoes[],
    filtros: { [campo: string]: string },
  ): Movimentacoes[] {
    if (!filtros || !Object.keys(filtros).length) {
      return dados;
    }
    return dados.filter((item: any) =>
      Object.keys(filtros).every((campo) =>
        String(item[campo] || "")
          .toLowerCase()
          .includes(filtros[campo].toLowerCase()),
      ),
    );
  }

  // ── Toast ──
  toastVisivel = false;
  toastMensagem = "";
  private toastTimeout: any;

  private mostrarToast(mensagem: string): void {
    this.toastMensagem = mensagem;
    this.toastVisivel = true;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toastVisivel = false), 3400);
  }
}
