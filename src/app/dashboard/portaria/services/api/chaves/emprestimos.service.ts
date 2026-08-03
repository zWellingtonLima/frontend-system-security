import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import {
  ChaveDisponivelDTO,
  ChaveViewModel,
  ChavesResponseDTO,
  DevolucaoDTO,
  EmprestimoCriarDTO,
  EmprestimoUpdateDTO,
  GrupoChaves,
} from "../../../models/api";
import { environment } from "src/environments/environment";
import {
  agruparParaEdicao,
  agruparPorEdificio,
  toChaveOpcao,
  toViewModel,
} from "./chaves.mapper";

@Injectable({
  providedIn: "root",
})
export class EmprestimosService {
  private emprestadas = new BehaviorSubject<ChaveViewModel[]>([]);
  readonly emprestadas$ = this.emprestadas.asObservable();

  private totalEmprestadas = new BehaviorSubject<number>(0);
  readonly totalEmprestadas$ = this.totalEmprestadas.asObservable();

  private estaCarregandoDados = new BehaviorSubject<boolean>(false);
  readonly estaCarregandoDados$ = this.estaCarregandoDados.asObservable();

  private chavesDisponiveis = new BehaviorSubject<GrupoChaves[] | null>(null);
  readonly chavesDisponiveis$ = this.chavesDisponiveis.asObservable();

  // Opções do select do modal Atualizar: disponíveis + a chave atual do
  // empréstimo, agrupadas por edifício para os <optgroup>. `null` = a carregar
  private opcoesEdicao = new BehaviorSubject<GrupoChaves[] | null>(null);
  readonly opcoesEdicao$ = this.opcoesEdicao.asObservable();

  private estaSalvando = new BehaviorSubject<boolean>(false);
  readonly estaSalvando$ = this.estaSalvando.asObservable();

  constructor(private http: HttpClient) {}

  // ===========================================
  // ================= GET =====================

  carregarEmprestadas(): void {
    this.estaCarregandoDados.next(true);

    this.http
      .get<ChavesResponseDTO[]>(environment.chavesEmprestadasApiURL)
      .pipe(
        catchError((err) => {
          console.error("EMPR-SERV-LISTA: " + err);
          return of(null);
        }),
        finalize(() => this.estaCarregandoDados.next(false)),
      )
      .subscribe((resultado) => {
        if (resultado === null) return;

        this.emprestadas.next(resultado.map(toViewModel));
        this.totalEmprestadas.next(resultado.length);
      });
  }

  // Disponíveis para o modal Emprestar — buscadas ao abrir o modal para
  // refletir sempre o estado atual. Agrupa por idEdificio
  carregarDisponiveis(): void {
    this.chavesDisponiveis.next(null);

    this.buscarDisponiveis().subscribe((resultado) => {
      this.chavesDisponiveis.next(
        agruparPorEdificio((resultado || []).map(toChaveOpcao)),
      );
    });
  }

  carregarOpcoesEdicao(chaveAtual: ChaveViewModel): void {
    this.opcoesEdicao.next(null);

    this.buscarDisponiveis().subscribe((resultado) => {
      this.opcoesEdicao.next(agruparParaEdicao(resultado || [], chaveAtual));
    });
  }

  // ===========================================
  // ================= PUT =====================

  // Corrige os dados de um empréstimo em aberto (funcionário e/ou chave).
  // Não devolve a chave - continua emprestada.
  atualizarEmprestimo(
    idEmprestimo: number,
    data: EmprestimoUpdateDTO,
  ): Observable<boolean> {
    return this.executarAcao(
      this.http.patch<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}`,
        data,
      ),
      "EMPR-SERV-UPDATE",
    );
  }

  // ===========================================
  // ================= POST ====================

  // Regista um novo empréstimo de chave.
  emprestarChave(data: EmprestimoCriarDTO): Observable<boolean> {
    return this.executarAcao(
      this.http.post<void>(environment.chavesEmprestimoApiUrl, data),
      "EMPR-SERV-EMPRESTIMO",
    );
  }

  // Regista a devolução de um empréstimo em aberto.
  devolverChave(idEmprestimo: number, data: DevolucaoDTO): Observable<boolean> {
    return this.executarAcao(
      this.http.post<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}`,
        data,
      ),
      "EMPR-SERV-DEVOLUCAO",
    );
  }

  devolverRapidoChave(idEmprestimo: number): Observable<boolean> {
    return this.executarAcao(
      this.http.post<void>(
        `${environment.chavesEmprestimoApiUrl}/${idEmprestimo}/rapida`,
        null,
      ),
      "EMPR-SERV-DEVOLUCAO-RAPIDA",
    );
  }

  // ================================
  // ========== UTILITARIOS =========

  // Toda a escrita segue o mesmo padrão: marcar como a salvar, recarregar a
  // lista em caso de sucesso e devolver ao componente apenas se deu tudo certo.
  private executarAcao(
    pedido: Observable<void>,
    etiquetaErro: string,
  ): Observable<boolean> {
    this.estaSalvando.next(true);

    return pedido.pipe(
      map(() => {
        this.carregarEmprestadas();
        return true;
      }),
      catchError((err) => {
        console.error(`${etiquetaErro}: `, err);
        return of(false);
      }),
      finalize(() => this.estaSalvando.next(false)),
    );
  }

  // GET /disponiveis partilhado pelos dois modais. Devolve null em erro.
  private buscarDisponiveis(): Observable<ChaveDisponivelDTO[] | null> {
    return this.http
      .get<ChaveDisponivelDTO[]>(environment.chavesDisponiveisApiUrl)
      .pipe(
        catchError((err) => {
          console.error("EMPR-SERV-DISP: " + err);
          return of(null);
        }),
      );
  }
}
