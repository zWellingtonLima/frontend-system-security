import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { HistoricoEntregaChave, ChavesListagem } from "../../models/api";
import { environment } from "src/environments/environment.dev";
import { catchError } from "rxjs/operators";
import { ChavesTabConfig } from "../../models/enums";

const TABS: ChavesTabConfig[] = [
  { value: "PENDENTES", label: "Pendentes", paginada: true },
  { value: "TODAS", label: "Todas", paginada: true },
];

@Injectable({
  providedIn: "root",
})
export class ChaveService {
  private chavesLista$ = new BehaviorSubject<ChavesListagem[]>([]);

  tabs = TABS;
  tabAtiva$ = new BehaviorSubject<ChavesTabConfig>(TABS[0]);

  chavesList$ = this.chavesLista$.asObservable();

  paginaAtual$ = new BehaviorSubject<number>(0);
  totalPaginas$ = new BehaviorSubject<number>(0);

  constructor(private httpClient: HttpClient) {}

  inicializar(): void {
    this.carregarTodasChaves();
    this.tabAtiva$.next(TABS[0]);
  }

  setTab(tab: ChavesTabConfig): void {
    this.tabAtiva$.next(tab);
    this.paginaAtual$.next(0);
    this.carregarTodasChaves();
  }

  // =============================================
  // ================= GET =======================

  carregarTodasChaves(): void {
    this.httpClient
      .get<ChavesListagem[]>(environment.chavesListagemApiUrl)
      .pipe(
        catchError((err) => {
          console.error("CHAV-SER: " + err);
          return of(null);
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
          console.error(`CHAV-SER: Falha ao "getChavesHistorico": ${error}`);
          return of([]);
        }),
      );
  }
}
