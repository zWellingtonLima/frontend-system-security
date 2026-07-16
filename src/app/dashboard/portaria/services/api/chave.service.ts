import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ChavesHistorico } from "../../models/api";
import { environment } from "src/environments/environment.dev";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ChaveService {
  constructor(private httpClient: HttpClient) {}

  getChavesHistorico(): Observable<ChavesHistorico[]> {
    return this.httpClient
      .get<ChavesHistorico[]>(environment.chavesHisoricoApiUrl)
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
