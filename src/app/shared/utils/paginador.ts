import { BehaviorSubject, Observable } from "rxjs";

const TAMANHO_PAGINA_PADRAO = 20;

// Estado de uma listagem paginada no backend.
//
// Não depende de Angular e não sabe pedir dados: recebe no construtor o que
// fazer quando a página muda. É composto pelo service, não herdado — o
// service continua dono do HTTP, isto só guarda em que página vai.
//
// Uso:
//   readonly paginador = new Paginador(() => this.carregar());
//   ...
//   .set("page", String(this.paginador.pagina))
//   .set("size", String(this.paginador.tamanho))
//   ...
//   this.paginador.definirTotal(resultado.totalPages, resultado.totalElements);
export class Paginador {
  private paginaAtual = new BehaviorSubject<number>(0);
  readonly paginaAtual$: Observable<number> = this.paginaAtual.asObservable();

  private totalPaginas = new BehaviorSubject<number>(0);
  readonly totalPaginas$: Observable<number> = this.totalPaginas.asObservable();

  // Total de registos da query inteira, não os desta página. É o que permite
  // mostrar "1 - 20 de 137" ao lado dos botões.
  private totalRegistos = new BehaviorSubject<number>(0);
  readonly totalRegistos$: Observable<number> =
    this.totalRegistos.asObservable();

  constructor(
    private aoMudar: () => void,
    private tamanhoPagina: number = TAMANHO_PAGINA_PADRAO,
  ) {}

  // Página atual, 0-based como o backend a espera
  get pagina(): number {
    return this.paginaAtual.value;
  }

  get total(): number {
    return this.totalPaginas.value;
  }

  // Quantos registos por página. Vive aqui para o pedido e o contador não
  // poderem discordar sobre o tamanho da página.
  get tamanho(): number {
    return this.tamanhoPagina;
  }

  // Recebe a página de destino (0-based). Fora dos limites ou igual à atual
  // não recarrega — evita um pedido para não mudar nada.
  ir(pagina: number): void {
    const dentroDoLimite = pagina >= 0 && pagina <= this.total - 1;
    if (!dentroDoLimite || pagina === this.pagina) return;

    this.paginaAtual.next(pagina);
    this.aoMudar();
  }

  // Chamar depois de cada resposta do backend
  definirTotal(totalPaginas: number, totalRegistos: number): void {
    if (totalPaginas !== this.total) this.totalPaginas.next(totalPaginas);
    if (totalRegistos !== this.totalRegistos.value)
      this.totalRegistos.next(totalRegistos);
  }

  // Volta à primeira página sem recarregar: quem muda os filtros já vai
  // pedir os dados a seguir e não queremos dois pedidos.
  primeiraPagina(): void {
    if (this.pagina === 0) return;
    this.paginaAtual.next(0);
  }

  // Estado inicial, para quando o ecrã é reaberto
  reset(): void {
    this.paginaAtual.next(0);
    this.totalPaginas.next(0);
    this.totalRegistos.next(0);
  }
}
