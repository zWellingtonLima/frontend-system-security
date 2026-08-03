import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import {
  ChavesEmprestimosFiltros,
  ChavesPage,
  ChaveViewModel,
} from "../../../models/api";
import { catchError, finalize } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Paginador } from "src/app/shared/utils/paginador";
import { toViewModel } from "./chaves.mapper";

const PARAM_TEXTO_BUSCA = "nome";
export const FILTROS_VAZIOS: ChavesEmprestimosFiltros = {
  dataInicio: "",
  dataFim: "",
  idEdificio: "",
  textoBusca: "",
};

const TAMANHO_PAGINA = 20;

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

  readonly paginador = new Paginador(() => this.carregar(), TAMANHO_PAGINA);

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.filtros.next(FILTROS_VAZIOS);
    this.paginador.reset();
    this.carregar();
  }

  aplicarFiltros(filtros: ChavesEmprestimosFiltros): void {
    this.filtros.next({
      ...filtros,
      textoBusca: this.normalizarTexto(filtros.textoBusca),
    });
    this.paginador.primeiraPagina();
    this.carregar();
  }

  limparFiltros(): void {
    this.filtros.next(FILTROS_VAZIOS);
    this.paginador.primeiraPagina();
    this.carregar();
  }

  // =============================================
  // ================= GET =======================

  private carregar(): void {
    this.estaCarregandoDados.next(true);

    const filtros = this.filtros.value;
    let parametros = new HttpParams()
      .set("page", String(this.paginador.pagina))
      .set("size", String(this.paginador.tamanho));

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

        this.chaves.next(resultado.content.map(toViewModel));
        this.paginador.definirTotal(
          resultado.totalPages,
          resultado.totalElements,
        );
      });
  }

  // ================================
  // ========== UTILITARIOS =========

  // TODO: Tornar isso uma Directive ou algo reaproveitável
  // Remove múltiplos espaços entre palavras e limpa início/fim
  private normalizarTexto(texto: string): string {
    return texto.replace(/\s+/g, " ").trim();
  }
}
