import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment.dev";
import {
  ConsumoFiltro,
  ConsumoLeitura,
  ConsumoPayload,
  CountTabelas,
  PageResponse,
  UltimaLeitura,
} from "../../models/consumo.model";

@Injectable({
  providedIn: "root",
})
export class ConsumosService {
  private readonly apiUrl = `${environment.consumosApiUrl}/consumos`;

  constructor(private http: HttpClient) {}

  ultimas(): Observable<UltimaLeitura[]> {
    return this.http.get<UltimaLeitura[]>(`${this.apiUrl}/ultimas`);
  }

  countTabelas(): Observable<CountTabelas[]> {
    return this.http.get<CountTabelas[]>(`${this.apiUrl}/count`);
  }

  listar(filtro: ConsumoFiltro): Observable<PageResponse<ConsumoLeitura>> {
    let params = new HttpParams()
      .set("page", String(filtro.page))
      .set("size", String(filtro.size));

    if (filtro.tipo) {
      params = params.set("tipo", filtro.tipo);
    }
    if (filtro.periodo) {
      params = params.set("periodo", filtro.periodo);
    }
    if (filtro.pesquisa) {
      params = params.set("pesquisa", filtro.pesquisa);
    }

    return this.http.get<PageResponse<ConsumoLeitura>>(
      `${this.apiUrl}/paginacao`,
      { params },
    );
  }

  criar(payload: ConsumoPayload): Observable<ConsumoLeitura> {
    return this.http.post<ConsumoLeitura>(this.apiUrl, payload);
  }

  atualizar(id: number, payload: ConsumoPayload): Observable<ConsumoLeitura> {
    return this.http.put<ConsumoLeitura>(`${this.apiUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
