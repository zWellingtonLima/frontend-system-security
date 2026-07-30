import { Component, Input } from "@angular/core";
import { ColunaVM } from "../../models/modelo-tabela";
import { ModeloTabela } from "../../utils/modelo-tabela";

// Recebe a própria instância do modelo, não os seus pedaços: as colunas
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
  @Input() modelo: ModeloTabela<any, string> | null = null;

  // O acesso ao DOM fica contido aqui: o template só liga eventos
  onEscrever(coluna: string, evento: Event): void {
    this.definir(coluna, (evento.target as HTMLInputElement).value);
  }

  onEscolher(coluna: string, evento: Event): void {
    this.definir(coluna, (evento.target as HTMLSelectElement).value);
  }

  private definir(coluna: string, valor: string): void {
    if (this.modelo) this.modelo.setFiltro(coluna, valor);
  }

  trackByChave(_: number, coluna: ColunaVM): string {
    return coluna.chave;
  }
}
