// Contratos da filtragem client-side de tabelas.
//
// A ideia: cada tabela declara, por coluna, como extrair o texto pesquisável
// dessa linha. O filtro nunca sabe o que é uma chave ou uma ocorrência — só
// sabe comparar strings.

// Como o filtro daquela coluna é apresentado ao utilizador.
// `select` só faz sentido em colunas de domínio fechado (edifício, estado):
// as opções são calculadas a partir dos próprios dados carregados.
export type TipoFiltro = "texto" | "select";

export interface ColunaFiltravel<T> {
  // Texto pesquisável da célula. Deve devolver o MESMO que o template mostra,
  // senão o utilizador escreve o que vê e não encontra nada.
  extrair: (item: T) => string;
  tipo: TipoFiltro;
}

// Mapped type sobre o union de colunas: obriga a cobrir TODAS em tempo de
// compilação. Esquecer uma coluna é erro de build, não uma coluna que
// silenciosamente não filtra.
// `null` = coluna não filtrável (ex: `acoes`) — decisão explícita e tipada.
export type MapaColunas<T, C extends string> = { [K in C]: ColunaFiltravel<T> | null };

// Valor escrito/escolhido em cada coluna. Coluna ausente = sem filtro ativo.
//
// Indexado por `string` e não pelo union de colunas de propósito: o
// TypeScript 2.9 do projeto não consegue escrever num indexed access sobre um
// mapped type genérico (`Record<C, string>[C]`). A tipagem forte fica onde
// conta — em `MapaColunas` (exaustividade) e em `setFiltro(coluna: C, ...)`,
// por onde passa toda a escrita.
export interface EstadoFiltros {
  [coluna: string]: string;
}

// Valores distintos por coluna, para preencher os <select>.
export interface OpcoesFiltro {
  [coluna: string]: string[];
}
