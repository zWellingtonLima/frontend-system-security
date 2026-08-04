import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  ConsumoLeitura,
  EdificiosResponse,
  TipoConsumoEnum,
  TipoConsumoType,
  UltimaLeitura,
} from "../../models/consumo.model";
import {
  ConsumosService,
  FILTROS_VAZIOS_CONSUMOS,
} from "../../services/api/consumos.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-consumos",
  templateUrl: "./consumos.component.html",
  styleUrls: ["./consumos.component.scss"],
})
export class ConsumosComponent implements OnInit, OnDestroy {
  constructor(
    private consumoService: ConsumosService,
    private fb: FormBuilder,
  ) {}

  filtrosForm!: FormGroup;
  paginador = this.consumoService.paginador;

  // ── Cards "leituras actuais" ──
  ultimaAgua: UltimaLeitura | null = null;
  ultimaEletricidade: UltimaLeitura | null = null;
  ultimaGas: UltimaLeitura | null = null;

  // ── Tabela / paginação ──
  leituras: ConsumoLeitura[] = [];
  carregando = this.consumoService.estaCarregandoDados$;

  // ── Toast ──
  toastVisivel = false;
  toastMensagem = "";
  private toastTimeout: any;

  ngOnInit() {
    this.consumoService.inicializar();
    this.filtrosForm = this.fb.group(FILTROS_VAZIOS_CONSUMOS);
    this.iniciarFormulario();
    this.chamarEdificios();
    this.carregarConsumos();
    this.carregarUltimas();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimeout);
  }

  aplicarFiltros(): void {
    this.consumoService.aplicarFiltros(this.filtrosForm.value);
  }

  limparFiltros(): void {
    this.filtrosForm.reset(FILTROS_VAZIOS_CONSUMOS);
    this.consumoService.limparFiltros(this.abaAtiva);
  }

  carregarAposAlteracao() {
    this.carregarConsumos();
    this.carregarUltimas();
  }
  // ─────────────────────────────────────────────
  // CARREGA OS DADOS PARA A TABELAS
  // ─────────────────────────────────────────────
  carregarConsumos(): void {
    this.consumoService.listaConsumos$.subscribe(
      (res) => {
        this.leituras = res;
      },
      () => {
        this.mostrarToast("Erro ao carregar as leituras.");
      },
    );
  }

  // ─────────────────────────────────────────────
  // CARREGA AS ULTIMAS LEITURAS PARA POR NOS CARDS onInit
  // ─────────────────────────────────────────────
  carregarUltimas(): void {
    this.consumoService.ultimas().subscribe(
      (res) => {
        res.forEach((item) => {
          switch (item.tipoConsumo) {
            case this.tipoConsumo.AGUA:
              this.leiturasAgua = item.lista;
              break;
            case this.tipoConsumo.ELETRICIDADE:
              this.leiturasEletricidade = item.lista;
              break;
            case this.tipoConsumo.GAS:
              this.leiturasGas = item.lista;
              break;
          }
        });
      },
      () => {
        this.mostrarToast("Erro ao carregar as leituras.");
      },
    );
  }

  // ─────────────────────────────────────────────
  // LÓGICA DOS FILTROS DE PESQUISA
  // ─────────────────────────────────────────────
  abaAtiva: TipoConsumoType = "AGUA";

  // ─────────────────────────────────────────────
  // AGUA - ELETRICIDADE - GAS | MUDANÇA NO STYLE E CHAMADA DOS DADOS
  // ─────────────────────────────────────────────
  novoTipo: TipoConsumoType = "AGUA";
  readonly tipoConsumo = TipoConsumoEnum;

  selecionarAba(abaStyle: TipoConsumoType): void {
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
    this.limparFiltros();
    this.paginador.primeiraPagina;
    this.filtrosForm.patchValue({ tipo: abaStyle });
    this.aplicarFiltros();
  }

  // ─────────────────────────────────────────────
  // TOAST - PEQUENO MODAL PARA MOSTRAR RESULTADOS(OPCIONAL)
  // ─────────────────────────────────────────────
  private mostrarToast(mensagem: string): void {
    this.toastMensagem = mensagem;
    this.toastVisivel = true;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toastVisivel = false), 3400);
  }

  // ─────────────────────────────────────────────
  // FORMULARIO DE REGISTAR LEITURA MODAL
  // ─────────────────────────────────────────────
  registarLeituraForm: FormGroup = new FormGroup({});

  unidadeAtual = null;
  consumoCalculadoPreview: number | null = 0;
  ultimaLieituraForm: UltimaLeitura | null = null;
  edificios: EdificiosResponse[] = [];
  consumoElevado: number = 800;

  modalExcluirOpen: boolean = false;
  modalIsOpen: boolean = false;
  modoEdicao: boolean = false;
  modoEliminar: boolean = false;
  botaoEnvio: string = "Registar";

  iniciarFormulario() {
    this.registarLeituraForm = this.fb.group({
      id: [null],
      tipoConsumo: ["", Validators.required],
      edificioId: ["", Validators.required],
      leituraAtual: [0, [Validators.required, Validators.min(0)]],
      observacao: ["", [Validators.maxLength(255)]],
    });
  }

  registarLeitura() {
    if (this.registarLeituraForm.valid) {
      this.consumoService
        .criar({
          valorLeitura: this.registarLeituraForm.value.leituraAtual,
          notas: this.registarLeituraForm.value.observacao,
          edificioId: this.registarLeituraForm.value.edificioId,
          tipoConsumo: this.registarLeituraForm.value.tipoConsumo,
        })
        .subscribe(
          () => {
            this.mostrarToast("Leitura registada com sucesso!");
            this.consumoService.listar();
            this.alternarVisibilidadeModal();
          },
          () => {
            this.mostrarToast("Erro ao registar a leitura.");
            this.alternarVisibilidadeModal();
          },
        );
    }
  }

  registarAtualizar() {
    if (this.registarLeituraForm.valid) {
      this.consumoService
        .atualizar(this.registarLeituraForm.value.id, {
          valorLeitura: this.registarLeituraForm.value.leituraAtual,
          notas: this.registarLeituraForm.value.observacao,
          edificioId: this.registarLeituraForm.value.edificioId,
          tipoConsumo: this.registarLeituraForm.value.tipoConsumo,
        })
        .subscribe(
          (res) => {
            this.consumoService.listar();
            this.mostrarToast("Leitura atualizada com sucesso!");
            this.alternarVisibilidadeModal();
          },
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao atualizar a leitura.");
          },
        );
    }
  }

  submeterEliminar() {
    this.consumoService.eliminar(this.leituraIdParaExcluir).subscribe(
      () => {
        this.modalExcluirOpen = false;
        this.leituraIdParaExcluir = undefined;
        this.carregarAposAlteracao();
        this.mostrarToast("Leitura excluída com sucesso!");
      },
      () => {
        this.modalExcluirOpen = false;
        this.mostrarToast("Erro ao excluir leitura.");
      },
    );
  }

  chamarEdificios() {
    this.consumoService.preencherEdificio().subscribe(
      (res) => {
        this.edificios = res;
      },
      () => {
        this.mostrarToast("Erro ao carregar os dados");
      },
    );
  }

  selecionarTipoConsumo(tipo: string): void {
    this.registarLeituraForm.patchValue({ tipoConsumo: tipo });
    this.pegarUltimaLeituraForm();
  }

  onLeituraAtualChange(): void {
    const valorAtual = this.registarLeituraForm.value.leituraAtual;
    this.consumoCalculadoPreview =
      this.ultimaLieituraForm &&
      this.ultimaLieituraForm.leituraAtual !== null &&
      valorAtual
        ? valorAtual - this.ultimaLieituraForm.leituraAtual
        : null;
  }

  pegarUltimaLeituraForm() {
    const tipo = this.registarLeituraForm.get("tipoConsumo");
    const edificio = this.registarLeituraForm.get("edificioId");
    if (
      tipo &&
      tipo.value != null &&
      tipo.value !== "" &&
      edificio &&
      edificio.value != null &&
      edificio.value !== ""
    ) {
      this.consumoService
        .ultimaLeituraForm(tipo.value, edificio.value)
        .subscribe((res) => {
          this.ultimaLieituraForm = res;
        });
    }
  }

  // ─────────────────────────────────────────────
  // FUNÇÕES DOS BOTOES DAS TABELAS PARA EDITAR/ EXLUIR
  // ─────────────────────────────────────────────
  leituraIdParaExcluir?: number;

  abrirExcluir(item: ConsumoLeitura) {
    this.modalExcluirOpen = true;
    this.leituraIdParaExcluir = item.id;
  }

  abrirEditar(item: ConsumoLeitura) {
    this.registarLeituraForm.reset();
    this.modoEdicao = true;
    this.modalIsOpen = true;
    this.botaoEnvio = "Atualizar";
    this.registarLeituraForm.patchValue(item);
  }

  alternarVisibilidadeModal() {
    this.modalIsOpen = !this.modalIsOpen;

    if (this.modalIsOpen) {
      this.modoEdicao = false;
      this.botaoEnvio = "Registar";
    }

    this.registarLeituraForm.reset();
    this.ultimaLieituraForm = null;
    this.consumoCalculadoPreview = null;
  }

  Unidades = {
    ELETRICIDADE: "kWh",
    AGUA: "m³",
    GAS: "m³",
  };

  leiturasAgua?: UltimaLeitura[];

  leiturasEletricidade?: UltimaLeitura[];

  leiturasGas?: UltimaLeitura[];
}
