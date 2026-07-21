import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import {
  ChaveDisponivelDTO,
  ChavesDisponiveisPorEdificio,
  ChaveViewModel,
  ChavesResponseDTO,
  HistoricoEntregaChave,
} from "../../models/api";
import {
  ChavesTabConfig,
  EDIFICIO_LABEL,
  PISO_LABEL,
  STATUS_CHAVE_CONFIG,
} from "../../models/enums";
import { environment } from "src/environments/environment.dev";

// A ordem aqui define a ordem que aparece na tela.
const TABS: ChavesTabConfig[] = [
  { value: "EMPRESTADAS", label: "Emprestadas", paginada: false },
  { value: "TODAS", label: "Todas", paginada: false },
];

@Injectable({
  providedIn: "root",
})
export class ChaveService {
  private chaves$ = new BehaviorSubject<ChaveViewModel[]>([]);

  readonly chavesList$ = this.chaves$.asObservable();

  tabs = TABS;
  // Inicia em [0] (EMPRESTADAS), a tab carregada primeiro
  tabAtiva$ = new BehaviorSubject<ChavesTabConfig>(TABS[0]);
  estaCarregandoDados$ = new BehaviorSubject<boolean>(false);

  // Chaves disponíveis do modal Emprestar, agrupadas por edifício
  private chavesDisponiveis$ =
    new BehaviorSubject<ChavesDisponiveisPorEdificio>({});
  readonly chavesDisponiveisList$ = this.chavesDisponiveis$.asObservable();
  estaCarregandoDisponiveis$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.carregarChaves(TABS[0]);
    this.tabAtiva$.next(TABS[0]);
  }

  setTab(tab: ChavesTabConfig): void {
    this.tabAtiva$.next(tab);
    this.carregarChaves(tab);
  }

  // =============================================
  // ================= GET =======================

  // Emprestadas e Todas partilham o mesmo shape; muda apenas o endpoint.
  // /emprestadas já vem filtrado pelo backend (status EMPRESTADA).
  private carregarChaves(tab: ChavesTabConfig): void {
    this.estaCarregandoDados$.next(true);

    const url =
      tab.value === "EMPRESTADAS"
        ? environment.chavesEmprestadasApiURL
        : environment.chavesListagemApiUrl;

    this.http
      .get<ChavesResponseDTO[]>(url)
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV: " + err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados$.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;
        this.chaves$.next(resultado.map((c) => this.toViewModel(c)));
      });
  }

  // Disponíveis para o modal Emprestar — buscadas ao abrir o modal para
  // refletir sempre o estado atual. Agrupa por idEdificio no front.
  carregarDisponiveis(): void {
    this.estaCarregandoDisponiveis$.next(true);

    this.http
      .get<ChaveDisponivelDTO[]>(environment.chavesDisponiveisApiUrl)
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV-DISP: " + err);
          return of(null);
        }),
        finalize(() => this.estaCarregandoDisponiveis$.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;
        this.chavesDisponiveis$.next(this.agruparPorEdificio(resultado));
      });
  }

  getChavesHistorico(): Observable<HistoricoEntregaChave[]> {
    return this.http
      .get<HistoricoEntregaChave[]>(environment.chavesHistoricoApiUrl)
      .pipe(
        catchError((error) => {
          console.error(`CHAV-SERV: Falha ao "getChavesHistorico": ${error}`);
          return of([]);
        }),
      );
  }

  // ================================
  // ========== UTILITARIOS =========

  // Insere os rótulos de exibição (status, edifício, piso) na chave retornada
  private toViewModel(chave: ChavesResponseDTO): ChaveViewModel {
    return {
      ...chave,
      statusConfig: STATUS_CHAVE_CONFIG[chave.status],
      edificioLabel: EDIFICIO_LABEL[chave.idEdificio] || "-",
      pisoLabel: PISO_LABEL[chave.piso] || "-",
    };
  }

  // Agrupa as chaves disponíveis num Record keyed por idEdificio
  private agruparPorEdificio(
    chaves: ChaveDisponivelDTO[],
  ): ChavesDisponiveisPorEdificio {
    return chaves.reduce((grupos, chave) => {
      (grupos[chave.idEdificio] = grupos[chave.idEdificio] || []).push(chave);
      return grupos;
    }, {} as ChavesDisponiveisPorEdificio);
  }
}
