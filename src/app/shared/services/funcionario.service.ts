import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, shareReplay } from "rxjs/operators";
import { Funcionario } from "../models/funcionario";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class FuncionarioService {
  private funcionariosListacache$: Observable<Funcionario[]> | null = null;

  constructor(private http: HttpClient) {}

  // Só dispara o pedido na primeira subscrição (lazy). Quem chegar depois
  // recebe a lista já em cache, sem tocar na rede.
  listar(): Observable<Funcionario[]> {
    if (!this.funcionariosListacache$) {
      this.funcionariosListacache$ = this.http
        .get<Funcionario[]>(`${environment.funcionariosApiUrl}/nossa`)
        .pipe(
          catchError((err) => {
            this.funcionariosListacache$ = null;
            console.error("FUNC-SERV: falha ao carregar funcionários", err);
            return throwError(err);
          }),
          shareReplay(1),
        );
    }

    return this.funcionariosListacache$;
  }
}
