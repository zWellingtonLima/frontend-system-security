import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LocalDataSource } from "ng2-smart-table";
import { ChaveService } from "../../services/api/chave.service";
import {
  ChavesTabConfig,
  COLUNA_TITULO,
  ColunaChave,
  STATUS_CHAVE_CONFIG,
  StatusChaveEnumType,
} from "../../models/enums";
import { ChaveViewModel, GrupoChaves } from "../../models/api";
import { EstadoCellComponent } from "./celulas/estado-cell.component";
import {
  AcoesCellComponent,
  PedidoAcaoChave,
} from "./celulas/acoes-cell.component";

// Forma do `settings` do ng2-smart-table, na medida do que esta página usa.
// Reconstruída à mão porque a lib não exporta tipo nenhum para isto.
interface ConfiguracaoColuna {
  title: string;
  type?: string;
  // A lib espera a classe do componente; não há tipo melhor que `Function`
  // sem depender de APIs internas dela.
  renderComponent?: Function;
  onComponentInitFunction?: (instance: any) => void;
  filter?: boolean | { type: string; config?: object };
  sort?: boolean;
}

interface ConfiguracaoTabela {
  columns: Record<string, ConfiguracaoColuna>;
  actions?: boolean;
  hideSubHeader?: boolean;
  pager?: { display: boolean; perPage?: number };
  noDataMessage?: string;
}

// A lib lê `linha[chave]` para obter o valor da célula, por isso a coluna
// lógica tem de ser traduzida no campo real do ViewModel.
const CAMPO_POR_COLUNA: Record<ColunaChave, string> = {
  edificio: "edificioLabel",
  codigo: "codigo",
  sala: "salaLabel",
  estado: "status",
  desde: "desdeLabel",
  nomeFuncionario: "nomeFuncionario",
  // Não corresponde a campo nenhum: existe só para a lib desenhar a coluna
  acoes: "acoes",
};

