import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import {
  debounceTime,
  map,
  publishReplay,
  refCount,
  startWith,
  tap,
} from "rxjs/operators";
import { ColunaVM, LinhaTabela, MapaColunas } from "./tabela.model";

// Referência estável para colunas sem opções
const SEM_OPCOES: string[] = [];

// Valor escrito/escolhido em cada coluna. Coluna ausente = sem filtro ativo.
interface EstadoFiltros {
  [coluna: string]: string;
}

interface OpcoesFiltro {
  [coluna: string]: string[];
}

/**
 * O modelo de uma tabela: que colunas tem, que texto mostra cada célula e,
 * se a tabela filtrar em memória, que filtros estão ativos.
 *
 * A filtragem por coluna é AND — uma linha só passa se satisfizer TODOS os
 * filtros ativos. Uma tabela cujas colunas não declarem `filtro` nenhum
 * (porque filtra no backend, ou não filtra de todo) usa isto na mesma: o
 * filtro fica inerte e sobra o que qualquer tabela precisa, que é saber as
 * colunas e transformar as linhas em texto.
 *
 * Não depende de Angular. Recebe as colunas visíveis e as linhas cruas,
 * devolve as linhas decoradas (`linhas$`) e a descrição das colunas para o
 * template (`colunas$`).
 *
 * @example
 * modelo = new ModeloTabela(COLUNAS, this.colunasVisiveis$, this.dados$);
 *
 * @see MapaColunas
 */
export class ModeloTabela<T, C extends string> {
  private filtros = new BehaviorSubject<EstadoFiltros>({});
  private filtros$ = this.filtros.asObservable();

  /** Linhas decoradas e filtradas, prontas para o `*ngFor` da tabela. */
  readonly linhas$: Observable<LinhaTabela<T>[]>;

  /**
   * Colunas visíveis, na ordem em que a tabela as mostra, já com título,
   * tipo de filtro, valor ativo e opções resolvidos.
   */
  readonly colunas$: Observable<ColunaVM[]>;

  /** Distingue "não há dados" de "os filtros não deixaram passar nada". */
  // Sai do MESMO stream debounced que as linhas, de propósito. Se saísse do
  // estado imediato, limpar o último filtro punha-o a `false` enquanto as
  // linhas ainda eram as 0 da filtragem anterior — e o `*ngIf` da tabela,
  // que lê os dois, destruía a tabela inteira durante 150ms. A linha de
  // filtros ia atrás e o `<input>` onde se estava a escrever perdia o foco.
  readonly temAtivos$: Observable<boolean>;

  /**
   * Alguma coluna declara filtro? É o que decide se a tabela desenha a linha
   * de filtros — ninguém tem de a ligar ou desligar à mão.
   */
  readonly filtravel: boolean;

  /**
   * Alguma coluna declara largura? Decide se a tabela fixa as larguras em
   * vez de as deixar seguir o conteúdo.
   */
  readonly temLarguras: boolean;

  /**
   * @param mapa As definições de todas as colunas da tabela.
   * @param colunasVisiveis$ Quais mostrar, e por que ordem. Trocar de tab
   * troca este conjunto e os filtros das colunas que saírem são esquecidos.
   * @param fonte$ As linhas cruas, tipicamente um observable do service.
   */
  constructor(
    private mapa: MapaColunas<T, C>,
    colunasVisiveis$: Observable<C[]>,
    fonte$: Observable<T[]>,
  ) {
    this.filtravel = this.colunasDoMapa().some((c) => !!this.mapa[c].filtro);
    this.temLarguras = this.colunasDoMapa().some((c) => !!this.mapa[c].largura);

    //   publishReplay(1) - uma só subscrição à fonte, partilhada; o buffer serve quem subscreve depois (senão os <select> nasciam vazios).
    //   refCount() - larga a fonte quando sai o último subscritor. O service é `root` e sobrevive à página; sem isto ficava pendurado.
    // Não `shareReplay` porque nunca larga a fonte.
    const decoradas$ = fonte$.pipe(
      map((linhas) => linhas.map((item) => this.decorar(item))),
      publishReplay(1),
      refCount(),
    );

    // Trocar de tab troca o conjunto de colunas. Um filtro numa coluna que
    // deixou de estar visível ficaria pendurado a esconder linhas sem que o
    // utilizador tivesse como o desfazer.
    const visiveis$ = colunasVisiveis$.pipe(
      tap((colunas) => this.esquecerOcultas(colunas)),
      publishReplay(1),
      refCount(),
    );

    // `startWith` é obrigatório: o `debounceTime` seguraria a primeira
    // emissão do BehaviorSubject 150ms e a tabela nasceria vazia a piscar.
    //
    // Partilhado (`publishReplay + refCount`) porque tem DOIS consumidores —
    // as linhas e o `temAtivos$` — e a tabela decide com os dois ao mesmo
    // tempo. Sem partilhar, cada um corria o seu debounce e podiam
    // discordar; partilhado, emitem os dois na mesma cascata.
    const filtrosEstaveis$ = this.filtros$.pipe(
      debounceTime(150),
      startWith({} as EstadoFiltros),
      publishReplay(1),
      refCount(),
    );

    this.linhas$ = combineLatest(decoradas$, filtrosEstaveis$).pipe(
      map(([linhas, filtros]) => this.filtrar(linhas, filtros)),
    );

    this.temAtivos$ = filtrosEstaveis$.pipe(
      map((filtros) => Object.keys(filtros).length > 0),
    );

    // As opções dos <select> derivam das linhas SEM filtro: se derivassem
    // das filtradas, escolher "Edifício A" apagaria "Edifício B" da lista e
    // não haveria como voltar atrás.
    const opcoes$ = decoradas$.pipe(
      map((linhas) => this.calcularOpcoes(linhas)),
    );

    // Sem debounce, ao contrário das linhas: o valor escrito tem de voltar
    // ao <input> no mesmo instante em que é escrito.
    this.colunas$ = combineLatest(visiveis$, this.filtros$, opcoes$).pipe(
      map(([visiveis, filtros, opcoes]) =>
        visiveis.map((coluna) => this.toVM(coluna, filtros, opcoes)),
      ),
    );
  }

