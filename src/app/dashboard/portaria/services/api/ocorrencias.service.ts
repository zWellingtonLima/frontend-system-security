import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import {
  OcorrenciasContagem,
  OcorrenciasFiltros,
  OcorrenciasResponseDTO,
} from "../../models/api";
import { environment } from "src/environments/environment.dev";
import { catchError, map } from "rxjs/operators";
import {
  EstadoOcorrenciaEnum,
  EstadoOcorrenciaEnumType,
  TipoOcorrenciaEnum,
} from "../../models/enums";

@Injectable({
  providedIn: "root",
})
export class OcorrenciasService {
  private ocorrencias$ = new BehaviorSubject<OcorrenciasResponseDTO[]>([]);
  private filtros$ = new BehaviorSubject<OcorrenciasFiltros>({
    estado: "TODAS", // ver se altero para EstadoOcorrenciaEnum.PENDENTE
    tipo: "",
    search: "",
  });

  ocorrenciasFiltradas$: Observable<OcorrenciasResponseDTO[]> = combineLatest(
    this.ocorrencias$,
    this.filtros$,
  ).pipe(
    map(([ocorrencias, filtros]) =>
      ocorrencias
        // 1º filtro para o estado 2º para o tipo de ocorrencia 3º para busca em texto
        .filter(
          (o) =>
            filtros.estado === "TODAS" || o.estado.label === filtros.estado,
        )
        .filter(
          (o) => !filtros.estado || o.tipoOcorrencia.label === filtros.tipo,
        )
        .filter(
          (o) =>
            !filtros.search ||
            o.ocorrencia.toLowerCase().includes(filtros.search.toLowerCase()),
        ),
    ),
  );

  contagens$: Observable<OcorrenciasContagem> = this.ocorrencias$.pipe(
    map((lista) => ({
      total: lista.length,
      pendentes: lista.filter(
        (o) => o.estado.label === EstadoOcorrenciaEnum.PENDENTE,
      ).length,
      emAnalise: lista.filter(
        (o) => o.estado.label === EstadoOcorrenciaEnum.EM_ANALISE,
      ).length,
      resolvidas: lista.filter(
        (o) => o.estado.label === EstadoOcorrenciaEnum.RESOLVIDA,
      ).length,
      canceladas: lista.filter(
        (o) => o.estado.label === EstadoOcorrenciaEnum.CANCELADA,
      ).length,
    })),
  );

  constructor(private http: HttpClient) {}

  carregar(): Observable<OcorrenciasResponseDTO[]> {
    return this.http.get<OcorrenciasResponseDTO[]>(environment.ocorrenciaApiUrl).pipe(
      catchError((error) => {
        console.error(`OCO-SER: Falha ao "CarregarTodasOcorrencias": ${error}`);
        return of([]);
      }),
    );
  }

  carregarTodasOcorrencias(): void {
    this.http
      .get<OcorrenciasResponseDTO[]>(environment.ocorrenciaApiUrl)
      .pipe(
        catchError((error) => {
          console.error(
            `OCO-SER: Falha ao "CarregarTodasOcorrencias": ${error}`,
          );
          return of([]);
        }),
      )
      .subscribe((resultado) => this.ocorrencias$.next(resultado));
  }

  setFiltro(parcial: Partial<OcorrenciasFiltros>): void {
    this.filtros$.next({ ...this.filtros$.value, ...parcial });
  }

  setTab(estado: EstadoOcorrenciaEnumType | "TODAS"): void {
    this.filtros$.next({ ...this.filtros$.value, estado: estado as any }); // depois remover o any e ver como tipar melhor
  }
}
