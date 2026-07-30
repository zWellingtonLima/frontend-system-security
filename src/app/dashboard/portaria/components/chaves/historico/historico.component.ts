import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { of } from "rxjs";
import { ModeloTabela } from "src/app/shared/utils/modelo-tabela";
import { ChaveViewModel } from "../../../models/api";
import {
  EmprestimosHistoricoService,
  FILTROS_VAZIOS,
} from "../../../services/api/emprestimos-historico.service";
import { EDIFICIO_OPCOES } from "../../../models/enums";
import {
  ColunaHistorico,
  COLUNAS_HISTORICO,
  criarColunasHistorico,
} from "./historico.colunas";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-historico",
  templateUrl: "./historico.component.html",
  styleUrls: ["./historico.component.scss"],
})
export class EmprestimosHistoricoComponent implements OnInit {
  readonly modelo = new ModeloTabela<ChaveViewModel, ColunaHistorico>(
    criarColunasHistorico(this.datePipe),
    of(COLUNAS_HISTORICO),
    this.service.chavesEmprestimoHistorico$,
  );

  paginador = this.service.paginador;
  carregando$ = this.service.estaCarregandoDados$;

  edificios = EDIFICIO_OPCOES;

  // Rascunho: só chega ao service quando o utilizador confirma
  filtrosForm!: FormGroup;

  constructor(
    private service: EmprestimosHistoricoService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.service.inicializar();
    this.filtrosForm = this.fb.group(FILTROS_VAZIOS);
  }

  // Botão Procurar e Enter no campo de pesquisa
  aplicarFiltros(): void {
    this.service.aplicarFiltros(this.filtrosForm.value);
  }

  limparFiltros(): void {
    this.filtrosForm.reset(FILTROS_VAZIOS);
    this.service.limparFiltros();
  }

  idDaChave(chave: ChaveViewModel): number {
    return chave.id;
  }
}
