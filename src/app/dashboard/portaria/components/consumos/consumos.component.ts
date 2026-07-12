import { Component, OnInit } from "@angular/core";
import { TipoConsumo, UltimaLeitura } from "../../models/consumo.model";

@Component({
  selector: "app-consumos",
  templateUrl: "./consumos.component.html",
  styleUrls: ["./consumos.component.scss"],
})
export class ConsumosComponent implements OnInit {
  // ── Cards "leituras actuais" ──
  ultimaAgua: UltimaLeitura | null = null;
  ultimaEletricidade: UltimaLeitura | null = null;
  ultimaGas: UltimaLeitura | null = null;

  // ── Modal: nova leitura ──
  modalNovoAberto = false;
  novoTipo: TipoConsumo = "AGUA";
  novoValor: number | null = null;
  novaObs = "";
  salvandoNovo = false;

  formatarData(dataRequest: string): string {
    if (!dataRequest) {
      return "-";
    }
    const data = new Date(dataRequest);
    const dataFmt = data.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const horaFmt = data.toLocaleDateString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dataFmt}, ${horaFmt}`;
  }

  formatarValor(valor: number): string {
    if (valor === null || valor === undefined) {
      return "-";
    }
    return valor.toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  abrirModalNovo(): void {
    this.novoTipo = "AGUA";
    this.novoValor = null;
    this.novaObs = "";
    this.modalNovoAberto = true;
  }

  constructor() {}

  ngOnInit() {}
}
