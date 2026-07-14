import { Component, OnInit } from "@angular/core";
import {
  ConsumoLeitura,
  PeriodoFiltro,
  TipoConsumoType,
  UltimaLeitura,
} from "../../models/consumo.model";
import { ConsumosService } from "../../services/api/consumos.service";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
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
    this.registarLeituraForm = this.fb.group({
      tipoConsumo: ["", Validators.required],
      edificioId: ["", Validators.required],
      leituraAtual: [null, [Validators.required, Validators.min(0)]],
      observacao: [""],
    });

    this.carregarConsumos();
    this.carregarUltimas();
    this.preencherCount();

    this.pesquisa$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.carregarConsumos();
        console.log(this.pesquisa);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.toastTimeout);
  }

  // ── Cards "leituras actuais" ──
  ultimaAgua: UltimaLeitura | null = null;
  ultimaEletricidade: UltimaLeitura | null = null;
  ultimaGas: UltimaLeitura | null = null;

  // ── Modal: nova leitura ──
  modalNovoAberto = false;
  novoTipo: TipoConsumoType = "AGUA";
  novoValor: number | null = null;
  novaObs = "";
  salvandoNovo = false;

  // ── Tabela / paginação ──
  leituras: ConsumoLeitura[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 1;
  carregando = false;

  abaAtiva: any = "AGUA";
  abaCarregar: string = "1";
  periodo: PeriodoFiltro = "";

  totalEletricidade = 0;
  totalGas = 0;
  totalAgua = 0;

  // ── Modal: editar leitura ──
  modalEditarAberto = false;
  editId: number | null = null;
  editTipo: TipoConsumoType = "AGUA";
  editValor: number | null = null;
  editObs = "";
  editData = "";
  salvandoEdicao = false;

  // ── Modal: eliminar leitura ──
  modalEliminarAberto = false;
  leituraParaEliminar: ConsumoLeitura | null = null;
  eliminando = false;

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
        periodo: this.periodo,
        tipo: this.abaCarregar,
        pesquisa: this.pesquisa,
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
  // CARREGA AS ULTIMAS LEITURAS PARA POR NOS CARDS
  // ─────────────────────────────────────────────
  carregarUltimas(): void {
    this.consumoService.ultimas().subscribe(
      (res) => {
        res.forEach((leituras) => {
          switch (leituras.tipoConsumo) {
            case 1:
              this.ultimaAgua = leituras;
              break;
            case 2:
              this.ultimaEletricidade = leituras;
              break;
            case 3:
              this.ultimaGas = leituras;
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
  // PREENCHE O COUNT | AGUA - ELETRICIDADE - GAS
  // ─────────────────────────────────────────────

  preencherCount() {
    this.consumoService.countTabelas().subscribe(
      (res) => {
        res.forEach((contagem) => {
          switch (contagem.tipoConsumo) {
            case 1:
              this.totalAgua = contagem.count;
              break;
            case 2:
              this.totalEletricidade = contagem.count;
              break;
            case 3:
              this.totalGas = contagem.count;
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

  private pesquisa$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  pesquisa = "";
  readonly pageSize = 10;

  onFiltroChange(periodo: PeriodoFiltro) {
    this.periodo = periodo;
    this.carregarConsumos();
  }

  onPesquisaChange(valor: string): void {
    this.pesquisa = valor;
    this.pesquisa$.next(valor);
  }

  filtroPesquisa() {}
  abrirExcluir() {}

  // ─────────────────────────────────────────────
  // AGUA - ELETRICIDADE - GAS | MUDANÇA NO STYLE E CHAMADA DOS DADOS
  // ─────────────────────────────────────────────

  selecionarAba(aba: string, abaStyle: TipoConsumoType): void {
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
    this.abaCarregar = aba;
    this.currentPage = 1;
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
  // FUNÇÕES DOS BOTOES DAS TABELAS PARA EDITAR/ EXLUIR
  // ─────────────────────────────────────────────
  submeterEliminar() {}

  abrirEditar(leitura: ConsumoLeitura): void {
    this.modalEditarAberto = true;
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

  selecionarTipoConsumo(tipo: string): void {
    this.registarLeituraForm?.patchValue({ tipoConsumo: tipo });
  }

  edificios = [
    {
      id: 1,
      nome: "Edificio A",
    },
    {
      id: 2,
      nome: "Edificio B",
    },
  ];
  unidadeAtual = null;

  onLeituraAtualChange() {}

  registarLeituraForm?: FormGroup;
  modalIsOpen: boolean = false;

  alternarVisibilidadeModal() {
    this.modalIsOpen = !this.modalIsOpen;
  }
  registarLeitura() {}

  Unidades = {
    ELETRICIDADE: "kWh",
    AGUA: "m³",
    GAS: "m³",
  };
}
