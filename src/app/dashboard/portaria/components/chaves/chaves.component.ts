import { Component, OnInit } from "@angular/core";
import { ChaveService } from "../../services/api/chave.service";
import { ChavesTabConfig } from "../../models/enums";

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit {
  // MODAL
  modalIsOpen: boolean = false;

  // FILTROS E TABS
  tabAtiva$ = this.service.tabAtiva$;
  tabs = this.service.tabs;

  chaves$ = this.service.chavesList$;

  constructor(private service: ChaveService) {}

  ngOnInit() {
    this.service.carregarTodasChaves();
  }

  onTabChange(tab: ChavesTabConfig): void {
    this.service.setTab(tab);
  }

  // Modal
  alternarVisibilidadeModal(): void {
    this.modalIsOpen = !this.modalIsOpen;
  }
}
