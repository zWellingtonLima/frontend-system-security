# Tabela Filtrada

Tabela de dados para Angular 6: colunas declaradas em TypeScript, filtro por
coluna em memória, células personalizadas por `ng-template`, e os estados de
_a carregar_ / _sem dados_ / _sem resultados_ já resolvidos.

---

## 1. Instalar

### 1.1. Copiar a pasta

Copia `tabela-filtrada/` para onde quiser

### 1.2. Importar o módulo

```ts
import { TabelaFiltradaModule } from "src/app/shared/tabela-filtrada";

@NgModule({
  imports: [CommonModule, TabelaFiltradaModule],
})
export class OMeuModule {}
```

O módulo só depende do `CommonModule`. **Não** precisa do `FormsModule`: a
linha de filtros usa `[value]` e `(input)`/`(change)` crus, sem `ngModel`.

### 1.3. Registar os estilos

Os estilos **não** são `styleUrls` de componente — são um arquivo global.
Escolhe uma das duas formas:

```scss
// no stylesheet global do projeto (ex: src/assets/sass/app.scss)
@import "../../app/shared/tabela-filtrada/styles/tabela";
```

```jsonc
// ou em angular.json → architect.build.options.styles
"styles": [
  "src/app/shared/tabela-filtrada/styles/tabela.scss"
]
```

> **Porque é que não são estilos de componente?**
> Metade das classes é escrita pela *página*, não pela tabela: o `classe` de
> uma coluna é uma string num `.ts`, e o markup de um `ng-template appCelula`
> é compilado na página. Estilo encapsulado num componente nunca alcança
> nenhum dos dois.

Todas as classes e variáveis SCSS levam o prefixo `tf-`/`$tf-`.

### 1.4. Ícones (opcional)

O template usa duas classes de ícone do **Feather**: `ft-search` (estado sem
resultados) e `ft-x-circle` (estado sem dados). Sem a font ainda funciona —
fica só sem ícone. Para os teres, inclui o `feather/style.css` nos `styles`.

---

## 2. Usar — passo a passo

O exemplo é a tabela de chaves emprestadas do projeto da Portaria.

### Passo 1 — Um ficheiro `algumaCoisa.colunas.ts` ao lado da página

Toda a definição da tabela vive aqui. A página não a repete.

```ts
// emprestadas.colunas.ts
import { MapaColunas } from "src/app/shared/tabela-filtrada";
import { ChaveViewModel } from "./models";

// As chaves das colunas. É este union que o TypeScript vai vigiar.
export type ColunaEmprestada =
  | "edificio"
  | "codigo"
  | "sala"
  | "nomeFuncionario"
  | "acoes";

// A ordem aqui dita a ordem em que as colunas aparecem na tabela.
export const COLUNAS_EMPRESTADAS: ColunaEmprestada[] = [
  "edificio",
  "codigo",
  "sala",
  "nomeFuncionario",
  "acoes",
];

export function criarColunasEmprestadas(
  datePipe: DatePipe,
): MapaColunas<ChaveViewModel, ColunaEmprestada> {
  return {
    edificio: {
      titulo: "Edifício",
      filtro: "select", // dropdown com os valores que existem nos dados
      texto: (chave) => chave.edificioLabel,
    },

    codigo: {
      titulo: "Chave / Código",
      filtro: "texto", // caixa de pesquisa por trecho
      classe: "tf-bold",
      texto: (chave) => chave.codigo,
    },

    // Desenhada pela página (ver Passo 3), mas o `texto` continua a servir
    // para o filtro encontrar a linha.
    sala: {
      titulo: "Sala / Piso",
      filtro: "texto",
      texto: (chave) =>
        chave.sala != null ? `Sala ${chave.sala} ${chave.pisoLabel}` : "",
    },

    nomeFuncionario: {
      titulo: "Com quem",
      filtro: "texto",
      classe: "tf-bold",
      texto: (chave) => chave.nomeFuncionario || "",
    },

    // Sem `filtro`: nunca exclui uma linha e a célula de filtro fica vazia.
    acoes: {
      titulo: "Ações",
      texto: () => "",
    },
  };
}
```

Regras que valem a pena decorar:

- **`texto` é o que se mostra E o que se filtra.** Uma coluna com `ng-template`
  próprio continua a precisar dele para ser filtrável.
- **Devolver `""`** faz a célula mostrar o traço de vazio (`—`).
- **`MapaColunas` obriga a cobrir todas as chaves do union.** Esquecer uma é
  erro de compilação.

### Passo 2 — Criar o modelo na página

