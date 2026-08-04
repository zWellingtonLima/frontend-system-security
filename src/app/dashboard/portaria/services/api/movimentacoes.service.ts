import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import {
  Movimentacoes,
  movimentacoesFiltro,
  movimentacoesPage,
  novaVisita,
  TiposVisitas,
} from "../../models/movimentacoes.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { Paginador } from "src/app/shared/utils/paginador";
import { FormGroup } from "@angular/forms";

const TAMANHO_PAGINA = 20;

export const FILTROS_VAZIOS_MOVIMENTACOES: movimentacoesFiltro = {
  tipoVisita: "",
  dataInicio: "",
  dataFim: "",
  textoBusca: "",
};

@Injectable({
  providedIn: "root",
})
export class MovimentacoesService {
  private readonly apiUrl = environment.movimentacoesApiUrl;
  constructor(private http: HttpClient) {}

  private estaCarregandoDados = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDados$ = this.estaCarregandoDados.asObservable();

  private movimentacoesBehavior = new BehaviorSubject<Movimentacoes[]>([]);
  readonly listaMovimentacoes$ = this.movimentacoesBehavior.asObservable();

  private movimentacoesAtivasBehavior = new BehaviorSubject<Movimentacoes[]>(
    [],
  );
  readonly listaMovimentacoesAtivas$ =
    this.movimentacoesAtivasBehavior.asObservable();

  private countAtivasBehavior = new BehaviorSubject<number>(0);
  readonly countAtivas$ = this.countAtivasBehavior.asObservable();

  private filtros = new BehaviorSubject<movimentacoesFiltro>(
    FILTROS_VAZIOS_MOVIMENTACOES,
  );

  readonly paginador = new Paginador(() => this.listar(), TAMANHO_PAGINA);

  inicializar(): void {
    this.filtros.next(FILTROS_VAZIOS_MOVIMENTACOES);
    this.paginador.reset();
    this.listar();
  }

  aplicarFiltros(filtros: movimentacoesFiltro): void {
    this.filtros.next({
      ...filtros,
      textoBusca: this.normalizarTexto(filtros.textoBusca),
    });
    this.paginador.primeiraPagina();
    this.listar();
  }

  limparFiltros(): void {
    this.filtros.next(FILTROS_VAZIOS_MOVIMENTACOES);
    this.paginador.primeiraPagina();
    this.listar();
  }

  registoVisita(body: novaVisita) {
    return this.http.post(this.apiUrl, body);
  }

  carregarAtivas(): Observable<Movimentacoes[]> {
    return this.http.get<Movimentacoes[]>(`${this.apiUrl}/ativas`).pipe(
      tap((res) => {
        this.countAtivasBehavior.next(res.length);
        this.movimentacoesAtivasBehavior.next(res);
      }),
    );
  }

  private listaDeTipos = new BehaviorSubject<TiposVisitas[]>([]);
  readonly listaPartilhada$ = this.listaDeTipos.asObservable();

  // Altere o tipo de retorno para Observable
  carregarTipoVisita(): void {
    this.http.get<TiposVisitas[]>(`${this.apiUrl}/tipos`).subscribe((res) => {
      this.listaDeTipos.next(res);
    });
  }

  marcarSaidaRapida(id: number) {
    return this.http.put(`${this.apiUrl}/${id}`, {});
  }

  atualizarVisita(id: number, body: novaVisita) {
    return this.http.patch(`${this.apiUrl}/${id}`, body);
  }

  // linhasMovimentacoes$ = new BehaviorSubject<Movimentacoes[]>([]);
  // colunasMovimentacoes$ = new BehaviorSubject<MovimentacoesColunaChave[]>(
  //   movColunas,
  // );

  // carregarAtivas() {
  //   this.http
  //     .get<Movimentacoes[]>(`${environment.movimentacoesApiUrl}/ativas`)
  //     .subscribe((resultado) => this.linhasMovimentacoes$.next(resultado));
  // }

  listar(): void {
    this.estaCarregandoDados.next(true);
    const filtro = this.filtros.value;
    let params = new HttpParams()
      .set("page", String(this.paginador.pagina))
      .set("size", String(this.paginador.tamanho));

    if (filtro.tipoVisita) {
      params = params.set("tipoVisita", String(filtro.tipoVisita));
    }
    if (filtro.textoBusca) {
      params = params.set(
        "pesquisa",
        String(this.normalizarTexto(filtro.textoBusca)),
      );
    }
    if (filtro.dataInicio) {
      params = params.set("inicio", String(filtro.dataInicio));
    }
    if (filtro.dataFim) {
      params = params.set("fim", String(filtro.dataFim));
    }
    this.http
      .get<movimentacoesPage>(this.apiUrl, { params })
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV-INV: " + err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) {
          return;
        }
        this.movimentacoesBehavior.next(resultado.content);
        this.paginador.definirTotal(
          resultado.totalPages,
          resultado.totalElements,
        );
      });
  }

  private normalizarTexto(texto: string): string {
    return texto.replace(/\s+/g, " ").trim();
  }
}
