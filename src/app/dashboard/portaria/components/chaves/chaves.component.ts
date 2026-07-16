import { Component, OnInit } from "@angular/core";
import { ChaveService } from "../../services/api/chave.service";
import { ChaveEmprestadas, ChavesHistorico } from "../../models/api";
import { Observable } from "rxjs";
import { TipoChaveEnum, TipoChaveLabel } from "../../models/enums";

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit {
  lista: Observable<ChavesHistorico[]>;
  paginaAtual = 1;
  totalPaginas = 5;

  historicoChaves: ChavesHistorico[] = [
    {
      descricao: "CHV-101",
      tipo: TipoChaveEnum.CHAVE,
      sala: "101",
      nomePessoa: "Ana Souza",
      horaEntrega: new Date("2026-07-09T08:30:00"),
      horaDevolucao: new Date("2026-07-09T12:00:00"),
      devolvidaPor: "Ana Souza",
      observacoes: "Chave devolvida no horário correto.",
    },
    {
      descricao: "Molho TI",
      tipo: TipoChaveEnum.MOLHO,
      sala: "Não aplicável", // Sendo string, pode usar texto em vez de null
      nomePessoa: "Carlos Lima",
      horaEntrega: new Date("2026-07-09T14:15:00"),
      horaDevolucao: new Date("2026-07-09T17:30:00"),
      devolvidaPor: "Marcos (Supervisor)",
      observacoes: "Esqueceram-se de devolver na receção, recolhida na sala.",
    },
  ];

  constructor(private service: ChaveService) {
    this.lista = this.service.getChavesHistorico();
  }

  ngOnInit() {}

  avancarPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
    this.lista = this.service.getChavesHistorico();
  }

  voltarPagina() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
    this.service.getChavesHistorico();
  }
}
