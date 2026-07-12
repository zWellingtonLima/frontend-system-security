import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ChaveEmprestadas, OcorrenciasResponseDTO } from "./../../models/api";
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

  getOcorrenciasRecentes(): Observable<OcorrenciasResponseDTO[]> {
    return this.httpClient.get<OcorrenciasResponseDTO[]>(
      environment.ocorrenciasHojeApiUrl,
    );
  }
}
