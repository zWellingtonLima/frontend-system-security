import { Component, OnInit } from "@angular/core";
import {
  ConsumoLeitura,
  EdificiosResponse,
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
    this.iniciarFormulario();
    this.chamarEdificios();
    this.carregarConsumos();
    this.carregarUltimas();
    this.preencherCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.toastTimeout);
  }

  carregarAposAlteracao() {
    this.carregarConsumos();
    this.carregarUltimas();
    this.preencherCount();
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

  // ── Mudança dos estiloss ──

  // ── Tabela / count(*) das leituas de cada tipo ──
  totalEletricidade = 0;
  totalGas = 0;
  totalAgua = 0;

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
  // PREENCHE O COUNT | AGUA - ELETRICIDADE - GAS - onInit
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

  private destroy$ = new Subject<void>();
  dataInicio?: Date;
  dataFim?: Date;
  edificioId?: number;
  abaAtiva: any = "AGUA";

  readonly pageSize = 20;

  filtroInicio(dataInicio: Date) {
    console.log(dataInicio);
    this.dataInicio = dataInicio;

    this.carregarConsumos();
  }
  filtroFim(dataFim: Date) {
    console.log(dataFim);
    this.dataFim = dataFim;
    this.carregarConsumos();
  }
  filtroEdificio(edificio: number) {
    console.log(edificio);
    this.edificioId = edificio;
    this.carregarConsumos();
  }

  // ─────────────────────────────────────────────
  // AGUA - ELETRICIDADE - GAS | MUDANÇA NO STYLE E CHAMADA DOS DADOS
  // ─────────────────────────────────────────────
  novoTipo: TipoConsumoType = "AGUA";

  selecionarAba(abaStyle: TipoConsumoType): void {
    console.log(abaStyle);
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
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
    console.log(this.edificioId);
    this.consumoService.eliminar(this.edificioId).subscribe(
      () => {
        this.modalExcluirOpen = false;
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
}
