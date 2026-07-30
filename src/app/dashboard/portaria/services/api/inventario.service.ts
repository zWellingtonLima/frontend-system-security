import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import {
  ChaveViewModel,
  ChavesInventarioFiltros,
  ChavesPage,
} from "../../models/api";
import { environment } from "src/environments/environment";
import { Paginador } from "src/app/shared/utils/paginador";
import { toViewModel } from "./chaves.mapper";

export const FILTROS_VAZIOS_INVENTARIO: ChavesInventarioFiltros = {
  idEdificio: "",
  piso: "",
  textoBusca: "",
};

const TAMANHO_PAGINA = 20;

@Injectable()
export class InventarioService {
  private chaves = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly chaves$ = this.chaves.asObservable();

  private filtros = new BehaviorSubject<ChavesInventarioFiltros>(
    FILTROS_VAZIOS_INVENTARIO,
  );

  private estaCarregando = new BehaviorSubject<boolean>(false);
  readonly estaCarregando$ = this.estaCarregando.asObservable();

  readonly paginador = new Paginador(() => this.carregar(), TAMANHO_PAGINA);

  constructor(private http: HttpClient) {}

  aplicarFiltros(filtros: ChavesInventarioFiltros): void {
    this.filtros.next({
      ...filtros,
      textoBusca: this.normalizarTexto(filtros.textoBusca),
    });
    this.paginador.primeiraPagina();
    this.carregar();
  }

  limparFiltros(): void {
    this.filtros.next(FILTROS_VAZIOS_INVENTARIO);
    this.paginador.primeiraPagina();
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
        this.paginador.definirTotal(
          resultado.totalPages,
          resultado.totalElements,
        );
      });
  }

  // Filtro por preencher não vai no pedido: o backend trata a ausência do
  // parâmetro como "todos".
  private construirParametros(): HttpParams {
    const filtros = this.filtros.value;

    let parametros = new HttpParams()
      .set("page", String(this.paginador.pagina))
      .set("size", String(this.paginador.tamanho));

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
}
