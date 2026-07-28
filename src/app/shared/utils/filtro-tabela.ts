import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";
import {
  EstadoFiltros,
  MapaColunas,
  OpcoesFiltro,
} from "../models/filtro-tabela";

// Filtragem client-side de uma tabela, por coluna, com lógica AND: uma linha
// só passa se satisfizer TODOS os filtros ativos.
//
// Não depende de Angular — a tabela dá as linhas, esta classe devolve as
// linhas que passam. Reutilizável em qualquer página que já tenha os dados
// todos em memória.
//
// Uso:
//   const filtro = new FiltroTabela<ChaveViewModel, ColunaChave>({ ... });
//   const linhasVisiveis$ = filtro.aplicar(this.linhas$);
export class FiltroTabela<T, C extends string> {
  private filtros = new BehaviorSubject<EstadoFiltros>({});
  readonly filtros$ = this.filtros.asObservable();

  // Para distinguir "não há dados" de "os filtros não deixaram passar nada"
  readonly temAtivos$: Observable<boolean> = this.filtros$.pipe(
    map((filtros) => Object.keys(filtros).length > 0),
  );

  constructor(private mapa: MapaColunas<T, C>) {}

  // Valor vazio remove o filtro em vez de guardar "" — mantém o estado
  // limpo e `temAtivos$` honesto.
  setFiltro(coluna: C, valor: string): void {
    const texto = (valor || "").trim();
    const atuais = this.filtros.value;

    if ((atuais[coluna] || "") === texto) return;

    const proximos = this.clonar(atuais);
    if (texto) {
      proximos[coluna] = texto;
    } else {
      delete proximos[coluna];
    }

    this.filtros.next(proximos);
  }

  limpar(): void {
    if (Object.keys(this.filtros.value).length === 0) return;
    this.filtros.next({});
  }

  aplicar(linhas$: Observable<T[]>): Observable<T[]> {
    // `startWith` é obrigatório: o `debounceTime` seguraria a primeira
    // emissão do BehaviorSubject 150ms e a tabela nasceria vazia a piscar.
    const filtrosEstaveis$ = this.filtros$.pipe(
      debounceTime(150),
      startWith({} as EstadoFiltros),
    );

    return combineLatest(linhas$, filtrosEstaveis$).pipe(
      map(([linhas, filtros]) => this.filtrar(linhas, filtros)),
    );
  }

  // Valores distintos para preencher os <select>. Deriva das linhas SEM
  // filtro: se derivasse das filtradas, escolher "Edifício A" apagaria
  // "Edifício B" da lista e não haveria como voltar atrás.
  opcoes(linhas$: Observable<T[]>): Observable<OpcoesFiltro> {
    return linhas$.pipe(map((linhas) => this.calcularOpcoes(linhas)));
  }

  // Tipo de controlo por coluna, para alimentar a linha de filtros. Colunas
  // não filtráveis ficam de fora do resultado.
  // Chamar uma vez e guardar: devolve um objeto novo a cada chamada, não é
  // para usar diretamente num template.
  tipos(): Record<string, string> {
    const resultado: Record<string, string> = {};

    (Object.keys(this.mapa) as C[]).forEach((coluna) => {
      const config = this.mapa[coluna];
      if (config) resultado[coluna] = config.tipo;
    });

    return resultado;
  }

  // Acentos separados do caractere base (NFD) e removidos: "edificio"
  // escrito no filtro passa a encontrar "Edifício" na célula.
  static normalizar(texto: string): string {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private filtrar(linhas: T[], filtros: EstadoFiltros): T[] {
    // As chaves só entram no estado via `setFiltro(coluna: C, ...)`, por isso
    // são colunas válidas — o cast repõe o que o `Object.keys` perde.
    const ativos = Object.keys(filtros).filter((c) => !!filtros[c]) as C[];
    if (ativos.length === 0) return linhas;

    return linhas.filter((linha) =>
      ativos.every((coluna) => this.passa(linha, coluna, filtros[coluna])),
    );
  }

  private passa(linha: T, coluna: C, valor: string): boolean {
    const config = this.mapa[coluna];
    // Coluna sem extrator (ex: `acoes`) nunca exclui uma linha
    if (!config) return true;

    const celula = FiltroTabela.normalizar(config.extrair(linha));
    const procurado = FiltroTabela.normalizar(valor);

    // O <select> só oferece valores que existem nos dados, por isso compara
    // exato. O <input> é escrita livre e compara por trecho.
    return config.tipo === "select"
      ? celula === procurado
      : celula.indexOf(procurado) !== -1;
  }

  private calcularOpcoes(linhas: T[]): OpcoesFiltro {
    const resultado: OpcoesFiltro = {};

    (Object.keys(this.mapa) as C[]).forEach((coluna) => {
      const config = this.mapa[coluna];
      if (!config || config.tipo !== "select") return;

      const distintos: string[] = [];
      linhas.forEach((linha) => {
        const valor = config.extrair(linha);
        if (valor && distintos.indexOf(valor) === -1) distintos.push(valor);
      });

      resultado[coluna] = distintos.sort((a, b) => a.localeCompare(b));
    });

    return resultado;
  }

  // Cópia rasa sem `spread`: o TypeScript 2.9 do projeto não sabe espalhar
  // um mapped type sobre um parâmetro genérico.
  private clonar(estado: EstadoFiltros): EstadoFiltros {
    const copia: EstadoFiltros = {};
    Object.keys(estado).forEach((c) => (copia[c] = estado[c]));
    return copia;
  }
}
