import { Component, Input } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Paginador } from "../../utils/paginador";

// Quantas páginas mostrar de cada lado da atual
const VIZINHAS = 1;

interface PaginacaoVista {
  paginaAtual: number;
  paginas: (number | "...")[];
  temAnterior: boolean;
  temProximo: boolean;
  texto: string;
  temPaginas: boolean;
}

// Barra de navegação de uma listagem paginada.
// Uso:
// <app-paginacao [paginador]="paginador"></app-paginacao>
@Component({
  selector: "app-paginacao",
  templateUrl: "./paginacao.component.html",
  styleUrls: ["./paginacao.component.scss"],
})
export class PaginacaoComponent {
  paginador: Paginador | null = null;
  vista$: Observable<PaginacaoVista> | null = null;

  @Input("paginador")
  set definirPaginador(paginador: Paginador) {
    this.paginador = paginador || null;
    this.vista$ = paginador
      ? combineLatest(
          paginador.paginaAtual$,
          paginador.totalPaginas$,
          paginador.totalRegistos$,
        ).pipe(
          map(([pagina, totalPaginas, totalRegistos]) =>
            this.calcularVista(pagina, totalPaginas, totalRegistos),
          ),
        )
      : null;
  }

  // Setas anterior/seguinte — recebem a página de destino (0-based)
  irPara(pagina: number): void {
    if (this.paginador) this.paginador.ir(pagina);
  }

  irParaNumero(pagina: number | "..."): void {
    if (typeof pagina !== "number") return;
    this.irPara(pagina - 1);
  }

  private calcularVista(
    pagina: number,
    totalPaginas: number,
    totalRegistos: number,
  ): PaginacaoVista {
    return {
      paginaAtual: pagina,
      paginas: this.calcularPaginasVisiveis(pagina + 1, totalPaginas),
      temAnterior: pagina > 0,
      temProximo: pagina < totalPaginas - 1,
      texto: this.calcularTexto(pagina, totalRegistos),
      // Uma página só não é paginação
      temPaginas: totalPaginas > 1,
    };
  }

  private calcularTexto(pagina: number, totalRegistos: number): string {
    if (!this.paginador || totalRegistos === 0) return "0 registos";

    const tamanho = this.paginador.tamanho;
    const inicio = pagina * tamanho + 1;
    const fim = Math.min((pagina + 1) * tamanho, totalRegistos);

    return `${inicio} - ${fim} de ${totalRegistos}`;
  }

  private calcularPaginasVisiveis(
    atual: number,
    total: number,
  ): (number | "...")[] {
    if (total <= 1) return [];

    const paginasRelevantes = Array.from(
      new Set([1, atual - VIZINHAS, atual, atual + VIZINHAS, total]),
    )
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);

    const resultado: (number | "...")[] = [];
    paginasRelevantes.forEach((p, i) => {
      if (i > 0 && p - paginasRelevantes[i - 1] > 1) resultado.push("...");
      resultado.push(p);
    });

    return resultado;
  }
}
