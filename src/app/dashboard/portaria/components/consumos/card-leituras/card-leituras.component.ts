import { Component, Input } from "@angular/core";

@Component({
  selector: "app-card-leituras",
  templateUrl: "./card-leituras.component.html",
  styleUrls: ["./card-leituras.component.scss"],
})
export class CardLeiturasComponent {
  @Input() nomeEdificio!: string;
  @Input() leituraAtual: number | null = null;
  @Input() consumo: number | null = null;
  @Input() dataRegisto: string | Date | null = null;
  @Input() unidade = "m³";
  @Input() tipoClasse: "agua" | "elet" | "gas" = "agua";
}
