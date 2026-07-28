import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ViewCell } from "ng2-smart-table";
import { ChaveViewModel } from "../../../models/api";
import { ChaveService } from "../../../services/api/chave.service";

export type AcaoLinhaChave = "atualizar" | "devolver";

export interface PedidoAcaoChave {
  acao: AcaoLinhaChave;
  chave: ChaveViewModel;
}

// Os dois botões de ação da linha, para o ng2-smart-table.
//
// As `actions.custom` que a lib traz de origem renderizam um <a> com um título
// e não permitem ligar `[disabled]` ao `salvando$` — durante um PUT/POST o
// utilizador conseguiria clicar outra vez. Manter esse comportamento obriga a
// uma célula custom.
//
// O `@Output` não é ligado por um template: a lib instancia esta célula por
// factory, e é o `onComponentInitFunction` no `settings` do ChavesComponent
// que subscreve o `acao`.
@Component({
  selector: "app-acoes-cell",
  template: `
    <div class="acoes-chave" *ngIf="{ salvando: salvando$ | async } as vm">
      <button
        class="portaria-btn portaria-btn--secondary"
        type="button"
        title="Atualizar ou devolver"
        [disabled]="vm.salvando"
        (click)="pedir('atualizar')"
      >
        <i class="ft-edit-2"></i>
      </button>
      <button
        class="portaria-btn portaria-btn--ghost"
        type="button"
        title="Devolver em nome de {{ rowData.nomeFuncionario }}"
        [disabled]="vm.salvando"
        (click)="pedir('devolver')"
      >
        <i class="ft-corner-down-left"></i>
      </button>
    </div>
  `,
  styleUrls: ["./acoes-cell.component.scss"],
})
export class AcoesCellComponent implements ViewCell {
  // Ambos exigidos pela interface ViewCell. O `value` não é usado — a coluna
  // de ações não corresponde a campo nenhum dos dados.
  @Input() value: string | number;
  @Input() rowData: ChaveViewModel;

  @Output() acao = new EventEmitter<PedidoAcaoChave>();

  // O service é injetado só para o estado de gravação; as ações saem pelo
  // @Output, não por ele.
  salvando$ = this.service.estaSalvando$;

  constructor(private service: ChaveService) {}

  pedir(acao: AcaoLinhaChave): void {
    this.acao.emit({ acao, chave: this.rowData });
  }
}
