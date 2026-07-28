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
  COLUNAS_HISTORICO_EMPRESTIMO,
  EDIFICIO_LABEL,
  PISO_LABEL,
  STATUS_CHAVE_CONFIG,
} from "../../models/enums";
import { catchError, finalize, map } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";

const TAMANHO_PAGINA = "20";
const PARAM_TEXTO_BUSCA = "nome";
export const FILTROS_VAZIOS: ChavesEmprestimosFiltros = {
  dataInicio: "",
  dataFim: "",
  idEdificio: "",
  textoBusca: "",
};

@Injectable({
  providedIn: "root",
})
export class EmprestimosHistoricoService {
  private chaves = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly chavesEmprestimoHistorico$ = this.chaves.asObservable();

  private estaCarregandoDados = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDados$ = this.estaCarregandoDados.asObservable();

  private filtros = new BehaviorSubject<ChavesEmprestimosFiltros>(
    FILTROS_VAZIOS,
  );

  readonly colunas = COLUNAS_HISTORICO_EMPRESTIMO;

  // PAGINAÇÃO
  private paginaAtual = new BehaviorSubject<number>(0);
  private totalPaginas = new BehaviorSubject<number>(0);

  readonly paginacao$: Observable<PaginacaoVM> = combineLatest(
    this.paginaAtual,
    this.totalPaginas,
  ).pipe(
    map(([paginaAtual, totalPaginas]) => ({
      paginaAtual,
      totalPaginas,
      paginas: this.calcularPaginasVisiveis(paginaAtual + 1, totalPaginas),
      temAnterior: paginaAtual > 0,
      temProximo: paginaAtual < totalPaginas - 1,
      visivel: totalPaginas > 1,
    })),
  );

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.filtros.next(FILTROS_VAZIOS);
    this.paginaAtual.next(0);
    this.totalPaginas.next(0);
    this.carregar();
  }

  aplicarFiltros(filtros: ChavesEmprestimosFiltros): void {
    this.filtros.next({
      ...filtros,
      textoBusca: this.normalizarTexto(filtros.textoBusca),
    });
    this.paginaAtual.next(0);
    this.carregar();
  }

  limparFiltros(): void {
    this.filtros.next(FILTROS_VAZIOS);
    this.paginaAtual.next(0);
    this.carregar();
  }

  // Recebe a página de destino (0-based, igual ao backend)
  setPagina(pagina: number): void {
    const total = this.totalPaginas.value;
    const dentroDoLimite = pagina >= 0 && pagina <= total - 1;

    if (!dentroDoLimite || pagina === this.paginaAtual.value) return;

    this.paginaAtual.next(pagina);
    this.carregar();
  }

  // =============================================
  // ================= GET =======================

  private carregar(): void {
    this.estaCarregandoDados.next(true);

    const filtros = this.filtros.value;
    let parametros = new HttpParams()
      .set("page", String(this.paginaAtual.value))
      .set("size", TAMANHO_PAGINA);

    if (filtros.dataInicio)
      parametros = parametros.set("inicio", filtros.dataInicio);
    if (filtros.dataFim) parametros = parametros.set("fim", filtros.dataFim);
    if (filtros.idEdificio !== "")
      parametros = parametros.set("idEdificio", String(filtros.idEdificio));
    if (filtros.textoBusca)
      parametros = parametros.set(PARAM_TEXTO_BUSCA, filtros.textoBusca);

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
        this.totalPaginas.next(resultado.totalPages);
      });
  }

  // ================================
  // ========== UTILITARIOS =========
  // Insere os rótulos de exibição (status, edifício, piso) na chave retornada
  private toViewModel(chave: ChavesResponseDTO): ChaveViewModel {
    return {
      ...chave,
      statusConfig: STATUS_CHAVE_CONFIG[chave.status],
      edificioLabel: EDIFICIO_LABEL[chave.idEdificio] || "-",
      pisoLabel: PISO_LABEL[chave.piso] || "-",
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
