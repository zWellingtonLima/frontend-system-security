import { Component, OnInit, ViewChild } from "@angular/core";
import {
  componenteMovimentacoesEnum,
  componenteMovimentacoesType,
  novaVisita,
} from "../../models/movimentacoes.model";
import { MovimentacoesService } from "../../services/api/movimentacoes.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ToastComponent } from "src/app/shared/components/toast/toast.component";
import { ErrosForm } from "src/app/shared/utils/erros-form";

const MENSAGENS_OBRIGATORIO = {
  nomeVisitante: "Nome do visitante é obrigatório.",
  idTipoVisita: "Selecione na lista o tipo de visita.",
};

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
  private erros = new ErrosForm(MENSAGENS_OBRIGATORIO);
  count$!: Observable<number>;

  ngOnInit() {
    this.count$ = this.movimentacoesService.countAtivas$;
    this.movimentacoesService.carregarTipoVisita();
    this.iniciarFormulario();
  }

  tipoVisita = this.movimentacoesService.listaPartilhada$;
  carregando: boolean = false;

  formularioRegistarVisita!: FormGroup;
  modalIsOpen: boolean = false;
  modoEdicao: boolean = false;
  botaoEnvio?: string;
  novaVisita?: novaVisita;

  iniciarFormulario() {
    this.formularioRegistarVisita = this.fb.group({
      id: [null],
      nomeVisitante: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)],
      ],
      idTipoVisita: [null, Validators.required],
      idRHFuncionario: [null],
      setorFuncionario: [{ value: "", disabled: true }],
      notas: ["", [Validators.maxLength(255)]],
    });
  }

  registarFormuluarioVisita() {
    if (
      !this.erros.validar(this.formularioRegistarVisita, [
        "nomeVisitante",
        "idTipoVisita",
      ])
    )
      return;
    if (this.formularioRegistarVisita.valid) {
      console.log(this.formularioRegistarVisita.value);
      this.movimentacoesService
        .registoVisita(this.formularioRegistarVisita.value)
        .subscribe(
          () => {
            this.alternarVisibilidadeModal();
            this.movimentacoesService.carregarAtivas();
            this.mostrarToast("Visita registada com sucesso!");
          },
          () => {
            this.toast.erro = true;
            this.mostrarToast("Erro ao registar a visita.");
            this.alternarVisibilidadeModal();
          },
        );
    }
  }

  abrirModalEmprestar() {
    this.erros.limpar(this.formularioRegistarVisita);
    this.botaoEnvio = "Registar";
    this.modalIsOpen = !this.modalIsOpen;
  }

  alternarVisibilidadeModal() {
    this.erros.limpar(this.formularioRegistarVisita);
    this.formularioRegistarVisita.reset();
    this.modalIsOpen = !this.modalIsOpen;
  }

  // ── Toast ──
  @ViewChild(ToastComponent) toast!: ToastComponent;
  mostrarToast(msg: string): void {
    this.toast.mostrar(msg);
  }

  abaAtiva: componenteMovimentacoesType = "ATIVAS";
  readonly componenteAtivo = componenteMovimentacoesEnum;
  selecionarAba(abaStyle: componenteMovimentacoesType): void {
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
  }

  erroDoCampo(form: FormGroup, nome: string): string | null {
    return this.erros.erro(form, nome);
  }
}
