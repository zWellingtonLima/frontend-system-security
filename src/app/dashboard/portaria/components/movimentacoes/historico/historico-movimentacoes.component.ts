import { Component, OnInit } from "@angular/core";
import { MovimentacoesService } from "../../../services/api/movimentacoes.service";
import { Movimentacoes } from "../../../models/movimentacoes.model";
import { TIPOS_LIST } from "../../../models/enums";

@Component({
  selector: "app-historico-movimentacoes",
  templateUrl: "./historico-movimentacoes.component.html",
  styleUrls: ["./historico-movimentacoes.component.scss"],
})
export class HistoricoMovimentacoesComponent implements OnInit {
  constructor(private movimentacoesService: MovimentacoesService) {}

  ngOnInit() {
    this.carregarVisitas();
    console.log(this.tipoVisita);
  }
  limparFiltros() {}

  carregarVisitas(): void {
    this.carregando = true;
    this.movimentacoesService
      .listar({
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
        page: this.currentPage - 1,
        size: this.pageSize,
      })
      .subscribe(
        (res) => {
          this.listaMovimentacoes = res.movimentacoes;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.page + 1;
          this.carregando = false;
        },
        () => {
          this.carregando = false;
        },
      );
  }
  aplicarFiltros() {}
  // ─────────────────────────────────────────────
  // LÓGICA DOS FILTROS DE PESQUISA
  // ─────────────────────────────────────────────
  tipoVisita = TIPOS_LIST;

  dataInicio?: Date | null;
  dataFim?: Date | null;
  edificioId?: number;

  filtroInicio(dataInicio: Date) {
    console.log(this.tipoVisita);
    this.currentPage = 1;
    this.dataInicio = dataInicio;
    this.carregarVisitas();
  }

  filtroFim(dataFim: Date) {
    this.currentPage = 1;
    this.dataFim = dataFim;
    this.carregarVisitas();
  }
  filtroEdificio(edificio: number) {
    this.currentPage = 1;
    this.edificioId = edificio;
    this.carregarVisitas();
  }

  // ── Tabela / paginação ──
  readonly pageSize = 20;
  listaMovimentacoes: Movimentacoes[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 1;
  carregando = false;

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
    this.carregarVisitas();
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
}
