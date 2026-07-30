import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import {
  ChaveViewModel,
  ChavesInventarioFiltros,
  ChavesPage,
  PaginacaoVM,
} from "../../models/api";
import { environment } from "src/environments/environment";
import { toViewModel } from "./chaves.mapper";

export const FILTROS_VAZIOS_INVENTARIO: ChavesInventarioFiltros = {
  idEdificio: "",
  piso: "",
  textoBusca: "",
};

const TAMANHO_PAGINA = "20";

@Injectable()
export class InventarioService {
  private chaves = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly chaves$ = this.chaves.asObservable();

  private filtros = new BehaviorSubject<ChavesInventarioFiltros>(
    FILTROS_VAZIOS_INVENTARIO,
  );

  private estaCarregando = new BehaviorSubject<boolean>(false);
  readonly estaCarregando$ = this.estaCarregando.asObservable();

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

  setPagina(pagina: number): void {
    const total = this.totalPaginas.value;
    const dentroDoLimite = pagina >= 0 && pagina <= total - 1;

    if (!dentroDoLimite || pagina === this.paginaAtual.value) return;

    this.paginaAtual.next(pagina);
    this.carregar();
  }

  aplicarFiltros(filtros: ChavesInventarioFiltros): void {
    this.filtros.next({
      ...filtros,
      textoBusca: this.normalizarTexto(filtros.textoBusca),
    });
    this.paginaAtual.next(0);
    this.carregar();
  }

  limparFiltros(): void {
    this.filtros.next(FILTROS_VAZIOS_INVENTARIO);
    this.paginaAtual.next(0);
    this.carregar();
  }

  carregar(): void {
    this.estaCarregando.next(true);

    this.http
      .get<ChavesPage>(environment.chavesListagemApiUrl, {
        params: this.construirParametros(),
      })
      .pipe(
        catchError((err) => {
          console.error("INV-SERV-LISTA: " + err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregando.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.chaves.next(resultado.content.map(toViewModel));
        this.totalPaginas.next(resultado.totalPages);
      });
  }

  // Filtro por preencher não vai no pedido: o backend trata a ausência do
  // parâmetro como "todos".
  private construirParametros(): HttpParams {
    const filtros = this.filtros.value;

    let parametros = new HttpParams()
      .set("page", String(this.paginaAtual.value))
      .set("size", TAMANHO_PAGINA);

    if (filtros.piso) parametros = parametros.set("piso", filtros.piso);
    if (filtros.idEdificio !== "")
      parametros = parametros.set("idEdificio", String(filtros.idEdificio));
    if (filtros.textoBusca)
      parametros = parametros.set("codigoChave", filtros.textoBusca);

    return parametros;
  }

  // TODO: Tornar isso uma Directive ou algo reaproveitável
  // Remove múltiplos espaços entre palavras e limpa início/fim
  private normalizarTexto(texto: string): string {
    return texto.replace(/\s+/g, " ").trim();
  }

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
