import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import {
  ESTADO_OCORRENCIA_CONFIG,
  EstadoOcorrenciaEnumType,
  TabConfig,
  TIPO_OCORRENCIA_CONFIG,
  TipoOcorrenciaEnumType,
} from "../../models/enums";
import {
  FiltrosLocais,
  OcorrenciasCriarDTO,
  OcorrenciasPage,
  OcorrenciasResponseDTO,
  OcorrenciaViewModel,
} from "../../models/api";
import { catchError, finalize, map } from "rxjs/operators";
import { environment } from "src/environments/environment.dev";

// A ordem aqui define a ordem que aparece na tela
const TABS: TabConfig[] = [
  {
    value: "PENDENTE",
    label: "Pendentes",
    paginada: true,
    estadoParam: "PENDENTE",
  },
  {
    value: "RESOLVIDA",
    label: "Resolvidas",
    paginada: true,
    estadoParam: "RESOLVIDA",
  },
  {
    value: "CANCELADA",
    label: "Canceladas",
    paginada: true,
    estadoParam: "CANCELADA",
  },
  { value: "TODAS", label: "Todas", paginada: true, estadoParam: null },
];

@Injectable({
  providedIn: "root",
})
export class OcorrenciasService {
  private ocorrencias$ = new BehaviorSubject<OcorrenciaViewModel[]>([]);
  private filtrosLocais$ = new BehaviorSubject<FiltrosLocais>({
    tipo: "",
    search: "",
  });

  readonly tipoFiltro$: Observable<TipoOcorrenciaEnumType | ""> =
    this.filtrosLocais$.pipe(map((f) => f.tipo));

  tabs = TABS;
  // É sempre iniciada com [0] porque o primeiro elemento lá no TABS é o PENDENTE
  tabAtiva$ = new BehaviorSubject<TabConfig>(TABS[0]);
  carregandoDados$ = new BehaviorSubject<boolean>(false);
  criandoOcorrencia$ = new BehaviorSubject<boolean>(false);
  totalPaginas$ = new BehaviorSubject<number>(0);

  ocorrenciasFiltradas$: Observable<OcorrenciaViewModel[]> = combineLatest(
    this.ocorrencias$,
    this.filtrosLocais$,
  ).pipe(
    map(([listaOcorrencias, filtros]) =>
      listaOcorrencias
        .filter((o) => !filtros.tipo || o.tipo === filtros.tipo)
        .filter(
          (o) =>
            !filtros.search ||
            o.ocorrencia.toLowerCase().includes(filtros.search.toLowerCase()),
        ),
    ),
  );

  constructor(private http: HttpClient) {}

  inicializar(): void { // Alterar inicializar para receber parâmetros e deixar de redirecionar o usuário para a página de Pendentes automaticamente
    this.carregarOcorrencias(TABS[0], 0);
    this.tabAtiva$.next(TABS[0]);
  }

  setTab(tab: TabConfig): void {
    this.tabAtiva$.next(tab);
    this.filtrosLocais$.next({ ...this.filtrosLocais$.value, tipo: "" });
    this.carregarOcorrencias(tab, 0);
  }

  setFiltroLocal(parcial: Partial<FiltrosLocais>): void {
    this.filtrosLocais$.next({ ...this.filtrosLocais$.value, ...parcial });
  }

  setPagina(page: number): void {
    this.filtrosLocais$.next({ tipo: "", search: "" });
    this.carregarOcorrencias(this.tabAtiva$.value, page);
  }

  // =============================================
  // ================= GET =======================

  carregarOcorrencias(tab: TabConfig, page: number): void {
    this.carregandoDados$.next(true);

    // Seta os par"ametros caso existam
    let parametros = new HttpParams();
    if (tab.estadoParam) parametros = parametros.set("estado", tab.estadoParam);
    if (tab.paginada)
      parametros = parametros.set("page", String(page)).set("size", "20");

    this.http
      .get<OcorrenciasPage>(environment.ocorrenciaApiUrl, {
        params: parametros,
      })
      .pipe(
        catchError((err) => {
          console.error("OCO-SERV", err); // implementar componente de Toast
          return of(null);
        }),
        finalize(() => this.carregandoDados$.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.ocorrencias$.next(
          resultado.content.map((o) => this.toViewModel(o)),
        );
        this.totalPaginas$.next(resultado.page.totalPages);
      });
  }

  // =============================================
  // ================= UPDATE ====================

  // /api/ocorrencias/{id}
  // TODO: Talvez alterar tipo de retorno
  alterarEstado(estado: EstadoOcorrenciaEnumType, idOcorrencia: number): void {
    this.carregandoDados$.next(true);

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
          this.carregandoDados$.next(false);
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.inicializar();
      });
  }

  // =============================================
  // ================= POST ======================

  criarOcorrencia(data: OcorrenciasCriarDTO): Observable<boolean> {
    // Inicializa estado de loading
    this.criandoOcorrencia$.next(true);

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
          this.inicializar();
          return true;
        }),
        catchError((err) => {
          console.error("OCO-SERV-CREATE: " + err);
          return of(false);
        }),
        finalize(() => {
          this.criandoOcorrencia$.next(false);
        }),
      );
  }

  // ================================
  // ========== UTILITARIOS =========
  // Regex remove multiplos espacos entre as palavras e o trim limpa começo e final do texto
  private normalizarTexto(texto: string): string {
    return String(texto || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Método usado para inserir as propriedades tipoConfig e estadoConfig aos dados retornados pelo backend
  private toViewModel(o: OcorrenciasResponseDTO): OcorrenciaViewModel {
    return {
      ...o,
      tipoConfig: TIPO_OCORRENCIA_CONFIG[o.tipo as TipoOcorrenciaEnumType],
      estadoConfig:
        ESTADO_OCORRENCIA_CONFIG[o.estado as EstadoOcorrenciaEnumType],
    };
  }
}
