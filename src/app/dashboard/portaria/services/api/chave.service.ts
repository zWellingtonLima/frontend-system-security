import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { catchError, finalize, map, switchMap } from "rxjs/operators";
import {
  ChaveDisponivelDTO,
  ChaveOpcao,
  ChaveViewModel,
  ChavesInventarioFiltros,
  ChavesPage,
  ChavesResponseDTO,
  DevolucaoDTO,
  EmprestimoCriarDTO,
  EmprestimoUpdateDTO,
  GrupoChaves,
  HistoricoEntregaChave,
  PaginacaoVM,
} from "../../models/api";
import {
  ChavesTabConfig,
  ColunaChave,
  EDIFICIO_LABEL,
  PISO_LABEL,
  STATUS_CHAVE_CONFIG,
} from "../../models/enums";
import { environment } from "src/environments/environment";

export const FILTROS_VAZIOS_BACKEND: ChavesInventarioFiltros = {
  idEdificio: "",
  piso: "",
  textoBusca: "",
};

// A ordem aqui define a ordem que aparece na tela, tanto das tabs quanto
// das colunas de cada uma.
const TABS: ChavesTabConfig[] = [
  {
    value: "EMPRESTADAS",
    label: "Emprestadas",
    paginada: false,
    colunas: [
      "edificio",
      "codigo",
      "sala",
      "desde",
      "nomeFuncionario",
      "acoes",
    ],
  },
  {
    value: "INVENTARIO",
    label: "Inventário",
    paginada: true,
    colunas: [
      "edificio",
      "codigo",
      "sala",
      "estado",
      "desde",
      "nomeFuncionario",
    ],
  },
];

@Injectable({
  providedIn: "root",
})
export class ChaveService {
  private chaves = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly chavesInventario$ = this.chaves.asObservable();
  private emprestadas = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly emprestadas$ = this.emprestadas.asObservable();

  private filtrosBackend = new BehaviorSubject<ChavesInventarioFiltros>(
    FILTROS_VAZIOS_BACKEND,
  );

  // Inicia em [0] (EMPRESTADAS), a tab carregada primeiro
  private tabAtiva = new BehaviorSubject<ChavesTabConfig>(TABS[0]);
  readonly tabAtiva$ = this.tabAtiva.asObservable();

  tabs = TABS;

  // DEVOLVE OS DADOS PARA A VIEW DE ACORDO COM O ENDPOINT CHAMADO (EMPRESTADAS || TODAS)
  // Lista crua: filtrar é responsabilidade de quem a mostra.
  readonly linhas$: Observable<ChaveViewModel[]> = this.tabAtiva$.pipe(
    switchMap((tab) =>
      tab.value === "INVENTARIO" ? this.chavesInventario$ : this.emprestadas$,
    ),
  );

  readonly colunas$: Observable<ColunaChave[]> = this.tabAtiva$.pipe(
    map((tab) => tab.colunas),
  );

  private estaCarregandoDados = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDados$ = this.estaCarregandoDados.asObservable();

  // Contador exibido na tab "Emprestadas". Derivado do que já foi carregado
  private totalEmprestadas = new BehaviorSubject<number>(0);
  readonly totalEmprestadas$ = this.totalEmprestadas.asObservable();

  // Chaves disponíveis do modal Emprestar, agrupadas por edifício.
  // `null` = ainda está carregando
  private chavesDisponiveis = new BehaviorSubject<GrupoChaves[] | null>(null);
  readonly chavesDisponiveisList$ = this.chavesDisponiveis.asObservable();

  private estaCarregandoDisponiveis = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDisponiveis$ =
    this.estaCarregandoDisponiveis.asObservable();

  // Opções do select do modal Atualizar: disponíveis + a chave atual do
  // empréstimo, agrupadas por edifício para os <optgroup>. `null` = ainda está carregand
  private opcoesEdicao = new BehaviorSubject<GrupoChaves[] | null>(null);
  readonly opcoesEdicao$ = this.opcoesEdicao.asObservable();

  private estaSalvando = new BehaviorSubject<boolean>(false);
  readonly estaSalvando$ = this.estaSalvando.asObservable();

  // PAGINAÇÃO
  paginaAtual$ = new BehaviorSubject<number>(0);
  totalPaginas$ = new BehaviorSubject<number>(0);

