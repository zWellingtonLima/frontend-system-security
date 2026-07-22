import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  ConsumoLeitura,
  EdificiosResponse,
  TipoConsumoType,
  UltimaLeitura,
} from "../../models/consumo.model";
import { ConsumosService } from "../../services/api/consumos.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-consumos",
  templateUrl: "./consumos.component.html",
  styleUrls: ["./consumos.component.scss"],
})
export class ConsumosComponent implements OnInit {
  constructor(
    private consumoService: ConsumosService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.iniciarFormulario();
    this.chamarEdificios();
    this.carregarConsumos();
    this.carregarUltimas();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimeout);
  }

  carregarAposAlteracao() {
    this.carregarConsumos();
    this.carregarUltimas();
  }

  // ── Cards "leituras actuais" ──
  ultimaAgua: UltimaLeitura | null = null;
  ultimaEletricidade: UltimaLeitura | null = null;
  ultimaGas: UltimaLeitura | null = null;

  // ── Tabela / paginação ──
  leituras: ConsumoLeitura[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 1;
  carregando = false;

  // ── Toast ──
  toastVisivel = false;
  toastMensagem = "";
  private toastTimeout: any;

  // ─────────────────────────────────────────────
  // CARREGA OS DADOS PARA A TABELAS
  // ─────────────────────────────────────────────
  carregarConsumos(): void {
    this.carregando = true;

    this.consumoService
      .listar({
        tipo: this.abaAtiva,
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
        edificioId: this.edificioId,
        page: this.currentPage - 1,
        size: this.pageSize,
      })
      .subscribe(
        (res) => {
          this.leituras = res.consumos;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.page + 1;
          this.carregando = false;
        },
        () => {
          this.carregando = false;
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
        for (let i = 0; i < res.length; i++) {
          switch (i) {
            case 0:
              this.leiturasAgua = res[i].lista;
              break;
            case 1:
              this.leiturasEletricidade = res[i].lista;
              break;
            case 2:
              this.leiturasGas = res[i].lista;
              break;
          }
        }
      },
      () => {
        this.mostrarToast("Erro ao carregar as leituras.");
      },
    );
  }

  // ─────────────────────────────────────────────
  // LÓGICA DOS FILTROS DE PESQUISA
  // ─────────────────────────────────────────────
  dataInicio?: Date | null;
  dataFim?: Date | null;
  edificioId?: number;
  abaAtiva: any = "AGUA";

  readonly pageSize = 20;
  filtroInicio(dataInicio: Date) {
    this.currentPage = 1;
    this.dataInicio = dataInicio;
    this.carregarConsumos();
  }

  filtroFim(dataFim: Date) {
    this.currentPage = 1;
    this.dataFim = dataFim;
    this.carregarConsumos();
  }
  filtroEdificio(edificio: number) {
    this.currentPage = 1;
    this.edificioId = edificio;
    this.carregarConsumos();
  }

  // ─────────────────────────────────────────────
  // AGUA - ELETRICIDADE - GAS | MUDANÇA NO STYLE E CHAMADA DOS DADOS
  // ─────────────────────────────────────────────
  novoTipo: TipoConsumoType = "AGUA";
  @ViewChild("barraEdificio") barraEdificio!: ElementRef<HTMLSelectElement>;
  @ViewChild("inicio") inicio!: ElementRef<HTMLSelectElement>;
  @ViewChild("fim") fim!: ElementRef<HTMLSelectElement>;

  apagarFiltros() {
    this.barraEdificio.nativeElement.value = "";
    this.inicio.nativeElement.value = "";
    this.fim.nativeElement.value = "";
    this.edificioId = undefined;
    this.dataInicio = null;
    this.dataFim = null;
  }

  selecionarAba(abaStyle: TipoConsumoType): void {
    console.log(abaStyle);
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
    this.currentPage = 1;
    this.apagarFiltros();
    this.carregarConsumos();
  }

  selecionarNovoTipo(tipo: TipoConsumoType): void {
    this.novoTipo = tipo;
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
  // PAGINAÇÃO LÓGICAS
  // ─────────────────────────────────────────────

  get paginasVisiveis(): (number | "...")[] {
    const total = this.totalPages;
    const atual = this.currentPage;
    const paginas: (number | "...")[] = [];

    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - atual) <= 1) {
        paginas.push(p);
      } else if (paginas[paginas.length - 1] !== "...") {
        paginas.push("...");
      }
    }
    return paginas;
  }

  irParaPagina(pagina: number | "..."): void {
    if (typeof pagina !== "number") {
      return;
    }
    if (pagina < 1 || pagina > this.totalPages || pagina === this.currentPage) {
      return;
    }
    this.currentPage = pagina;
    this.carregarConsumos();
  }

  ehReticencia(p: number | "..."): boolean {
    return p === "...";
  }

  isPaginaAtual(p: number | "..."): boolean {
    return typeof p === "number" && p === this.currentPage;
  }

  // ─────────────────────────────────────────────
  // VERIFICAR SE HÁ DADOS PAGINAÇÃO FOOTER
  // ─────────────────────────────────────────────

  get textoPaginacao(): string {
    if (this.totalElements === 0) {
      return "0 registos";
    }
    return `${this.inicioIntervalo} - ${this.fimIntervalo} de ${this.totalElements}`;
  }

  get inicioIntervalo(): number {
    return this.totalElements === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get fimIntervalo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalElements);
  }

  formatarValor(valor: number): string {
    if (valor === null || valor === undefined) {
      return "-";
    }
    return valor.toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
      console.log(this.registarLeituraForm.value);
      this.consumoService
        .criar({
          valorLeitura: this.registarLeituraForm.value.leituraAtual,
          notas: this.registarLeituraForm.value.observacao,
          edificioId: this.registarLeituraForm.value.edificioId,
          tipoConsumo: this.registarLeituraForm.value.tipoConsumo,
          dataRegisto: "",
        })
        .subscribe(
          (res) => {
            console.log(res);
            this.alternarVisibilidadeModal();
            this.carregarAposAlteracao();
            this.mostrarToast("Leitura registada com sucesso!");
          },
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao registar a leitura.");
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
          dataRegisto: "",
        })
        .subscribe(
          (res) => {
            console.log(res);
            this.carregarAposAlteracao();
            this.alternarVisibilidadeModal();
            this.mostrarToast("Leitura atualizada com sucesso!");
          },
          () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao atualizar a leitura.");
          },
        );
    }
  }

  submeterEliminar() {
    this.consumoService.eliminar(this.edificioId).subscribe(
      () => {
        this.modalExcluirOpen = false;
        this.edificioId = undefined;
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
      console.log(this.leituras[1].leituraAtual);
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
  abrirExcluir(item: any) {
    this.modalExcluirOpen = !this.modalExcluirOpen;
    this.edificioId = item.id;
  }

  abrirEditar(item: any) {
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