```ts
import { of } from "rxjs";
import { ModeloTabela } from "src/app/shared/tabela-filtrada";

export class EmprestadasComponent {
  readonly modelo = new ModeloTabela<ChaveViewModel, ColunaEmprestada>(
    criarColunasEmprestadas(this.datePipe), // o mapa
    of(COLUNAS_EMPRESTADAS),                // que colunas estão visíveis
    this.service.emprestadas$,              // os dados
  );

  carregando$ = this.service.estaCarregandoDados$;

  // Identidade da linha, para o trackBy não recriar o DOM todo a cada
  // resposta do backend.
  idDaChave(chave: ChaveViewModel): number {
    return chave.id;
  }

  constructor(
    private service: EmprestimosService,
    private datePipe: DatePipe,
  ) {}
}
```

O segundo argumento é um **Observable** de propósito: se a página tiver tabs
que mostram conjuntos de colunas diferentes, emite outra lista e a tabela
acompanha. Um filtro numa coluna que desapareceu é esquecido sozinho — senão
ficava pendurado a esconder linhas sem o utilizador ter como o desfazer.

### Passo 3 — O template

```html
<app-tabela-filtrada
  [modelo]="modelo"
  [carregando]="carregando$ | async"
  [idDe]="idDaChave"
  textoCarregando="Carregando chaves..."
  mensagemVazia="Não existem empréstimos no momento."
>
  <!-- Coluna com markup próprio: `let-chave` é o objeto da linha -->
  <ng-template appCelula="sala" let-chave>
    <ng-container *ngIf="chave.sala != null; else semSala">
      Sala {{ chave.sala }}
      <span class="tf-sub">{{ chave.pisoLabel }}</span>
    </ng-container>
    <ng-template #semSala><span class="tf-dash">—</span></ng-template>
  </ng-template>

  <ng-template appCelula="acoes" let-chave>
    <div class="tf-acoes">
      <button type="button" (click)="devolver(chave)">Devolver</button>
    </div>
  </ng-template>
</app-tabela-filtrada>
```

As colunas sem `ng-template` não precisam de nada — mostram o `texto` que a
definição já calculou.

> **Não há `@Output` nenhum.** Um `ng-template` é compilado onde é
> **declarado**, não onde é renderizado: o `(click)` acima chama o
> `devolver()` da página diretamente.

---

## 3. Referência

### `<app-tabela-filtrada>`

| Input | Tipo | Omissão | O que faz |
|---|---|---|---|
| `modelo` | `ModeloTabela` | — | O modelo. Obrigatório. |
| `carregando` | `boolean` | `false` | Troca a tabela pelo spinner. |
| `idDe` | `(item) => any` | `null` | Identidade da linha para o `trackBy`. Sem isto usa o índice. |
| `mensagemVazia` | `string` | `"Não existem registos."` | Quando não há dados **de todo**. |
| `textoCarregando` | `string` | `"A carregar..."` | Legenda do spinner. |
| `classeTabela` | `string` | `""` | Classe extra no `<table>`, para um modificador teu. |

**Slot `[rodape]`** — `ng-content` livre por baixo da tabela, tipicamente para
paginação:

```html
<app-tabela-filtrada [modelo]="modelo">
  <app-paginacao rodape [paginador]="paginador"></app-paginacao>
</app-tabela-filtrada>
```

A paginação **não** faz parte deste pacote. O rodapé aceita qualquer markup.

### `DefinicaoColuna`

| Campo | Tipo | O que faz |
|---|---|---|
| `titulo` | `string` | Cabeçalho. Serve também de placeholder e `aria-label` do filtro. |
| `texto` | `(item) => string` | O que a célula mostra e o que se filtra. |
| `filtro` | `"texto" \| "select"` | Omitido = coluna não filtrável. |
| `classe` | `string` | Classe CSS na célula. |
| `largura` | `string` | Largura da coluna. Ver abaixo. |

`"texto"` compara por trecho; `"select"` compara exato e só oferece valores que
existem nos dados.

### Larguras de coluna

Por omissão as larguras seguem o conteúdo (`table-layout: auto`). Fica bonito
numa tabela parada, mas as colunas **saltam** sempre que um filtro muda o
número de linhas — e saltam muito quando os filtros não deixam passar nada,
porque deixa de haver conteúdo a dar-lhes largura.

Declarar `largura` resolve isso:

```ts
nomeFuncionario: {
  largura: "30%",   // a fatia maior: nomes têm comprimento imprevisível
  titulo: "Com quem",
  ...
}
```

Basta **uma** coluna declarar largura para a tabela inteira passar a
`table-layout: fixed`. A partir daí:

