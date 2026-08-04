import { Directive, Input, TemplateRef } from "@angular/core";

/**
 * Marca um `ng-template` como o desenho de uma coluna.
 *
 * A página declara o template, a tabela renderiza-o na célula certa. Como um
 * `ng-template` é compilado onde é DECLARADO e não onde é renderizado, os
 * eventos e os observables lá dentro continuam a ser os da página — sem
 * `@Output` nenhum pelo meio.
 *
 * Declarar um destes é o que torna a coluna "personalizada": não há
 * nenhuma flag a manter em sincronia com o template.
 *
 * @example
 * <ng-template appCelula="acoes" let-chave let-linha="linha">
 *   <button (click)="devolver(chave)">…</button>
 * </ng-template>
 */
@Directive({
  selector: "[appCelula]",
})
export class CelulaTabelaDirective {
  /** A chave da coluna, tal como está no mapa de colunas. */
  @Input("appCelula") coluna = "";

  constructor(public template: TemplateRef<any>) {}
}
