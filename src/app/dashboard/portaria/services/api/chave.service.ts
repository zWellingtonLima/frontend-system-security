import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { HistoricoEntregaChave, ChavesListagem } from "../../models/api";
import { environment } from "src/environments/environment.dev";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ChaveService {
  private chavesLista$ = new BehaviorSubject<ChavesListagem[]>([]);

  chaves$ = this.chavesLista$.asObservable();

  constructor(private httpClient: HttpClient) {}

  carregarTodasChaves(): void {
    this.httpClient
      .get<ChavesListagem[]>(environment.chavesListagemApiUrl)
      .pipe(
        catchError((err) => {
          console.error("CHAV-SER: " + err);
          return of([]);
        }),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;
        this.chavesLista$.next(resultado);
      });
  }

  getChavesHistorico(): Observable<HistoricoEntregaChave[]> {
    return this.httpClient
      .get<HistoricoEntregaChave[]>(environment.chavesHistoricoApiUrl)
      .pipe(
        catchError((error) => {
          console.error(
            `OCO-SER: Falha ao "CarregarTodasOcorrencias": ${error}`,
          );
          return of([]);
        }),
      );
  }
}
