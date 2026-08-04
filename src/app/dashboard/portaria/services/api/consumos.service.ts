import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

import { environment } from "src/environments/environment";
import {
  ConsumoFiltro,
  ConsumoLeitura,
  ConsumoPayload,
  CountTabelas,
  EdificiosResponse,
  ListaUltimasCard,
  PageResponse,
  UltimaLeitura,
} from "../../models/consumo.model";
import { Paginador } from "src/app/shared/utils/paginador";

const TAMANHO_PAGINA = 20;

export const FILTROS_VAZIOS_CONSUMOS: ConsumoFiltro = {
  tipo: "",
  dataInicio: "",
  dataFim: "",
  edificioId: "",
};

@Injectable({
  providedIn: "root",
})
export class ConsumosService {
  private readonly apiUrl = environment.consumosApiUrl;

  constructor(private http: HttpClient) {}

  private filtros = new BehaviorSubject<ConsumoFiltro>(FILTROS_VAZIOS_CONSUMOS);

  private estaCarregandoDados = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDados$ = this.estaCarregandoDados.asObservable();

  private consumosBehavior = new BehaviorSubject<ConsumoLeitura[]>([]);
  readonly listaConsumos$ = this.consumosBehavior.asObservable();

  readonly paginador = new Paginador(() => this.listar(), TAMANHO_PAGINA);

  inicializar(): void {
    this.filtros.next(FILTROS_VAZIOS_CONSUMOS);
    this.paginador.reset();
    this.listar();
  }

  aplicarFiltros(filtros: ConsumoFiltro): void {
    this.filtros.next({
      ...filtros,
    });
    this.paginador.primeiraPagina();
    this.listar();
  }

  limparFiltros(aba: string): void {
    this.filtros.next(FILTROS_VAZIOS_CONSUMOS);
    this.filtros.next({ tipo: aba });
    this.paginador.primeiraPagina();
    this.listar();
  }

  ultimas(): Observable<ListaUltimasCard[]> {
    return this.http.get<ListaUltimasCard[]>(`${this.apiUrl}/ultimas`);
  }

  ultimaLeituraForm(
    tipoId: string,
    edificioId: string,
  ): Observable<UltimaLeitura> {
    let params = new HttpParams()
      .set("tipoId", tipoId)
      .set("edificioId", edificioId);

    return this.http.get<UltimaLeitura>(`${this.apiUrl}/ultima/formulario`, {
      params: params,
    });
  }

  countTabelas(): Observable<CountTabelas[]> {
    return this.http.get<CountTabelas[]>(`${this.apiUrl}/count`);
  }

  listar(): void {
    const filtro = this.filtros.value;

    this.estaCarregandoDados.next(true);

    let params = new HttpParams()
      .set("page", String(this.paginador.pagina))
      .set("size", String(this.paginador.tamanho));

    if (filtro.tipo) {
      params = params.set("tipo", filtro.tipo);
    }
    if (filtro.dataInicio) {
      params = params.set("dataInicio", String(filtro.dataInicio));
    }
    if (filtro.dataFim) {
      params = params.set("dataFim", String(filtro.dataFim));
    }
    if (filtro.edificioId) {
      params = params.set("edificioId", String(filtro.edificioId));
    }

    this.http
      .get<PageResponse<ConsumoLeitura>>(`${this.apiUrl}/paginacao`, { params })
      .subscribe(
        (res) => {
          this.estaCarregandoDados.next(false);
          this.consumosBehavior.next(res.consumos);
          this.paginador.definirTotal(res.totalPages, res.totalElements);
        },
        () => {
          this.estaCarregandoDados.next(false);
        },
      );
  }

  criar(payload: ConsumoPayload): Observable<ConsumoLeitura> {
    return this.http.post<ConsumoLeitura>(this.apiUrl, payload);
  }

  atualizar(id: number, payload: ConsumoPayload): Observable<ConsumoLeitura> {
    return this.http.put<ConsumoLeitura>(`${this.apiUrl}/${id}`, payload);
  }

  eliminar(id?: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  preencherEdificio(): Observable<EdificiosResponse[]> {
    return this.http.get<EdificiosResponse[]>(`${this.apiUrl}/edificios`);
  }
}
