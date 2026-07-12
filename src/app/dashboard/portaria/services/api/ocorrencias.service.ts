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
  OcorrenciasPage,
  OcorrenciasResponseDTO,
  OcorrenciaViewModel,
} from "../../models/api";
import { catchError, map } from "rxjs/operators";
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

  tabs = TABS;
  // É sempre iniciada com [0] porque o primeiro elemento lá no TABS é o PENDENTE
  tabAtiva$ = new BehaviorSubject<TabConfig>(TABS[0]);
  carregandoDados$ = new BehaviorSubject<boolean>(false);
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

  inicializar(): void {
    this.carregarOcorrencias(TABS[0], 0);
  }

  setTab(tab: TabConfig): void {
    this.tabAtiva$.next(tab);
    this.filtrosLocais$.next({ tipo: "", search: "" });
    this.carregarOcorrencias(tab, 0);
  }

  setFiltroLocal(parcial: Partial<FiltrosLocais>): void {
    this.filtrosLocais$.next({ ...this.filtrosLocais$.value, ...parcial });
  }

  setPagina(page: number): void {
    this.filtrosLocais$.next({ tipo: "", search: "" });
    this.carregarOcorrencias(this.tabAtiva$.value, page);
  }

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
          console.error("OCO-SERV", err);
          this.carregandoDados$.next(false);
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.ocorrencias$.next(
          resultado.content.map((o) => this.toViewModel(o)),
        );
        this.carregandoDados$.next(false);
        this.totalPaginas$.next(resultado.page.totalPages);
      });
  }

  private toViewModel(o: OcorrenciasResponseDTO): OcorrenciaViewModel {
    return {
      ...o,
      tipoConfig: TIPO_OCORRENCIA_CONFIG[o.tipo as TipoOcorrenciaEnumType],
      estadoConfig:
        ESTADO_OCORRENCIA_CONFIG[o.estado as EstadoOcorrenciaEnumType],
    };
  }
}
