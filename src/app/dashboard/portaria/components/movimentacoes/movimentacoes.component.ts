import { Component, OnInit } from "@angular/core";
import {
  componenteMovimentacoesEnum,
  componenteMovimentacoesType,
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

  ngOnInit() {
    // this.movimentacoesService.carregarAtivas() // movimentacoes tabela
    this.iniciarFormulario();
  }
  carregando: boolean = false;

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
      idTipoVisita: [null, Validators.required],
      idRHFuncionario: [null],
      setorFuncionario: [{ value: "", disabled: true }],
      notas: ["", [Validators.maxLength(255)]],
    });
  }

  registarFormuluarioVisita() {
    if (this.formularioRegistarVisita.valid) {
      console.log(this.formularioRegistarVisita.value);
      this.movimentacoesService
        .registoVisita(this.formularioRegistarVisita.value)
        .subscribe(
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Visita registada com sucesso!");
          },
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao registar a visita.");
          },
        );
    }
  }

  abrirModalEmprestar() {
    this.botaoEnvio = "Registar";
    this.modalIsOpen = !this.modalIsOpen;
  }

  alternarVisibilidadeModal() {
    this.formularioRegistarVisita.reset();
    this.modalIsOpen = !this.modalIsOpen;
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

  abaAtiva: componenteMovimentacoesType = "ATIVAS";
  readonly componenteAtivo = componenteMovimentacoesEnum;
  selecionarAba(abaStyle: componenteMovimentacoesType): void {
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
  }
}
