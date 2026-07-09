import { tap } from 'rxjs/operators';
import { ChaveEmprestadas, Ocorrencias } from '../../models/api';
import { DashboardService } from './../../services/dashboard-service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private service: DashboardService) { }
  chavesFora = 5;
  chavesEmAtraso = 1;
  statusLabel = "Atrasada";
  ocorrenciasAbertas = 1;
  visitasHoje = 8;
  ocorrenciasPendentes = 0;

  chaves: ChaveEmprestadas[] = [];
  ocorrencias: Ocorrencias[] = [];

   carregarChaves() {
    this.service.getChavesEmprestadas()
    .subscribe(
        (dados) => {
          this.chaves = dados;
        },
        (erro) => {
          console.error('Erro ao buscar chaves:', erro);
        }
      );
  }
  carregarOcorrencias(){
    this.service.getOcorrenciasRecentes()
    .subscribe(
        (dados) => {
          this.ocorrencias = dados;
        },
        (erro) => {
          console.error('Erro ao buscar chaves:', erro);
        }
      );
  }

  ngOnInit() {
    this.carregarChaves();
    this.carregarOcorrencias
  }


}
