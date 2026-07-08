import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { OcorrenciasResponseDTO } from "../../models/api";
import { environment } from "src/environments/environment.dev";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ConsumosService {
  constructor(private http: HttpClient) {}

  listarTodasOcorrencias(): Observable<OcorrenciasResponseDTO[]> {
    return this.http
      .get<OcorrenciasResponseDTO[]>(environment.ocorrenciaApiUrl)
      .pipe(
        catchError((error) => {
          console.error(`Falha ao "ListarTodasOcorrencias": ${error.message}`);
          throw error; // Criar uma exceção personalizada ou retornar um valor padrão e não somente lançar o erro
        }),
      );
  }
}
