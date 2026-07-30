import { Component, OnInit } from "@angular/core";
import {
  EmprestimosHistoricoService,
  FILTROS_VAZIOS,
} from "../../../services/api/emprestimos-historico.service";
import {
  COLUNA_EMPRESTIMO_TITULO,
  EDIFICIO_OPCOES,
} from "../../../models/enums";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-historico",
  templateUrl: "./historico.component.html",
  styleUrls: ["./historico.component.scss"],
})
export class EmprestimosHistoricoComponent implements OnInit {
  historico$ = this.service.chavesEmprestimoHistorico$;
  paginador = this.service.paginador;
  carregando$ = this.service.estaCarregandoDados$;

  colunas = this.service.colunas;
  titulos = COLUNA_EMPRESTIMO_TITULO;
  edificios = EDIFICIO_OPCOES;

  // Rascunho: só chega ao service quando o utilizador confirma
  filtrosForm!: FormGroup;

  constructor(
    private service: EmprestimosHistoricoService,
    private fb: FormBuilder,
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

  trackById(_: number, chave: { id: number }) {
    return chave.id;
  }
}
