import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import {
  ESTADO_OCORRENCIA_CONFIG,
  EstadoOcorrenciaEnumType,
  OcorrenciaTabConfig,
  TIPO_OCORRENCIA_CONFIG,
  TipoOcorrenciaEnumType,
} from "../../models/enums";
import {
  Filtros,
  OcorrenciasCriarDTO,
  OcorrenciasPage,
  OcorrenciasResponseDTO,
  OcorrenciaViewModel,
} from "../../models/api";
import { catchError, finalize, map } from "rxjs/operators";
import { environment } from "src/environments/environment.dev";

// A ordem aqui define a ordem que aparece na tela
const TABS: OcorrenciaTabConfig[] = [
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
  private filtros$ = new BehaviorSubject<Filtros>({
    tipo: "",
    search: "",
  });

  // readonly filtrosRead$ = this.filtros$.asObservable();
  readonly ocorrenciasList$ = this.ocorrencias$.asObservable();

  tabs = TABS;
  // É sempre iniciada com [0] porque o primeiro elemento lá no TABS é o PENDENTE
  tabAtiva$ = new BehaviorSubject<OcorrenciaTabConfig>(TABS[0]);
  estaCarregandoDados$ = new BehaviorSubject<boolean>(false);
  estaCriandoOcorrencia$ = new BehaviorSubject<boolean>(false);

  paginaAtual$ = new BehaviorSubject<number>(0);
  totalPaginas$ = new BehaviorSubject<number>(0);

  // Páginas exibidas na barra de paginação: 1ª, atual e vizinhas, última
  paginasVisiveis$ = combineLatest([
    this.paginaAtual$,
    this.totalPaginas$,
  ]).pipe(
    map(([atual, total]) => this.calcularPaginasVisiveis(atual + 1, total)),
  );

  constructor(private http: HttpClient) {}

  inicializar(): void {
    this.carregarOcorrencias(TABS[0]);
    this.tabAtiva$.next(TABS[0]);
  }

  setTab(tab: OcorrenciaTabConfig): void {
    this.tabAtiva$.next(tab);
    this.paginaAtual$.next(0);
    this.carregarOcorrencias(tab);
  }

  setFiltro(parcial: Partial<Filtros>): void {
    this.filtros$.next({ ...this.filtros$.value, ...parcial });
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

    // Insere cada parâmetro existente
    let parametros = new HttpParams();
    if (tab.estadoParam) parametros = parametros.set("estado", tab.estadoParam);
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
        this.totalPaginas$.next(resultado.page.totalPages);
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

        this.inicializar();
      });
  }

  // =============================================
  // ================= POST ======================

  criarOcorrencia(data: OcorrenciasCriarDTO): Observable<boolean> {
    // Inicializa estado de loading
    this.estaCriandoOcorrencia$.next(true);

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
          this.estaCriandoOcorrencia$.next(false);
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
