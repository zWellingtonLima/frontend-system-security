import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChaveEmprestadas, Ocorrencias } from './../models/api';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private httpClient: HttpClient) { }

  getChavesEmprestadas(): Observable<ChaveEmprestadas[]> {
    return this.httpClient.get<ChaveEmprestadas[]>("http://localhost:8080/api/chaves/emprestadas");
  }

  getOcorrenciasRecentes(): Observable<Ocorrencias>{
    return this.httpClient.get<Ocorrencias>("http://localhost:8080/api/ocorrencias/hoje");
  }

}
