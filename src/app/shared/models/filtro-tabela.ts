// Contratos da filtragem client-side de tabelas.
//
// A ideia: cada tabela declara, por coluna, o texto que essa célula mostra.
// Esse mesmo texto é o que se filtra.
export type TipoFiltro = "texto" | "select";

export interface DefinicaoColuna<T> {
  // Cabeçalho da coluna. Serve também de placeholder e aria-label do filtro.
  titulo: string;

  // O conteúdo da célula em texto. É o que se mostra E o que se filtra.
  // Devolver "" faz a célula cair no placeholder de vazio.
  texto: (item: T) => string;

  // Omitido = coluna não filtrável (ex: `acoes`) — decisão explícita.
  filtro?: TipoFiltro;

  // Classe CSS aplicada à célula desta coluna
  classe?: string;

  // `true` = o template da página desenha esta célula (badges, botões etc,
  // markup próprio). O `texto` continua a existir, mas só para filtrar.
  personalizada?: boolean;
}

// Mapped type sobre o union de colunas: obriga a cobrir TODAS em tempo de
// compilação. Esquecer uma coluna é erro de build e o TS acusa.
export type MapaColunas<T, C extends string> = {
  [K in C]: DefinicaoColuna<T>;
};

export interface LinhaTabela<T> {
  // O objeto original, para as células personalizadas do template
  item: T;

  // Texto por coluna, indexado pela chave da coluna
  celulas: { [coluna: string]: string };
}

// O que o template precisa de saber sobre uma coluna visível, já resolvido.
export interface ColunaVM {
  chave: string;
  titulo: string;
  // `null` = não filtrável; a célula da linha de filtros fica vazia
  filtro: TipoFiltro | null;
  personalizada: boolean;
  // Classe CSS da célula. "" quando a coluna não declara nenhuma.
  classe: string;
  // Valor ativo do filtro desta coluna ("" = sem filtro)
  valor: string;
  // Opções do <select>. Vazio nas colunas que não são `select`.
  opcoes: string[];
}
