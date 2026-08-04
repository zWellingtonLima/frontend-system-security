import { Component, OnInit } from "@angular/core";
import {
  FILTROS_VAZIOS_MOVIMENTACOES,
  MovimentacoesService,
} from "../../../services/api/movimentacoes.service";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-historico-movimentacoes",
  templateUrl: "./historico-movimentacoes.component.html",
  styleUrls: ["./historico-movimentacoes.component.scss"],
})
export class HistoricoMovimentacoesComponent implements OnInit {
  constructor(
    private movimentacoesService: MovimentacoesService,
    private fb: FormBuilder,
  ) {}

  filtrosForm!: FormGroup;
  listaMovimentacoes = this.movimentacoesService.listaMovimentacoes$;
  carregando = this.movimentacoesService.estaCarregandoDados$;
  paginador = this.movimentacoesService.paginador;
  tipoVisita = this.movimentacoesService.listaPartilhada$;

  ngOnInit() {
    this.movimentacoesService.inicializar();
    this.filtrosForm = this.fb.group(FILTROS_VAZIOS_MOVIMENTACOES);
  }

  aplicarFiltros(): void {
    this.movimentacoesService.aplicarFiltros(this.filtrosForm.value);
  }

  limparFiltros(): void {
    this.filtrosForm.reset(FILTROS_VAZIOS_MOVIMENTACOES);
    this.movimentacoesService.limparFiltros();
  }
}