- As larguras deixam de depender do conteúdo — as colunas nunca mais saltam.
- Conteúdo maior que a coluna é cortado com reticências, em vez de esticar a
  coluna ou transbordar para a do lado.
- **`tf-col-flex`, `tf-col-tight` e `tf-col-num` deixam de influenciar a
  largura** dessa tabela. Quem manda são os valores declarados. (O
  alinhamento do `tf-col-num` e a quebra de linha do `tf-col-flex`
  continuam a valer.)

Percentagens que somem 100 são a forma mais previsível. Qualquer unidade de
CSS serve. Uma tabela que não declare largura nenhuma continua exatamente
como antes.

### `ModeloTabela`

| Membro | O que é |
|---|---|
| `linhas$` | Linhas decoradas e filtradas, prontas para o `*ngFor`. |
| `colunas$` | Colunas visíveis, já com título, tipo de filtro, valor ativo e opções. |
| `temAtivos$` | Há algum filtro ativo? Sai do mesmo stream debounced que as linhas. |
| `filtravel` | Alguma coluna declara `filtro`? Decide se a linha de filtros aparece. |
| `temLarguras` | Alguma coluna declara `largura`? Decide se a tabela fixa as larguras. |
| `setFiltro(coluna, valor)` | Define um filtro. Valor vazio remove-o. |
| `limpar()` | Remove todos os filtros. |

### Classes CSS que podes usar

Nas colunas (`classe:`) e dentro dos `ng-template`:

| Classe | Para quê |
|---|---|
| `tf-bold` | Célula principal da linha (código, nome). |
| `tf-sub` | Segunda linha dentro de uma célula (ex: o piso por baixo da sala). |
| `tf-dash` | O traço de célula sem valor. |
| `tf-acoes` | Wrapper dos botões de ação de uma célula. |
| `tf-col-flex` | **Uma** coluna por tabela: absorve o espaço que sobra. |
| `tf-col-tight` | Coluna que não quer espaço extra (números, botões, ícones). |
| `tf-col-num` | Coluna numérica: `tight` + alinhada à direita + dígitos de largura fixa. |

A tabela também põe `col-<chave>` em cada `<th>` e `<td>`, se precisares de
alcançar uma coluna específica a partir do teu CSS.

---

## 4. Como isto funciona por dentro

| Ficheiro | Papel |
|---|---|
| `tabela.model.ts` | Os contratos. Sem lógica. |
| `modelo-tabela.ts` | O motor: decorar, filtrar, calcular as opções dos `select`. **Não depende do Angular.** |
| `tabela-filtrada.component.*` | A tabela e os seus estados. |
| `celula-tabela.directive.ts` | O `appCelula`: marca um `ng-template` como o desenho de uma coluna. |
| `filtros-coluna.component.*` | A linha `<tr>` de filtros. Interno — não é exportado. |
| `styles/_tokens.scss` | Cores, espaçamento e geometria, como `$tf-*`. É aqui que se muda o aspeto. |
| `styles/tabela.scss` | Todo o CSS. Ponto de entrada. |

Notas de desenho que explicam decisões que parecem estranhas:

- **A filtragem entre colunas é AND** — uma linha só passa se satisfizer todos
  os filtros ativos.
- **As opções dos `select` derivam das linhas SEM filtro.** Se derivassem das
  filtradas, escolher "Edifício A" apagava "Edifício B" da lista e não havia
  como voltar atrás.
- **As linhas têm `debounceTime(150)`, o valor dos campos não.** O que se
  escreve tem de voltar ao `<input>` no mesmo instante; a lista pode esperar.
- **Mas o `temAtivos$` acompanha as linhas, não os campos.** A tabela decide
  com os dois ao mesmo tempo (`linhas.length > 0 || temFiltros`). Se o
  `temAtivos$` saísse do estado imediato, limpar o último filtro punha-o a
  `false` enquanto as linhas ainda eram as 0 da filtragem anterior — a tabela
  inteira era destruída durante 150 ms e o `<input>` onde se estava a escrever
  perdia o foco.
- **Com filtros ativos a tabela fica de pé mesmo sem linhas.** O utilizador
  precisa de chegar aos campos para desfazer o filtro — por isso o "sem
  resultados" é uma linha *dentro* da tabela, e não o estado de vazio.
- **`publishReplay(1) + refCount()`, não `shareReplay`.** O `refCount` larga a
  fonte quando sai o último subscritor; um service `root` sobrevive à página e
  sem isto ficava pendurado.
- **O `ng-content` do rodapé está fora dos `*ngIf`.** Um `ng-content` dentro de
  um ramo condicional perde o conteúdo projetado quando o ramo é destruído.

---
