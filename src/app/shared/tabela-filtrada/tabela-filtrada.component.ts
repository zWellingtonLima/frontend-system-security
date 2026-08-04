import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  OnDestroy,
  QueryList,
  TemplateRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { CelulaTabelaDirective } from "./celula-tabela.directive";
import { ModeloTabela } from "./modelo-tabela";
import { ColunaVM, LinhaTabela } from "./tabela.model";

// Baixo de propósito — ver o comentário do `linhasEsqueleto`
const LINHAS_ESQUELETO_PADRAO = 5;

/**
 * Tabela de dados: cabeçalho, linha de filtros, corpo e os estados de
 * carregar / sem dados / sem resultados.
 *
 * Recebe o `ModeloTabela` inteiro em vez dos pedaços — as colunas, as linhas
 * e os filtros ativos vêm todos de lá. As colunas que precisam de markup
 * próprio são declaradas pela página com `ng-template appCelula="chave"`; as
 * outras mostram o texto que a definição da coluna já calculou.
 *
 * @example
 * <app-tabela-filtrada [modelo]="modelo" [carregando]="carregando$ | async">
 *   <ng-template appCelula="acoes" let-chave>…</ng-template>
 *   <app-paginacao rodape [paginador]="paginador"></app-paginacao>
 * </app-tabela-filtrada>
 *
 * @see ModeloTabela
 * @see CelulaTabelaDirective
 */
// Os estilos vivem em `styles/tabela.scss`, registado globalmente — ver o
// README. Não são `styleUrls` porque metade das classes é escrita pela
// página e estilo encapsulado nunca lá chegaria.
@Component({
  selector: "app-tabela-filtrada",
  templateUrl: "./tabela-filtrada.component.html",
})
export class TabelaFiltradaComponent implements AfterContentInit, OnDestroy {
  /** O modelo da tabela: colunas, linhas e filtros ativos. Obrigatório. */
  // `any` deliberado: componentes do Angular 6 não levam genéricos para o
  // template. A segurança de tipos vive no `MapaColunas` de cada tabela.
  @Input() modelo: ModeloTabela<any, string> | null = null;

  /**
   * Desenha o esqueleto se ainda não houver linhas; esbate as que houver.
   *
   * A moldura da tabela nunca sai do DOM — só o `<tbody>` muda.
   */
  @Input() carregando = false;

  /**
   * Mostrada quando não há registos **de todo** — diferente de os filtros
   * não deixarem passar nada, que a tabela trata sozinha.
   */
  @Input() mensagemVazia = "Não existem registos.";

  /**
   * Quantas linhas de esqueleto desenhar no primeiro carregamento. Uma
   * tabela paginada sabe o tamanho da página e deve passá-lo.
   */
  // `Number()` porque um `linhasEsqueleto="20"` no template chega aqui como
  // string, e `new Array("20")` dá um array de UM elemento em vez de 20.
  @Input()
  set linhasEsqueleto(quantidade: number) {
    const total = Number(quantidade);
    this.esqueleto = new Array(total > 0 ? total : LINHAS_ESQUELETO_PADRAO);
  }

  /** Classe extra no `<table>`, para um modificador teu (ex: `"tbl--emprestadas"`). */
  @Input() classeTabela = "";

  /**
   * Como identificar uma linha, para o `trackBy` não recriar o DOM todo a
   * cada resposta do backend. Sem isto usa o índice.
   */
  @Input() idDe: ((item: any) => any) | null = null;

  @ContentChildren(CelulaTabelaDirective)
  celulas: QueryList<CelulaTabelaDirective> | null = null;

  // Só serve de contador ao `*ngFor` do esqueleto; o conteúdo nunca é lido.
  // Construído no setter e não num getter — um getter devolvia um array
  // novo a cada ciclo de deteção de mudanças.
  esqueleto: undefined[] = new Array(LINHAS_ESQUELETO_PADRAO);

  private templates: { [coluna: string]: TemplateRef<any> } = {};
  private mudancas: Subscription | null = null;

  ngAfterContentInit(): void {
    if (!this.celulas) return;

    this.mapearTemplates();
    // Um `*ngIf` à volta de um `ng-template appCelula` muda o conjunto
    this.mudancas = this.celulas.changes.subscribe(() =>
      this.mapearTemplates(),
    );
  }

  /**
   * O `ng-template` que a página declarou para esta coluna.
   *
   * @returns `null` quando a coluna não tem template próprio — nesse caso
   * mostra-se o texto que a definição da coluna já calculou.
   */
  templateDe(coluna: string): TemplateRef<any> | null {
    return this.templates[coluna] || null;
  }

  /** Desfaz todos os filtros. Ligado ao botão do estado "sem resultados". */
  limparFiltros(): void {
    if (this.modelo) this.modelo.limpar();
  }

  trackByChave(_: number, coluna: ColunaVM): string {
    return coluna.chave;
  }

  // As linhas do esqueleto são todas `undefined`. Com o trackBy por
  // identidade o Angular via-as como duplicados e rebentava.
  trackByIndice(indice: number): number {
    return indice;
  }

  // Campo, não método: o Angular chama o `trackBy` sem `this`
  trackByLinha = (indice: number, linha: LinhaTabela<any>): any => {
    if (!this.idDe) return indice;

    const id = this.idDe(linha.item);
    return id === null || id === undefined ? indice : id;
  };

  private mapearTemplates(): void {
    if (!this.celulas) return;

    const mapa: { [coluna: string]: TemplateRef<any> } = {};
    this.celulas.forEach((celula) => {
      if (celula.coluna) mapa[celula.coluna] = celula.template;
    });
    this.templates = mapa;
  }

  ngOnDestroy(): void {
    if (this.mudancas) this.mudancas.unsubscribe();
  }
}
