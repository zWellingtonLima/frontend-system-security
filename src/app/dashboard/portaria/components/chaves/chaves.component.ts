import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChaveService } from "../../services/api/chave.service";
import { ChavesTabConfig } from "../../models/enums";
import { ChaveViewModel, GrupoChaves } from "../../models/api";

// Mensagens de `required` por campo. O texto genérico serve de fallback.
const MENSAGENS_OBRIGATORIO: Record<string, string> = {
  pessoa: "Indique quem está a levar a chave.",
  funcionario: "Indique o funcionário responsável pelo empréstimo.",
  devolvidaPor: "Indique quem está a devolver a chave.",
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

  // FILTROS E TABS
  tabs = this.service.tabs;
  tabAtiva$ = this.service.tabAtiva$;
  totalEmprestadas$ = this.service.totalEmprestadas$;

  chaves$ = this.service.chavesList$;
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

    this.emprestarForm = this.fb.group({
      idChave: [null, [Validators.required]],
      pessoa: ["", [Validators.required, Validators.minLength(3)]],
    });

    this.atualizarForm = this.fb.group({
      idChave: [null, [Validators.required]],
      funcionario: ["", [Validators.required, Validators.minLength(3)]],
      devolvidaPor: ["", [Validators.required, Validators.minLength(3)]],
    });
  }

  onTabChange(tab: ChavesTabConfig): void {
    this.service.setTab(tab);
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
    this.emprestarForm.reset({ idChave: null, pessoa: "" });
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
    if (!this.validarCampos(this.emprestarForm, ["idChave", "pessoa"])) return;

    const { idChave, pessoa } = this.emprestarForm.value;

    this.service
      .emprestarChave({ idChave, funcionario: pessoa })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalEmprestar();
      });
  }

  // =========================================
  // ========== MODAL ATUALIZAR ==============

  abrirModalAtualizar(chave: ChaveViewModel): void {
    this.chaveEmEdicao = chave;

    this.atualizarForm.reset({
      idChave: chave.id,
      funcionario: chave.pessoa || "",
      devolvidaPor: chave.pessoa || "",
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

    if (!this.validarCampos(this.atualizarForm, ["idChave", "funcionario"]))
      return;

    const { idChave, funcionario } = this.atualizarForm.value;

    this.service
      .atualizarEmprestimo(idEmprestimo, { idChave, funcionario })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalAtualizar();
      });
  }

  // Regista a devolução da chave em nome de quem está no campo `devolvidaPor`.
  onDevolver(): void {
    const idEmprestimo = this.chaveEmEdicao && this.chaveEmEdicao.idEmprestimo;
    if (idEmprestimo === null || idEmprestimo === undefined) return;

    if (!this.validarCampos(this.atualizarForm, ["devolvidaPor"])) return;

    this.service
      .devolverChave(idEmprestimo, this.atualizarForm.value.devolvidaPor)
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalAtualizar();
      });
  }

  devolverRapido(chave: ChaveViewModel): void {
    if (chave.idEmprestimo === null || !chave.pessoa) return;

    this.service
      .devolverChave(chave.idEmprestimo, chave.pessoa)
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

  trackById(_: number, chave: { id: number }) {
    return chave.id;
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
