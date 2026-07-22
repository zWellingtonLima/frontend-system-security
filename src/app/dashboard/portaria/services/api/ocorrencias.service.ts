import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import {
  ESTADO_OCORRENCIA_CONFIG,
  EstadoOcorrenciaEnumType,
  OcorrenciaTabConfig,
  TIPO_OCORRENCIA_CONFIG,
} from "../../models/enums";
import {
  Filtros,
  OcorrenciasCriarDTO,
  OcorrenciasPage,
  OcorrenciasResponseDTO,
  OcorrenciasUpdateDTO,
  OcorrenciaViewModel,
  PaginacaoVM,
} from "../../models/api";
import { catchError, finalize, map } from "rxjs/operators";
import { environment } from "src/environments/environment.dev";

// A ordem aqui define a ordem que aparece na tela
const TABS: OcorrenciaTabConfig[] = [
  { value: "PENDENTE", label: "Pendentes", paginada: true },
  { value: "RESOLVIDA", label: "Resolvidas", paginada: true },
  { value: "CANCELADA", label: "Canceladas", paginada: true },
  { value: "TODAS", label: "Todas", paginada: true },
];

@Injectable({
  providedIn: "root",
})
export class OcorrenciasService {
  private ocorrencias$ = new BehaviorSubject<OcorrenciaViewModel[]>([]);
  private filtros$ = new BehaviorSubject<Filtros>({
    tipo: "",
    search: "",
  });

  readonly ocorrenciasList$ = this.ocorrencias$.asObservable();

  tabs = TABS;
  // É sempre iniciada com [0] porque o primeiro elemento lá no TABS é o PENDENTE
  tabAtiva$ = new BehaviorSubject<OcorrenciaTabConfig>(TABS[0]);
  estaCarregandoDados$ = new BehaviorSubject<boolean>(false);
  // Loader compartilhado pelo modal (criar e o de editar)
  estaSalvando$ = new BehaviorSubject<boolean>(false);

  paginaAtual$ = new BehaviorSubject<number>(0);
  totalPaginas$ = new BehaviorSubject<number>(0);

  private totalPendentes = new BehaviorSubject<number>(0);
  readonly totalPendentes$ = this.totalPendentes.asObservable();

