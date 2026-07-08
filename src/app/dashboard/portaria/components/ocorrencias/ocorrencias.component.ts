import { Component, OnInit } from "@angular/core";
import { ConsumosService } from "../../services/api/ocorrencias.service";
import { OcorrenciasResponseDTO } from "../../models/api";
import { Observable } from "rxjs";

@Component({
  selector: "app-ocorrencias",
  templateUrl: "./ocorrencias.component.html",
  styleUrls: ["./ocorrencias.component.scss"],
})
export class OcorrenciasComponent implements OnInit {
  ocorrencias: Observable<OcorrenciasResponseDTO[]> =
    new Observable<OcorrenciasResponseDTO[]>();

  constructor(private consumosService: ConsumosService) {}

  ngOnInit() {
    this.ocorrencias = this.consumosService.listarTodasOcorrencias();
  }
}
