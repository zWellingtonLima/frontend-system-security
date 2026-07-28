import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  Movimentacoes,
  novaVisita,
  TiposVisitas,
} from "../../models/movimentacoes.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class MovimentacoesService {
  private readonly apiUrl = environment.movimentacoesApiUrl;
  constructor(private http: HttpClient) {}

  registoVisita(body: novaVisita) {
    console.log(body);
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
}
