import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment.dev";
import {
  ConsumoFiltro,
  ConsumoLeitura,
  ConsumoPayload,
  CountTabelas,
  EdificiosResponse,
  PageResponse,
  UltimaLeitura,
} from "../../models/consumo.model";

@Injectable({
  providedIn: "root",
})
export class ConsumosService {
  private readonly apiUrl = environment.consumosApiUrl;

  constructor(private http: HttpClient) {}

  ultimas(): Observable<UltimaLeitura[]> {
    return this.http.get<UltimaLeitura[]>(`${this.apiUrl}/ultimas`);
  }

  ultimaLeituraForm(
    tipoId: string,
    edificioId: string,
  ): Observable<UltimaLeitura> {
    let params = new HttpParams()
      .set("tipoId", tipoId)
      .set("edificioId", edificioId);

    return this.http.get<UltimaLeitura>(`${this.apiUrl}/ultima/formulario`, {
      params: params,
    });
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
    if (filtro.dataInicio) {
      params = params.set("dataInicio", String(filtro.dataInicio));
    }
    if (filtro.dataFim) {
      params = params.set("dataFim", String(filtro.dataFim));
    }
    if (filtro.edificioId) {
      params = params.set("edificioId", String(filtro.edificioId));
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

  eliminar(id?: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  preencherEdificio(): Observable<EdificiosResponse[]> {
    return this.http.get<EdificiosResponse[]>(`${this.apiUrl}/edificios`);
  }
}