  /**
   * Define o filtro de uma coluna. Valor vazio remove-o em vez de guardar
   * `""` — mantém o estado limpo e o `temAtivos$` honesto.
   */
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

  /** Desfaz todos os filtros de uma vez. */
  limpar(): void {
    if (Object.keys(this.filtros.value).length === 0) return;
    this.filtros.next({});
  }

  /**
   * Minúsculas e sem acentos, para comparar filtro com célula.
   *
   * Acentos separados do caractere base (NFD) e removidos: "edificio"
   * escrito no filtro passa a encontrar "Edifício" na célula.
   */
  static normalizar(texto: string): string {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private decorar(item: T): LinhaTabela<T> {
    const celulas: { [coluna: string]: string } = {};

    this.colunasDoMapa().forEach((coluna) => {
      celulas[coluna] = this.mapa[coluna].texto(item) || "";
    });

    return { item, celulas };
  }

  private filtrar(
    linhas: LinhaTabela<T>[],
    filtros: EstadoFiltros,
  ): LinhaTabela<T>[] {
    const ativos = Object.keys(filtros).filter((coluna) => !!filtros[coluna]);
    if (ativos.length === 0) return linhas;

    return linhas.filter((linha) =>
      ativos.every((coluna) => this.passa(linha, coluna, filtros[coluna])),
    );
  }

  private passa(linha: LinhaTabela<T>, coluna: string, valor: string): boolean {
    const definicao = this.mapa[coluna as C];
    // Coluna sem filtro declarado (ex: `acoes`) nunca exclui uma linha
    if (!definicao || !definicao.filtro) return true;

    const celula = ModeloTabela.normalizar(linha.celulas[coluna]);
    const procurado = ModeloTabela.normalizar(valor);

    // O <select> só oferece valores que existem nos dados, por isso compara
    // exato. O <input> é escrita livre e compara por trecho.
    return definicao.filtro === "select"
      ? celula === procurado
      : celula.indexOf(procurado) !== -1;
  }

  // Valores distintos por coluna, para preencher os <select>
  private calcularOpcoes(linhas: LinhaTabela<T>[]): OpcoesFiltro {
    const resultado: OpcoesFiltro = {};

    this.colunasDoMapa().forEach((coluna) => {
      if (this.mapa[coluna].filtro !== "select") return;

      const distintos: string[] = [];
      linhas.forEach((linha) => {
        const valor = linha.celulas[coluna];
        if (valor && distintos.indexOf(valor) === -1) distintos.push(valor);
      });

      resultado[coluna] = distintos.sort((a, b) => a.localeCompare(b));
    });

    return resultado;
  }

  private toVM(
    coluna: C,
    filtros: EstadoFiltros,
    opcoes: OpcoesFiltro,
  ): ColunaVM {
    const definicao = this.mapa[coluna];

    return {
      chave: coluna,
      titulo: definicao.titulo,
      filtro: definicao.filtro || null,
      classe: definicao.classe || "",
      largura: definicao.largura || "",
      valor: filtros[coluna] || "",
      opcoes: opcoes[coluna] || SEM_OPCOES,
    };
  }

  private esquecerOcultas(visiveis: C[]): void {
    const atuais = this.filtros.value;
    const orfaos = Object.keys(atuais).filter(
      (coluna) => visiveis.indexOf(coluna as C) === -1,
    );
    if (orfaos.length === 0) return;

    const proximos = this.clonar(atuais);
    orfaos.forEach((coluna) => delete proximos[coluna]);
    this.filtros.next(proximos);
  }

  private colunasDoMapa(): C[] {
    return Object.keys(this.mapa) as C[];
  }

  
  // um mapped type sobre um parâmetro genérico.
  private clonar(estado: EstadoFiltros): EstadoFiltros {
    const copia: EstadoFiltros = {};
    Object.keys(estado).forEach((c) => (copia[c] = estado[c]));
    return copia;
  }
}
