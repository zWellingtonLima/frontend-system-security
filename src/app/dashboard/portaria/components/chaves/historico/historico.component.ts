import { Component, OnInit } from "@angular/core";
import { EmprestimosHistoricoService } from "../../../services/api/emprestimos-historico.service";
import { COLUNA_EMPRESTIMO_TITULO } from "../../../models/enums";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-historico",
  templateUrl: "./historico.component.html",
  styleUrls: ["./historico.component.scss"],
})
export class EmprestimosHistoricoComponent implements OnInit {
  historico$ = this.service.chavesEmprestimoHistorico$;
  colunas$ = this.service.colunas$;
  titulos = COLUNA_EMPRESTIMO_TITULO;

  tabAtiva$ = this.service.tabAtiva$;
  paginacao$ = this.service.paginacao$;
  carregando$ = this.service.estaCarregandoDados$;

  filtrosForm!: FormGroup;

  constructor(
    private service: EmprestimosHistoricoService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.service.inicializar();

    this.filtrosForm = this.fb.group({
      dataInicio: [""],
      dataFim: [""],
      idEdificio: [""],
    });

    this.filtrosForm.valueChanges.subscribe(() => {
      this.service.carregarEmprestimoHistorico({
        ...this.filtrosForm.value,
      });
    });
  }

  onSearch(q: string): void {
    this.service.carregarEmprestimoHistorico({ texto: q });
  }

  // Setas anterior/seguinte - recebe a página de destino (0-based)
  onPageChange(pagina: number) {
    this.service.setPagina(pagina);
  }

  // Botões numerados - converte a página exibida (1-based) para 0-based
  irParaPagina(p: number | "...") {
    if (typeof p !== "number") return;
    this.service.setPagina(p - 1);
  }

  trackById(_: number, chave: { id: number }) {
    return chave.id;
  }
}
