import { tap } from 'rxjs/operators';
import { ChaveEmprestadas } from '../../models/api';
import { DashboardService } from './../../services/dashboard-service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private service: DashboardService) { }

  chaves: ChaveEmprestadas[] = [];

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

  ngOnInit() {
    this.carregarChaves();
  }

}