  // Estado consolidado da paginação, pronto para o template (um único async).
  // As páginas visíveis (1ª, atual e vizinhas, última) são calculadas aqui
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
    this.carregarOcorrencias(TABS[0]);
    this.carregarTotalPendentes();
    this.tabAtiva$.next(TABS[0]);
  }

  setTab(tab: OcorrenciaTabConfig): void {
    this.tabAtiva$.next(tab);
    this.paginaAtual$.next(0);
    this.filtros$.next({ tipo: "", search: "" });
    this.carregarOcorrencias(tab);
    this.carregarTotalPendentes();
  }

  // Recarrega a tab atual mantendo filtros e página (usado após criar/alterar)
  private recarregar(): void {
    this.carregarOcorrencias(this.tabAtiva$.value);
    this.carregarTotalPendentes();
  }

  // Recebe o valor atual e compara com o estado que existe no service
  setFiltro(parcial: Partial<Filtros>): void {
    const atual = this.filtros$.value;
    const proximo = { ...atual, ...parcial };

    // Ignora atualizações sem mudança real (mantém setFiltro idempotente e
    // evita fetch redundante). Após setTab o estado volta a vazio, então o
    // mesmo texto numa nova tab conta como mudança e busca normalmente.
    if (proximo.tipo === atual.tipo && proximo.search === atual.search) return;

    this.filtros$.next(proximo);
    this.carregarOcorrencias(this.tabAtiva$.value);
  }

  // Recebe a página de destino (0-based, igual ao backend)
  setPagina(pagina: number): void {
    const total = this.totalPaginas$.value;
    const dentroDoLimite = pagina >= 0 && pagina <= total - 1;

    if (!dentroDoLimite || pagina === this.paginaAtual$.value) return;

    this.paginaAtual$.next(pagina);
    this.carregarOcorrencias(this.tabAtiva$.value);
  }

  // =============================================
  // ================= GET =======================

  carregarOcorrencias(tab: OcorrenciaTabConfig): void {
    this.estaCarregandoDados$.next(true);

    const tipoOcorrenciaSelecionada = this.filtros$.value.tipo;
    const textoDigitado = this.normalizarTexto(this.filtros$.value.search);

    // A tab "TODAS" não envia estado; as restantes usam o próprio value
    const estado = tab.value === "TODAS" ? null : tab.value;

    // Insere cada parâmetro existente
    let parametros = new HttpParams();
    if (estado) parametros = parametros.set("estado", estado);
    if (tipoOcorrenciaSelecionada)
      parametros = parametros.set("tipo", tipoOcorrenciaSelecionada);
    if (textoDigitado) parametros = parametros.set("q", textoDigitado);

    if (tab.paginada)
      parametros = parametros
        .set("page", String(this.paginaAtual$.value))
        .set("size", "20");

    this.http
      .get<OcorrenciasPage>(environment.ocorrenciaApiUrl, {
        params: parametros,
      })
      .pipe(
        catchError((err) => {
          console.error("OCO-SERV", err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados$.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.ocorrencias$.next(
          resultado.content.map((o) => this.toViewModel(o)),
        );
        this.totalPaginas$.next(resultado.totalPages);
      });
  }

  // Serviço apenas para carregar o número para o badge de Pendentes e manter sempre atualizado independente da tabAtiva
  private carregarTotalPendentes(): void {
    const parametros = new HttpParams()
      .set("estado", "PENDENTE")
      .set("page", "0")
      .set("size", "1");

    this.http
      .get<OcorrenciasPage>(environment.ocorrenciaApiUrl, {
        params: parametros,
      })
      .pipe(
        catchError((err) => {
          console.error("OCO-SERV-CONTAGEM: " + err);
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;
        this.totalPendentes.next(resultado.totalElements);
      });
  }

  // =============================================
  // ================= UPDATE ====================

  // /api/ocorrencias/{id}
  alterarEstado(estado: EstadoOcorrenciaEnumType, idOcorrencia: number): void {
    this.estaCarregandoDados$.next(true);

    this.http
      .patch<OcorrenciasResponseDTO>(
        `${environment.ocorrenciaApiUrl}/${idOcorrencia}`,
        {
          estado,
        },
      )
      .pipe(
        catchError((err) => {
          console.error("OCO-SERV-UPD: " + err);
          this.estaCarregandoDados$.next(false);
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.recarregar();
      });
  }

  // =============================================
  // ================= POST ======================

  criarOcorrencia(data: OcorrenciasCriarDTO): Observable<boolean> {
    // Inicializa estado de loading
    this.estaSalvando$.next(true);

    const dadosNormalizados: OcorrenciasCriarDTO = {
      ...data,
      ocorrencia: this.normalizarTexto(data.ocorrencia),
    };

    return this.http
      .post<OcorrenciasCriarDTO>(
        environment.ocorrenciaApiUrl,
        dadosNormalizados,
      )
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError((err) => {
          console.error("OCO-SERV-CREATE: " + err);
          return of(false);
        }),
        finalize(() => {
          this.estaSalvando$.next(false);
        }),
      );
  }

  // ===========================================
  // =============== PUT ====================

  // /api/ocorrencias/{id} - atualiza tipo e descrição de uma ocorrência
  atualizarOcorrencia(
    id: number,
    data: OcorrenciasUpdateDTO,
  ): Observable<boolean> {
    this.estaSalvando$.next(true);

    const dadosNormalizados: OcorrenciasUpdateDTO = {
      ...data,
      ocorrencia: this.normalizarTexto(data.ocorrencia),
    };

    return this.http
      .put<OcorrenciasResponseDTO>(
        `${environment.ocorrenciaApiUrl}/${id}`,
        dadosNormalizados,
      )
      .pipe(
        map(() => {
          this.recarregar();
          return true;
        }),
        catchError((err) => {
          console.error("OCO-SERV-UPDATE: " + err);
          return of(false);
        }),
        finalize(() => {
          this.estaSalvando$.next(false);
        }),
      );
  }

  // ================================
  // ========== UTILITARIOS =========
  // Regex remove multiplos espacos entre as palavras e o trim limpa começo e final do texto
  private normalizarTexto(texto: string): string {
    return texto.replace(/\s+/g, " ").trim();
  }

  // Método usado para inserir as propriedades tipoConfig e estadoConfig aos dados retornados pelo backend
  private toViewModel(o: OcorrenciasResponseDTO): OcorrenciaViewModel {
    return {
      ...o,
      tipoConfig: TIPO_OCORRENCIA_CONFIG[o.tipo],
      estadoConfig: ESTADO_OCORRENCIA_CONFIG[o.estado],
    };
  }

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
