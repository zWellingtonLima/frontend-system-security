import { Component, OnInit } from "@angular/core";
import { ChaveService } from "../../services/api/chave.service";

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit {
  // MODAL
  modalIsOpen: boolean = false;

  chaves$ = this.service.chaves$;

  constructor(private service: ChaveService) {}

  ngOnInit() {
    this.service.carregarTodasChaves();
  }

  // Modal
  alternarVisibilidadeModal(): void {
    this.modalIsOpen = !this.modalIsOpen;
  }
}
