import { Component, OnInit } from "@angular/core";
import {
  Movimentacoes,
  novaVisita,
  TiposVisitas,
} from "../../models/movimentacoes.model";
import { MovimentacoesService } from "../../services/api/movimentacoes.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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

  carregarAposAlteracao() {
    this.carregarAtivas();
  }

  ngOnInit() {
    this.carregarTipoVisitaCombo();
    this.iniciarFormulario();
    this.carregarAtivas();
  }
  movimentacoes: Movimentacoes[] = [];
  carregando: boolean = false;

  carregarAtivas() {
    this.movimentacoesService.carregarAtivas().subscribe((res) => {
      this.movimentacoes = res;
    });
  }
  carregarTipoVisitaCombo() {
    this.movimentacoesService.carregarTipoVisita().subscribe((res) => {
      this.tipoVisita = res;
      console.log(res);
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

  abrirModalEmprestar() {
    this.botaoEnvio = "Registar";
    this.modalIsOpen = !this.modalIsOpen;
  }

  atualizarVisita() {}
  registarFormuluarioVisita() {
    if (this.formularioRegistarVisita.valid) {
      this.movimentacoesService
        .registoVisita(this.formularioRegistarVisita.value)
        .subscribe(
          () => {
            this.alternarVisibilidadeModal();
            this.carregarAposAlteracao();
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
        this.carregarAposAlteracao();
        this.mostrarToast("Saída registada com sucesso!");
      },
      () => {
        this.mostrarToast("Erro ao marcar saida.");
      },
    );
  }

  abrirEditar(item: Movimentacoes) {
    console.log(item);
    this.formularioRegistarVisita.patchValue(item);
    console.log(this.formularioRegistarVisita.value);
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
    this.modoEdicao = false;
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
