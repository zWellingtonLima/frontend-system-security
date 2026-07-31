import { Component, OnInit } from "@angular/core";
import {
  Movimentacoes,
  novaVisita,
  TiposVisitas,
} from "../../../models/movimentacoes.model";
import { SearchFieldConfig } from "src/app/shared/components/table-search/table-search.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MovimentacoesService } from "../../../services/api/movimentacoes.service";

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
    // this.movimentacoesService.carregarAtivas() // movimentacoes tabela
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
      console.log(this.formularioRegistarVisita.value);
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
  filtrosAtuais: { [campo: string]: string } = {};

  private montarCamposPesquisa(): void {
    console.log(this.tipoVisita);
    this.camposPesquisa = [
      { campo: "nomeVisitante", label: "Visitante", tipo: "texto" },
      { campo: "horaEntrada", label: "Entrada", tipo: "texto" },
      {
        campo: "tipoVisita",
        label: "Todos",
        tipo: "select",
        opcoes: this.tipoVisita
          ? this.tipoVisita.map((element) => ({
              valor: element.tipo,
              label: element.tipo,
            }))
          : [],
      },
      { campo: "funcionarioResponsavel", label: "Responsável", tipo: "texto" },
      { campo: "notas", label: "Notas", tipo: "texto" },
    ];
  }

  onFiltrosChange(filtros: { [campo: string]: string }): void {
    console.log(filtros);
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
