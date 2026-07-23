import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import {
  ChaveDisponivelDTO,
  ChaveOpcao,
  ChaveViewModel,
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
  EDIFICIO_LABEL,
  PISO_LABEL,
  STATUS_CHAVE_CONFIG,
} from "../../models/enums";
import { environment } from "src/environments/environment.dev";

// A ordem aqui define a ordem que aparece na tela.
const TABS: ChavesTabConfig[] = [
  { value: "EMPRESTADAS", label: "Emprestadas", paginada: true },
  { value: "TODAS", label: "Todas", paginada: true },
];

@Injectable({
  providedIn: "root",
})
export class ChaveService {
  private chaves$ = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly chavesList$ = this.chaves$.asObservable();

  tabs = TABS;

  // Inicia em [0] (EMPRESTADAS), a tab carregada primeiro
  private tabAtiva = new BehaviorSubject<ChavesTabConfig>(TABS[0]);
  readonly tabAtiva$ = this.tabAtiva.asObservable();

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
    this.carregarChaves(TABS[0]);
  }

  setTab(tab: ChavesTabConfig): void {
    this.tabAtiva.next(tab);
    this.carregarChaves(tab);
  }

  // Recebe a página de destino (0-based, igual ao backend)
  setPagina(pagina: number): void {
    const total = this.totalPaginas$.value;
    const dentroDoLimite = pagina >= 0 && pagina <= total - 1;

    if (!dentroDoLimite || pagina === this.paginaAtual$.value) return;

    this.paginaAtual$.next(pagina);
    this.carregarChaves(this.tabAtiva.value);
  }

  // Recarrega a tab atual — usado depois de um PUT/POST bem sucedido
  recarregar(): void {
    this.carregarChaves(this.tabAtiva.value);
  }

  // =============================================
  // ================= GET =======================

  // Emprestadas e Todas partilham o mesmo shape; muda apenas o endpoint.
  // /emprestadas já vem filtrado pelo backend
  private carregarChaves(tab: ChavesTabConfig): void {
    this.estaCarregandoDados.next(true);

    const url =
      tab.value === "EMPRESTADAS"
        ? environment.chavesEmprestadasApiURL
        : environment.chavesListagemApiUrl;

    // insere cada parâmetro existente
    let parametros = new HttpParams();

    // INSERIR OSP ARAMETROS

    if (tab.paginada)
      parametros = parametros
        .set("page", String(this.paginaAtual$.value))
        .set("size", "20");

    this.http
      .get<ChavesPage>(url, { params: parametros })
      .pipe(
        catchError((err) => {
          console.error("CHAV-SERV: " + err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.chaves$.next(resultado.content.map((c) => this.toViewModel(c)));
        this.totalEmprestadas.next(
          tab.value === "EMPRESTADAS"
            ? resultado.content.length
            : resultado.content.filter((c) => c.status === "EMPRESTADA").length,
        );
        this.totalPaginas$.next(resultado.totalPages);
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

    const dadosNormalizados: EmprestimoUpdateDTO = {
      ...data,
      funcionario: this.normalizarTexto(data.funcionario),
    };

    return this.http
      .put<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}`,
        dadosNormalizados,
      )
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError((err) => {
          console.error("CHAV-SERV-UPDATE: " + err);
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

    const dadosNormalizados: EmprestimoCriarDTO = {
      ...data,
      funcionario: this.normalizarTexto(data.funcionario),
    };

    return this.http
      .post<void>(environment.chavesEmprestimoApiUrl, dadosNormalizados)
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError((err) => {
          console.error("CHAV-SERV-EMPRESTIMO: " + err);
          return of(false);
        }),
        finalize(() => this.estaSalvando.next(false)),
      );
  }

  // Regista a devolução de um empréstimo em aberto.
  devolverChave(
    idEmprestimo: number,
    devolvidaPor: string,
  ): Observable<boolean> {
    this.estaSalvando.next(true);

    const corpo: DevolucaoDTO = {
      devolvidaPor: this.normalizarTexto(devolvidaPor),
    };

    return this.http
      .post<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}/devolucao`,
        corpo,
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
