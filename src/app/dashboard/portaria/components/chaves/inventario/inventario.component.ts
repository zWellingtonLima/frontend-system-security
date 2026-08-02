import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { of } from "rxjs";
import { ModeloTabela } from "src/app/shared/tabela-filtrada";
import { ChaveViewModel } from "../../../models/api";
import { EDIFICIO_OPCOES, PISOS_OPCOES } from "../../../models/enums";
import {
  FILTROS_VAZIOS_INVENTARIO,
  InventarioService,
} from "../../../services/api/chaves/inventario.service";
import {
  ColunaInventario,
  COLUNAS_INVENTARIO,
  criarColunasInventario,
} from "./inventario.colunas";

@Component({
  selector: "app-inventario",
  templateUrl: "./inventario.component.html",
  styleUrls: ["./inventario.component.scss"],
  providers: [InventarioService],
})
export class InventarioComponent implements OnInit {
  readonly modelo = new ModeloTabela<ChaveViewModel, ColunaInventario>(
    criarColunasInventario(this.datePipe),
    of(COLUNAS_INVENTARIO),
    this.service.chaves$,
  );

  paginador = this.service.paginador;
  carregando$ = this.service.estaCarregando$;

  edificios = EDIFICIO_OPCOES;
  pisos = PISOS_OPCOES;

  filtrosForm!: FormGroup;

  constructor(
    private service: InventarioService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.filtrosForm = this.fb.group(FILTROS_VAZIOS_INVENTARIO);
    this.service.carregar();
  }

  aplicarFiltros(): void {
    this.service.aplicarFiltros(this.filtrosForm.value);
  }

  limparFiltros(): void {
    this.filtrosForm.reset(FILTROS_VAZIOS_INVENTARIO);
    this.service.limparFiltros();
  }

  idDaChave(chave: ChaveViewModel): number {
    return chave.id;
  }
}
