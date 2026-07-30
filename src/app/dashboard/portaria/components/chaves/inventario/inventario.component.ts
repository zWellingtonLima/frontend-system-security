import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ChaveViewModel } from "../../../models/api";
import { EDIFICIO_OPCOES, PISOS_OPCOES } from "../../../models/enums";
import {
  FILTROS_VAZIOS_INVENTARIO,
  InventarioService,
} from "../../../services/api/inventario.service";

@Component({
  selector: "app-inventario",
  templateUrl: "./inventario.component.html",
  styleUrls: ["./inventario.component.scss"],
  providers: [InventarioService],
})
export class InventarioComponent implements OnInit {
  chaves$ = this.service.chaves$;
  paginador = this.service.paginador;
  carregando$ = this.service.estaCarregando$;

  edificios = EDIFICIO_OPCOES;
  pisos = PISOS_OPCOES;

  filtrosForm!: FormGroup;

  constructor(
    private service: InventarioService,
    private fb: FormBuilder,
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

  trackById(_: number, chave: ChaveViewModel) {
    return chave.id;
  }
}
