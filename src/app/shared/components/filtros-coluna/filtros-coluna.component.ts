import { Component, Input } from "@angular/core";
import { ColunaVM } from "../../models/filtro-tabela";
import { FiltroTabela } from "../../utils/filtro-tabela";

// Recebe a própria instância do filtro, não os seus pedaços: as colunas
// visíveis, os títulos, os valores ativos e as opções vêm todos do mesmo
// `colunas$`, e o que o utilizador escreve volta lá para dentro sem passar
// pela página. Mesmo princípio de um [formGroup].
@Component({
  selector: "[appFiltrosColuna]",
  templateUrl: "./filtros-coluna.component.html",
  styleUrls: ["./filtros-coluna.component.scss"],
})
export class FiltrosColunaComponent {
  // `any` deliberado: componentes do Angular 6 não levam genéricos para o
  // template. A segurança de tipos vive no `MapaColunas` e no `setFiltro`
  // da instância, onde importa.
  @Input() filtro!: FiltroTabela<any, string>;

  // O acesso ao DOM fica contido aqui: o template só liga eventos
  onEscrever(coluna: string, evento: Event): void {
    this.filtro.setFiltro(coluna, (evento.target as HTMLInputElement).value);
  }

  onEscolher(coluna: string, evento: Event): void {
    this.filtro.setFiltro(coluna, (evento.target as HTMLSelectElement).value);
  }

  trackByChave(_: number, coluna: ColunaVM): string {
    return coluna.chave;
  }
}
