import { Component, EventEmitter, Input, Output } from "@angular/core";

// Referência estável para colunas sem opções: devolver um `[]` novo a cada
// chamada faria o *ngFor do template correr um diff a cada ciclo.
const SEM_OPCOES: string[] = [];

// Linha de filtros de uma tabela, um controlo por coluna.
//
// É um selector de ATRIBUTO aplicado a um <tr> do <thead>. Tem de ser:
// o HTML só aceita <tr> dentro de <thead>, e um <app-...> seria movido para
// fora da tabela pelo browser. O <tr> é o host — o template começa no <th>.
//
// Nota: os Inputs são `string`/`Record<string, ...>` e não o union de colunas
// da página. Componentes do Angular 6 não levam genéricos para o template; a
// segurança de tipos vive no `MapaColunas` e no `FiltroTabela`, onde importa.
@Component({
  selector: "[appFiltrosColuna]",
  templateUrl: "./filtros-coluna.component.html",
  styleUrls: ["./filtros-coluna.component.scss"],
})
export class FiltrosColunaComponent {
  // Colunas visíveis, na ordem em que a tabela as mostra
  @Input() colunas: string[] = [];

  // Valor ativo de cada coluna. Coluna ausente = sem filtro
  @Input() valores: Record<string, string> = {};

  // "texto" | "select" por coluna. Coluna ausente = não filtrável (<th> vazio)
  @Input() tipos: Record<string, string> = {};

  // Opções dos <select>, por coluna
  @Input() opcoes: Record<string, string[]> = {};

  // Títulos das colunas, para os placeholders e o aria-label
  @Input() titulos: Record<string, string> = {};

  @Output() mudou = new EventEmitter<{ coluna: string; valor: string }>();

  // O acesso ao DOM fica contido aqui: quem escuta recebe o valor já pronto
  onEscrever(coluna: string, evento: Event): void {
    this.mudou.emit({
      coluna,
      valor: (evento.target as HTMLInputElement).value,
    });
  }

  onEscolher(coluna: string, evento: Event): void {
    this.mudou.emit({
      coluna,
      valor: (evento.target as HTMLSelectElement).value,
    });
  }

  // Todos os acessos são tolerantes a null: os Inputs costumam vir de um
  // `| async` e podem chegar vazios no primeiro ciclo de renderização.
  tipoDe(coluna: string): string {
    return (this.tipos && this.tipos[coluna]) || "";
  }

  valorDe(coluna: string): string {
    return (this.valores && this.valores[coluna]) || "";
  }

  opcoesDe(coluna: string): string[] {
    return (this.opcoes && this.opcoes[coluna]) || SEM_OPCOES;
  }

  rotuloDe(coluna: string): string {
    return (this.titulos && this.titulos[coluna]) || coluna;
  }
}