// Mensagens de `required` por campo. O texto genérico serve de fallback.
const MENSAGENS_OBRIGATORIO: Record<string, string> = {
  idFuncionario: "Selecione na lista quem está a levar a chave.",
  idFuncionarioEmprestimo: "Selecione na lista o funcionário do empréstimo.",
  idDevolvidaPor: "Selecione na lista quem está a devolver a chave.",
  idChave: "Selecione a chave do empréstimo.",
};

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Campos por onde já passou uma tentativa de submissão do form
  private camposTentados = new Map<FormGroup, Set<string>>();

  // MODAIS
  emprestarModalIsOpen: boolean = false;
  atualizarModalIsOpen: boolean = false;
  emprestarForm!: FormGroup;
  atualizarForm!: FormGroup;

  // Chave do empréstimo aberto no modal de atualização. Os dados do contexto como
  // (edifício, código, sala, desde) são só leitura e vêm daqui
  chaveEmEdicao: ChaveViewModel | null = null;

  // TABELA (ng2-smart-table)
  // O `settings` não tem tipo exportado pela lib — o @Input dela é `Object`.
  // A interface abaixo é escrita à mão e NÃO é validada contra a lib: um
  // erro de nome de propriedade só aparece em runtime, sem aviso.
  source = new LocalDataSource();
  settings: ConfiguracaoTabela = { columns: {} };

  // FILTROS E TABS
  tabs = this.service.tabs;
  tabAtiva$ = this.service.tabAtiva$;
  totalEmprestadas$ = this.service.totalEmprestadas$;

  chaves$ = this.service.chavesInventario$;
  emprestadas$ = this.service.emprestadas$;
  carregando$ = this.service.estaCarregandoDados$; // Loader GET
  salvando$ = this.service.estaSalvando$; // Loader PUT/POST

  // MODAL EMPRESTAR
  chavesDisponiveis$ = this.service.chavesDisponiveisList$;
  carregandoDisponiveis$ = this.service.estaCarregandoDisponiveis$;

  // MODAL ATUALIZAR
  opcoesEdicao$ = this.service.opcoesEdicao$;

  paginacao$ = this.service.paginacao$;

  constructor(
    private service: ChaveService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.service.inicializar();

    // Os campos de pessoa guardam o idRH escolhido no autocomplete, não o
    // nome escrito — por isso `required` basta, sem minLength de texto.
    this.emprestarForm = this.fb.group({
      idChave: [null, [Validators.required]],
      idFuncionario: [null, [Validators.required]],
    });

    this.atualizarForm = this.fb.group({
      idChave: [null, [Validators.required]],
      // Quem levou a chave — corrigível aqui em caso de engano do segurança
      idFuncionarioEmprestimo: [null, [Validators.required]],
      // Quem devolve, que pode ser outra pessoa
      idDevolvidaPor: [null, [Validators.required]],
    });

    // A lib não aceita um Observable: é preciso empurrar os dados para o
    // LocalDataSource a cada emissão.
    this.service.linhas$
      .pipe(takeUntil(this.destroy$))
      .subscribe((linhas) => this.source.load(linhas));

    // As colunas mudam entre tabs e a lib só relê o `settings` quando a
    // REFERÊNCIA do objeto muda — mutar `settings.columns` não faz nada.
    this.service.tabAtiva$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tab) => (this.settings = this.construirSettings(tab)));
  }

  onTabChange(tab: ChavesTabConfig): void {
    this.service.setTab(tab);
  }

  // =========================================
  // ============ TABELA =====================

  private construirSettings(tab: ChavesTabConfig): ConfiguracaoTabela {
    const columns: Record<string, ConfiguracaoColuna> = {};
    tab.colunas.forEach((coluna) => {
      columns[CAMPO_POR_COLUNA[coluna]] = this.configurarColuna(coluna);
    });

    return {
      columns,
      // A coluna de ações da lib não permite `[disabled]`, por isso está
      // desligada e as ações vivem numa célula custom.
      actions: false,
      // Os filtros da lib são client-side: em INVENTARIO só veriam a página
      // atual devolvida pelo backend, por isso ficam escondidos nessa tab.
      hideSubHeader: tab.value !== "EMPRESTADAS",
      // A paginação de INVENTARIO continua a ser a do backend, feita à mão
      // no template. O pager da lib pagina por cima e duplicaria o controlo.
      pager: { display: false },
      noDataMessage: "Não existem empréstimos no momento.",
    };
  }

  private configurarColuna(coluna: ColunaChave): ConfiguracaoColuna {
    const title = COLUNA_TITULO[coluna];

    if (coluna === "acoes")
      return {
        title,
        type: "custom",
        renderComponent: AcoesCellComponent,
        // Único ponto de ligação de volta ao componente-pai que a lib oferece
        onComponentInitFunction: (instance: AcoesCellComponent) =>
          instance.acao.subscribe((pedido: PedidoAcaoChave) =>
            this.onAcaoLinha(pedido),
          ),
        filter: false,
        sort: false,
      };

    if (coluna === "estado")
      return {
        title,
        type: "custom",
        renderComponent: EstadoCellComponent,
        // Filtro de lista sai de graça na lib. Compara contra o valor cru
        // (`status`), por isso os `value` são os do enum e não os rótulos.
        filter: {
          type: "list",
          config: {
            selectText: "Todos",
            list: Object.keys(STATUS_CHAVE_CONFIG).map((estado) => ({
              value: estado,
              title: STATUS_CHAVE_CONFIG[estado as StatusChaveEnumType].label,
            })),
          },
        },
      };

    return { title };
  }

  private onAcaoLinha(pedido: PedidoAcaoChave): void {
    if (pedido.acao === "atualizar") this.abrirModalAtualizar(pedido.chave);
    else this.devolverRapido(pedido.chave);
  }

  // Setas anterior/seguinte - recebe a página de destino (0-based)
  onPageChange(pagina: number) {
    this.service.setPagina(pagina);
  }

  // Botões numerados - converte a página exibida (1-based) para 0-based
  irParaPagina(p: number | "...") {
    if (typeof p !== "number") return;
    this.service.setPagina(p - 1);
  }

  // =========================================
  // ========== MODAL EMPRESTAR ==============

  abrirModalEmprestar(): void {
    this.emprestarForm.reset({ idChave: null, idFuncionario: null });
    this.limparTentativas(this.emprestarForm);
    this.service.carregarDisponiveis();
    this.emprestarModalIsOpen = true;
  }

  fecharModalEmprestar(): void {
    this.emprestarModalIsOpen = false;
  }

  // Há um <select> por edifício mas só um empréstimo: todos escrevem na mesma
  // variável de controle idChave
  onEscolherChave(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;

    this.emprestarForm.get("idChave")!.setValue(valor ? Number(valor) : null);
  }

  // Valor a exibir no select deste edifício: vazio se a chave escolhida
  // pertence a outro edifício.
  valorSelecionadoEm(grupo: GrupoChaves): string {
    const idChave = this.emprestarForm.get("idChave")!.value;
    const pertence = grupo.chaves.some((c) => c.id === idChave);

    return pertence ? String(idChave) : "";
  }

  onEmprestar(): void {
    if (!this.validarCampos(this.emprestarForm, ["idChave", "idFuncionario"]))
      return;

    const { idChave, idFuncionario } = this.emprestarForm.value;

    this.service
      .emprestarChave({ idChave, devolvidaPorIdRH: idFuncionario })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalEmprestar();
      });
  }

  // =========================================
  // ========== MODAL ATUALIZAR ==============

  abrirModalAtualizar(chave: ChaveViewModel): void {
    this.chaveEmEdicao = chave;

    // Por defeito assume-se que devolve quem levou; o segurança altera o
    // campo se for outra pessoa a entregar.
    this.atualizarForm.reset({
      idChave: chave.id,
      idFuncionarioEmprestimo: chave.idRH,
      idDevolvidaPor: chave.idRH,
    });
    this.limparTentativas(this.atualizarForm);

    this.service.carregarOpcoesEdicao(chave);
    this.atualizarModalIsOpen = true;
  }

  fecharModalAtualizar(): void {
    this.atualizarModalIsOpen = false;
    this.chaveEmEdicao = null;
  }

  onGuardarAlteracoes(): void {
    const idEmprestimo = this.chaveEmEdicao && this.chaveEmEdicao.idEmprestimo;
    if (idEmprestimo === null || idEmprestimo === undefined) return;

    if (
      !this.validarCampos(this.atualizarForm, [
        "idChave",
        "idFuncionarioEmprestimo",
      ])
    )
      return;

    // Corrigir o empréstimo é corrigir a quem a chave foi entregue, por isso
    // o que segue é o funcionário do empréstimo, não quem devolve.
    const { idChave, idFuncionarioEmprestimo } = this.atualizarForm.value;

    this.service
      .atualizarEmprestimo(idEmprestimo, {
        idChave,
        devolvidaPorIdRH: idFuncionarioEmprestimo,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalAtualizar();
      });
  }

  // Regista a devolução da chave em nome de quem está no campo `idDevolvidaPor`.
  onDevolver(): void {
    const idEmprestimo = this.chaveEmEdicao && this.chaveEmEdicao.idEmprestimo;
    if (idEmprestimo === null || idEmprestimo === undefined) return;

    if (!this.validarCampos(this.atualizarForm, ["idDevolvidaPor"])) return;

    this.service
      .devolverChave(idEmprestimo, {
        devolvidaPorIdRH: this.atualizarForm.value.idDevolvidaPor,
        idChave: this.atualizarForm.value.idChave,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalAtualizar();
      });
  }

  devolverChaveNormal(chave: ChaveViewModel): void {
    if (chave.idEmprestimo === null || !chave.nomeFuncionario || !chave.idRH)
      return; // TODO: organizar as informações e idRH

    this.service
      .devolverChave(chave.idEmprestimo, {
        devolvidaPorIdRH: chave.idRH, // «««««««««« ALTERAR PARA IDRH
        idChave: chave.id,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  devolverRapido(chave: ChaveViewModel): void {
    if (chave.idEmprestimo === null || !chave.nomeFuncionario) return;

    this.service
      .devolverRapidoChave(chave.idEmprestimo)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  // =========================================
  // ============= VALIDAÇÃO ===============

  erroDoCampo(form: FormGroup, nome: string): string | null {
    const campo = form.get(nome);
    if (!campo || !campo.errors || !this.foiTentado(form, nome)) return null;

    if (campo.errors["required"])
      return MENSAGENS_OBRIGATORIO[nome] || "Campo obrigatório.";

    if (campo.errors["minlength"])
      return `Mínimo de ${campo.errors["minlength"].requiredLength} caracteres.`;

    return "Valor inválido.";
  }

  private validarCampos(form: FormGroup, nomes: string[]): boolean {
    const tentados = this.camposTentados.get(form) || new Set<string>();
    nomes.forEach((nome) => tentados.add(nome));
    this.camposTentados.set(form, tentados);

    const campos = nomes
      .map((nome) => form.get(nome))
      .filter((campo): campo is AbstractControl => campo !== null);

    return campos.every((campo) => campo.valid);
  }

  private foiTentado(form: FormGroup, nome: string): boolean {
    const tentados = this.camposTentados.get(form);
    return !!tentados && tentados.has(nome);
  }

  private limparTentativas(form: FormGroup): void {
    this.camposTentados.delete(form);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
