import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Paginador } from "src/app/shared/utils/paginador";
import {
  ESTADO_OCORRENCIA_CONFIG,
  EstadoOcorrenciaEnumType,
  OcorrenciaTabConfig,
  TIPO_OCORRENCIA_CONFIG,
} from "../../models/enums";
import {
  FiltrosOcorrencias,
  OcorrenciasCriarDTO,
  OcorrenciasPage,
  OcorrenciasResponseDTO,
  OcorrenciasUpdateDTO,
  OcorrenciaViewModel,
} from "../../models/api";
import { catchError, finalize, map } from "rxjs/operators";
import { environment } from "src/environments/environment";

// A ordem aqui define a ordem que aparece na tela
const TABS: OcorrenciaTabConfig[] = [
  { value: "PENDENTE", label: "Pendentes", paginada: true },
  { value: "RESOLVIDA", label: "Resolvidas", paginada: true },
  // { value: "CANCELADA", label: "Canceladas", paginada: true },
  { value: "TODAS", label: "Todas", paginada: true },
];

@Injectable({
  providedIn: "root",
})
export class OcorrenciasService {
  private ocorrencias$ = new BehaviorSubject<OcorrenciaViewModel[]>([]);
  private filtros$ = new BehaviorSubject<FiltrosOcorrencias>({
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

  // Recarrega sempre a tab atual
  readonly paginador = new Paginador(() =>
    this.carregarOcorrencias(this.tabAtiva$.value),
  );

  private totalPendentes = new BehaviorSubject<number>(0);
  readonly totalPendentes$ = this.totalPendentes.asObservable();

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.paginador.reset();
    this.carregarOcorrencias(TABS[0]);
    this.carregarTotalPendentes();
    this.tabAtiva$.next(TABS[0]);
  }

  setTab(tab: OcorrenciaTabConfig): void {
    this.tabAtiva$.next(tab);
    this.paginador.reset();
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
  setFiltro(parcial: Partial<FiltrosOcorrencias>): void {
    const atual = this.filtros$.value;
    const proximo = { ...atual, ...parcial };

    // Ignora atualizações sem mudança real (mantém setFiltro idempotente e
    // evita fetch redundante). Após setTab o estado volta a vazio, então o
    // mesmo texto numa nova tab conta como mudança e busca normalmente.
    if (proximo.tipo === atual.tipo && proximo.search === atual.search) return;

    this.filtros$.next(proximo);
    this.paginador.primeiraPagina();
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
        .set("page", String(this.paginador.pagina))
        .set("size", String(this.paginador.tamanho));

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
        this.paginador.definirTotal(
          resultado.totalPages,
          resultado.totalElements,
        );
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
}
