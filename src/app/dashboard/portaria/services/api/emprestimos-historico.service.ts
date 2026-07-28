import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import {
  ChavesEmprestimosFiltros,
  ChavesPage,
  ChavesResponseDTO,
  ChaveViewModel,
  PaginacaoVM,
} from "../../models/api";
import {
  ChavesEmprestimoTabConfig,
  ColunaEmprestimoChave,
  EDIFICIO_LABEL,
  PISO_LABEL,
  STATUS_CHAVE_CONFIG,
} from "../../models/enums";
import { catchError, finalize, map } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";

const TAB: ChavesEmprestimoTabConfig[] = [
  {
    value: "HISTORICO",
    label: "Histórico de Empréstimos",
    paginada: true,
    colunas: [
      "edificio",
      "codigo",
      "sala",
      "nomeFuncionario",
      "desde",
      "devolucao",
    ],
  },
];

@Injectable({
  providedIn: "root",
})
export class EmprestimosHistoricoService {
  private chaves = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly chavesEmprestimoHistorico$ = this.chaves.asObservable();

  private estaCarregandoDados = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDados$ = this.estaCarregandoDados.asObservable();

  private tabAtiva = new BehaviorSubject<ChavesEmprestimoTabConfig>(TAB[0]);
  readonly tabAtiva$ = this.tabAtiva.asObservable();

  readonly colunas$: Observable<ColunaEmprestimoChave[]> = this.tabAtiva$.pipe(
    map((tab) => tab.colunas),
  );

  filtroDataInicio = new BehaviorSubject<Date | null>(null);
  filtroDataFim = new BehaviorSubject<Date | null>(null);

  tab = TAB;

  // PAGINAÇÃO
  paginaAtual$ = new BehaviorSubject<number>(0);
  totalPaginas$ = new BehaviorSubject<number>(0);

  paginacao$: Observable<PaginacaoVM> = combineLatest(
    this.paginaAtual$,
    this.totalPaginas$,
    this.tabAtiva$,
  ).pipe(
    map(([paginaAtual, totalPaginas, tab]) => ({
      paginaAtual,
      totalPaginas,
      paginas: this.calcularPaginasVisiveis(paginaAtual + 1, totalPaginas),
      temAnterior: paginaAtual > 0,
      temProximo: paginaAtual < totalPaginas - 1,
      visivel: tab.paginada && totalPaginas > 1,
    })),
  );

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.setPagina(0);
    this.carregarEmprestimoHistorico();
  }

  // Recebe a página de destino (0-based, igual ao backend)
  setPagina(pagina: number): void {
    const total = this.totalPaginas$.value;
    const dentroDoLimite = pagina >= 0 && pagina <= total - 1;

    if (!dentroDoLimite || pagina === this.paginaAtual$.value) return;

    this.paginaAtual$.next(pagina);
    this.carregarEmprestimoHistorico();
  }

  // =============================================
  // ================= GET =======================

  carregarEmprestimoHistorico(
    partials?: Partial<ChavesEmprestimosFiltros>,
  ): void {
    this.estaCarregandoDados.next(true);
    console.log(partials);

    let parametros = new HttpParams();
    parametros = parametros
      .set("page", String(this.paginaAtual$.value))
      .set("size", "20");

    // reinicia página para a primeira
    if (partials) this.paginaAtual$.next(0);

    if (partials && partials.dataFim)
      parametros = parametros.set("fim", partials.dataFim);
    if (partials && partials.dataInicio)
      parametros = parametros.set("inicio", partials.dataInicio);
    if (partials && partials.idEdificio)
      parametros = parametros.set("idEdificio", String(partials.idEdificio));
    if (partials && partials.texto)
      parametros = parametros.set("nome", partials.texto);

    this.http
      .get<ChavesPage>(environment.chavesEmprestimoHistoricoApiUrl, {
        params: parametros,
      })
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV-INV: " + err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.chaves.next(resultado.content.map((c) => this.toViewModel(c)));

        this.totalPaginas$.next(resultado.totalPages);
      });
  }

  // ================================
  // ========== UTILITARIOS =========
  // Insere os rótulos de exibição (status, edifício, piso) na chave retornada
  private toViewModel(chave: ChavesResponseDTO): ChaveViewModel {
    const pisoLabel = PISO_LABEL[chave.piso] || "-";

    return {
      ...chave,
      statusConfig: STATUS_CHAVE_CONFIG[chave.status],
      edificioLabel: EDIFICIO_LABEL[chave.idEdificio] || "-",
      pisoLabel,
      // Este service não usa ng2-smart-table, mas o ViewModel passou a exigir
      // os campos achatados que a lib obriga a existir na página de Chaves.
      // O custo da lib atravessou a fronteira e chegou aqui.
      salaLabel: chave.sala != null ? `Sala ${chave.sala} · ${pisoLabel}` : "",
      desdeLabel: "",
    };
  }

  // TODO: Tornar isso uma Directive ou algo reaproveitável
  // Remove múltiplos espaços entre palavras e limpa início/fim
  private normalizarTexto(texto: string): string {
    return texto.replace(/\s+/g, " ").trim();
  }

  // PAGINAÇÃO
  private calcularPaginasVisiveis(
    atual: number,
    total: number,
  ): (number | "...")[] {
    if (total <= 1) return [];

    const paginasRelevantes = Array.from(
      new Set([1, atual - 1, atual, atual + 1, total]),
    )
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);

    const resultado: (number | "...")[] = [];
    paginasRelevantes.forEach((p, i) => {
      if (i > 0 && p - paginasRelevantes[i - 1] > 1) resultado.push("...");
      resultado.push(p);
    });

    return resultado;
  }
}
