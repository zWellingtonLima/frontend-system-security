import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  Movimentacoes,
  movimentacoesFiltro,
  novaVisita,
  PageResponse,
  TiposVisitas,
} from "../../models/movimentacoes.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class MovimentacoesService {
  private readonly apiUrl = environment.movimentacoesApiUrl;
  constructor(private http: HttpClient) {}

  registoVisita(body: novaVisita) {
    return this.http.post(this.apiUrl, body);
  }

  carregarAtivas(): Observable<Movimentacoes[]> {
    return this.http.get<Movimentacoes[]>(`${this.apiUrl}/ativas`);
  }

  carregarTipoVisita(): Observable<TiposVisitas[]> {
    return this.http.get<TiposVisitas[]>(`${this.apiUrl}/tipos`);
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

  listar(filtro: movimentacoesFiltro): Observable<PageResponse<Movimentacoes>> {
    let params = new HttpParams()
      .set("page", String(filtro.page))
      .set("size", String(filtro.size));

    if (filtro.tipo) {
      params = params.set("tipo", filtro.tipo);
    }
    if (filtro.dataInicio) {
      params = params.set("inicio", String(filtro.dataInicio));
    }
    if (filtro.dataFim) {
      params = params.set("fim", String(filtro.dataFim));
    }
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => ({
        movimentacoes: res.content,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
        page: res.number,
        size: res.size,
      })),
    );
  }
}
