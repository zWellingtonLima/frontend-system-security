import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ChaveEmprestadas, Ocorrencias } from "./../../models/api";
import { environment } from "src/environments/environment.dev";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private httpClient: HttpClient) {}

  getChavesEmprestadas(): Observable<ChaveEmprestadas[]> {
    return this.httpClient.get<ChaveEmprestadas[]>(
      environment.chavesEmprestadasApiURL,
    );
  }

  getOcorrenciasRecentes(): Observable<Ocorrencias[]> {
    return this.httpClient.get<Ocorrencias[]>(
      environment.ocorrenciasHojeApiUrl,
    );
  }
}
