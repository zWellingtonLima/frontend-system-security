import { Component, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";
import { ChaveViewModel } from "../../../models/api";

// Badge de estado para o ng2-smart-table.
//
// A lib não sabe renderizar nada além de texto e HTML cru, por isso qualquer
// célula com estrutura própria obriga a um componente inteiro registado em
// `entryComponents`. O equivalente na tabela escrita à mão eram 7 linhas de
// `*ngSwitchCase` dentro do próprio template.
@Component({
  selector: "app-estado-cell",
  template: `
    <span class="badge" [ngClass]="rowData.statusConfig.classe">
      <i [ngClass]="rowData.statusConfig.icone"></i>
      {{ rowData.statusConfig.label }}
    </span>
  `,
  styleUrls: ["./estado-cell.component.scss"],
})
export class EstadoCellComponent implements ViewCell {
  // Ambos exigidos pela interface ViewCell, mesmo que só use o `rowData`:
  // o `value` chega como string já formatada e perde o `statusConfig`.
  @Input() value!: string | number;
  @Input() rowData!: ChaveViewModel;
}
