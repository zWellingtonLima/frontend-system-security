import { Component, OnInit, ViewChild } from "@angular/core";
import {
  componenteMovimentacoesEnum,
  componenteMovimentacoesType,
  novaVisita,
  TiposVisitas,
} from "../../models/movimentacoes.model";
import { MovimentacoesService } from "../../services/api/movimentacoes.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ToastComponent } from "src/app/shared/components/toast/toast.component";

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

  count$!: Observable<number>;

  ngOnInit() {
    this.count$ = this.movimentacoesService.countAtivas$;
    this.movimentacoesService.carregarTipoVisita();
    this.iniciarFormulario();
  }

  tipoVisita = this.movimentacoesService.listaPartilhada$;
  carregando: boolean = false;

  formularioRegistarVisita: FormGroup = new FormGroup({});
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
    if (this.formularioRegistarVisita.valid) {
      console.log(this.formularioRegistarVisita.value);
      this.movimentacoesService
        .registoVisita(this.formularioRegistarVisita.value)
        .subscribe(
          () => {
            this.alternarVisibilidadeModal();
            this.movimentacoesService.carregarAtivas().subscribe();
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
}