  paginacao$: Observable<PaginacaoVM> = combineLatest(
    this.paginaAtual$,
    this.totalPaginas$,
    this.tabAtiva$,
  ).pipe(
    map(([paginaAtual, totalPaginas, tab]) => ({
      paginaAtual,
      totalPaginas,
      paginas: this.calcularPaginasVisiveis(paginaAtual + 1, totalPaginas),
      temAnterior: paginaAtual > 0,
      temProximo: paginaAtual < totalPaginas - 1,
      visivel: tab.paginada && totalPaginas > 1,
    })),
  );

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.tabAtiva.next(TABS[0]);
    this.setPagina(0);
    this.carregarEmprestadas();
  }

  setTab(tab: ChavesTabConfig): void {
    this.tabAtiva.next(tab);

    if (tab.value === "INVENTARIO") {
      this.carregarChavesInventario();
    } else {
      this.carregarEmprestadas();
    }
  }

  // Recebe a página de destino (0-based, igual ao backend)
  setPagina(pagina: number): void {
    const total = this.totalPaginas$.value;
    const dentroDoLimite = pagina >= 0 && pagina <= total - 1;

    if (!dentroDoLimite || pagina === this.paginaAtual$.value) return;

    this.paginaAtual$.next(pagina);
    this.carregarChavesInventario();
  }

  // Recarrega a tab atual — usado depois de um PUT/POST bem sucedido
  recarregar(): void {
    this.carregarEmprestadas();
  }

  // FILTROS BACKEND
  aplicarFiltrosBackend(filtros: ChavesInventarioFiltros): void {
    this.filtrosBackend.next({
      ...filtros,
      textoBusca: this.normalizarTexto(filtros.textoBusca),
    });
    this.paginaAtual$.next(0);
    this.carregarChavesInventario();
  }

  limparFiltrosBackend(): void {
    this.filtrosBackend.next(FILTROS_VAZIOS_BACKEND);
    this.paginaAtual$.next(0);
    this.carregarChavesInventario();
  }

  // =============================================
  // ================= GET =======================

  private carregarChavesInventario(): void {
    this.estaCarregandoDados.next(true);

    const filtros = this.filtrosBackend.value;
    let parametros = new HttpParams()
      .set("page", String(this.paginaAtual$.value))
      .set("size", "20");

    if (filtros.piso) parametros = parametros.set("piso", filtros.piso);
    if (filtros.idEdificio !== "")
      parametros = parametros.set("idEdificio", String(filtros.idEdificio));
    if (filtros.textoBusca)
      parametros = parametros.set("codigoChave", filtros.textoBusca);

    this.http
      .get<ChavesPage>(environment.chavesListagemApiUrl, {
        params: parametros,
      })
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV-INV: " + err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.chaves.next(resultado.content.map((c) => this.toViewModel(c)));

        this.totalPaginas$.next(resultado.totalPages);
      });
  }

  private carregarEmprestadas(): void {
    this.estaCarregandoDados.next(true);

    this.http
      .get<ChavesResponseDTO[]>(environment.chavesEmprestadasApiURL)
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV-EMP: " + err);
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.emprestadas.next(resultado.map((c) => this.toViewModel(c)));
        this.totalEmprestadas.next(resultado.length);
      });
  }

  // Disponíveis para o modal Emprestar — buscadas ao abrir o modal para
  // refletir sempre o estado atual. Agrupa por idEdificio
  carregarDisponiveis(): void {
    this.chavesDisponiveis.next(null);
    this.estaCarregandoDisponiveis.next(true);

    this.buscarDisponiveis().subscribe((resultado) => {
      this.chavesDisponiveis.next(
        this.agruparPorEdificio(
          (resultado || []).map((c) => this.toChaveOpcao(c)),
        ),
      );
    });
  }

  // Opções do modal Atualizar. A chave atual do empréstimo NÃO vem em
  // /disponiveis (está EMPRESTADA), por isso é injetada à mão — senão o
  // select abriria sem a opção que está selecionada.
  carregarOpcoesEdicao(chaveAtual: ChaveViewModel): void {
    this.opcoesEdicao.next(null);
    this.estaCarregandoDisponiveis.next(true);

    this.buscarDisponiveis().subscribe((resultado) => {
      if (resultado === null) {
        this.opcoesEdicao.next(this.agruparParaEdicao([], chaveAtual));
        return;
      }
      this.opcoesEdicao.next(this.agruparParaEdicao(resultado, chaveAtual));
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

  // ===========================================
  // ================= PUT =====================

  // Corrige os dados de um empréstimo em aberto (funcionário e/ou chave).
  // Não devolve a chave - continua emprestada.
  atualizarEmprestimo(
    idEmprestimo: number,
    data: EmprestimoUpdateDTO,
  ): Observable<boolean> {
    this.estaSalvando.next(true);

    return this.http
      .patch<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}`,
        data,
      )
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError(({ error }) => {
          console.log(error);
          console.error("CHAV-SERV-UPDATE: " + error.detail);
          return of(false);
        }),
        finalize(() => this.estaSalvando.next(false)),
      );
  }

  // ===========================================
  // ================= POST ====================

  // Regista um novo empréstimo de chave.
  emprestarChave(data: EmprestimoCriarDTO): Observable<boolean> {
    this.estaSalvando.next(true);

    return this.http.post<void>(environment.chavesEmprestimoApiUrl, data).pipe(
      map(() => {
        this.recarregar();
        return true;
      }),
      catchError(({ error }) => {
        console.log(error);

        console.error("CHAV-SERV-EMPRESTIMO: " + error.detail);
        return of(false);
      }),
      finalize(() => this.estaSalvando.next(false)),
    );
  }

  // Regista a devolução de um empréstimo em aberto.
  devolverChave(idEmprestimo: number, data: DevolucaoDTO): Observable<boolean> {
    this.estaSalvando.next(true);

    return this.http
      .post<void>(`${environment.chavesEmprestimoApiUrl}/${idEmprestimo}`, data)
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError((err) => {
          console.error("CHAV-SERV-DEVOLUCAO: " + err);
          return of(false);
        }),
        finalize(() => this.estaSalvando.next(false)),
      );
  }

  devolverRapidoChave(idEmprestimo: number): Observable<boolean> {
    this.estaSalvando.next(true);

    return this.http
      .post<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}/rapida`,
        null,
      )
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError((err) => {
          console.error("CHAV-SERV-DEVOLUCAO: " + err);
          return of(false);
        }),
        finalize(() => this.estaSalvando.next(false)),
      );
  }

  // ================================
  // ========== UTILITARIOS =========

  // GET /disponiveis partilhado pelos dois modais. Devolve null em erro.
  private buscarDisponiveis(): Observable<ChaveDisponivelDTO[] | null> {
    return this.http
      .get<ChaveDisponivelDTO[]>(environment.chavesDisponiveisApiUrl)
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV-DISP: " + err);
          return of(null);
        }),
        finalize(() => this.estaCarregandoDisponiveis.next(false)),
      );
  }

  // Insere os rótulos de exibição (status, edifício, piso) na chave retornada
  private toViewModel(chave: ChavesResponseDTO): ChaveViewModel {
    return {
      ...chave,
      statusConfig: STATUS_CHAVE_CONFIG[chave.status],
      edificioLabel: EDIFICIO_LABEL[chave.idEdificio] || "-",
      pisoLabel: PISO_LABEL[chave.piso] || "-",
    };
  }

  // Normaliza o DTO de disponível para a forma consumida pelos selects
  private toChaveOpcao(chave: ChaveDisponivelDTO): ChaveOpcao {
    return {
      id: chave.id,
      idEdificio: chave.idEdificio,
      codigo: chave.codigo,
      sala: chave.numeroSala,
    };
  }

  // Disponíveis + chave atual, em grupos ordenados por edifício e código
  private agruparParaEdicao(
    disponiveis: ChaveDisponivelDTO[],
    chaveAtual: ChaveViewModel,
  ): GrupoChaves[] {
    const opcoes = disponiveis.map((c) => this.toChaveOpcao(c));

    // A chave atual pode já constar da lista se o backend a considerar livre
    if (!opcoes.some((c) => c.id === chaveAtual.id)) {
      opcoes.push({
        id: chaveAtual.id,
        idEdificio: chaveAtual.idEdificio,
        codigo: chaveAtual.codigo,
        sala: chaveAtual.sala,
      });
    }

    return this.agruparPorEdificio(opcoes);
  }

  private agruparPorEdificio(opcoes: ChaveOpcao[]): GrupoChaves[] {
    const porEdificio = opcoes.reduce(
      (grupos, chave) => {
        (grupos[chave.idEdificio] = grupos[chave.idEdificio] || []).push(chave);
        return grupos;
      },
      {} as Record<number, ChaveOpcao[]>,
    );

    return Object.keys(porEdificio)
      .map(Number)
      .sort((a, b) => a - b)
      .map((idEdificio) => ({
        idEdificio,
        edificioLabel: EDIFICIO_LABEL[idEdificio] || `Edifício ${idEdificio}`,
        chaves: porEdificio[idEdificio].sort((a, b) =>
          a.codigo.localeCompare(b.codigo),
        ),
      }));
  }

  // TODO: Tornar isso uma Directive ou algo reaproveitável
  // Remove múltiplos espaços entre palavras e limpa início/fim
  private normalizarTexto(texto: string): string {
    return texto.replace(/\s+/g, " ").trim();
  }

  // PAGINAÇÃO
  private calcularPaginasVisiveis(
    atual: number,
    total: number,
  ): (number | "...")[] {
    if (total <= 1) return [];

    const paginasRelevantes = Array.from(
      new Set([1, atual - 1, atual, atual + 1, total]),
    )
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);

    const resultado: (number | "...")[] = [];
    paginasRelevantes.forEach((p, i) => {
      if (i > 0 && p - paginasRelevantes[i - 1] > 1) resultado.push("...");
      resultado.push(p);
    });

    return resultado;
  }
}
