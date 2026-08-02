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

// Tabela de dados: cabeçalho, linha de filtros, corpo e os estados de
// carregar / sem dados / sem resultados.
//
// Recebe o `ModeloTabela` inteiro em vez dos pedaços — as colunas, as linhas
// e os filtros ativos vêm todos de lá. As colunas que precisam de markup
// próprio são declaradas pela página com `ng-template appCelula="chave"`; as
// outras mostram o texto que a definição da coluna já calculou.
//
// Uso:
//   <app-tabela-filtrada [modelo]="modelo" [carregando]="carregando$ | async">
//     <ng-template appCelula="acoes" let-chave>…</ng-template>
//     <app-paginacao rodape [paginador]="paginador"></app-paginacao>
//   </app-tabela-filtrada>
//
// Os estilos vivem em `styles/tabela.scss`, registado globalmente — ver o
// README. Não são `styleUrls` porque metade das classes é escrita pela
// página e estilo encapsulado nunca lá chegaria.
@Component({
  selector: "app-tabela-filtrada",
  templateUrl: "./tabela-filtrada.component.html",
})
export class TabelaFiltradaComponent implements AfterContentInit, OnDestroy {
  // `any` deliberado: componentes do Angular 6 não levam genéricos para o
  // template. A segurança de tipos vive no `MapaColunas` de cada tabela.
  @Input() modelo: ModeloTabela<any, string> | null = null;

  @Input() carregando = false;

  // Não há registos de todo — diferente de os filtros não deixarem passar
  // nada, que a tabela trata sozinha
  @Input() mensagemVazia = "Não existem registos.";
  @Input() textoCarregando = "A carregar...";

  // Modificador do <table>, ex: "tbl--emprestadas"
  @Input() classeTabela = "";

  // Como identificar uma linha, para o `trackBy` não recriar o DOM todo a
  // cada resposta do backend. Sem isto cai-se no índice.
  @Input() idDe: ((item: any) => any) | null = null;

  @ContentChildren(CelulaTabelaDirective)
  celulas: QueryList<CelulaTabelaDirective> | null = null;

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

  // `null` quando a coluna não tem template próprio: mostra-se o texto
  templateDe(coluna: string): TemplateRef<any> | null {
    return this.templates[coluna] || null;
  }

  limparFiltros(): void {
    if (this.modelo) this.modelo.limpar();
  }

  trackByChave(_: number, coluna: ColunaVM): string {
    return coluna.chave;
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
