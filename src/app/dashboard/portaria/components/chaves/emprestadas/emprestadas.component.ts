import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { of, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ErrosForm } from "src/app/shared/utils/erros-form";
import { ModeloTabela } from "src/app/shared/tabela-filtrada";
import { ChaveViewModel } from "../../../models/api";
import {
  ColunaEmprestada,
  COLUNAS_EMPRESTADAS,
  criarColunasEmprestadas,
} from "./emprestadas.colunas";
import { EmprestimosService } from "../../../services/api/chaves/emprestimos.service";

const MENSAGENS_OBRIGATORIO = {
  idChave: "Selecione a chave do empréstimo.",
  idFuncionarioEmprestimo: "Selecione na lista o funcionário do empréstimo.",
  idDevolvidaPor: "Selecione na lista quem está a devolver a chave.",
};

type SecaoModal = "EDICAO" | "DEVOLUCAO";

const SECOES_MODAL: { value: SecaoModal; label: string }[] = [
  { value: "DEVOLUCAO", label: "Devolver chave" },
  { value: "EDICAO", label: "Editar empréstimo" },
];

@Component({
  selector: "app-emprestadas",
  templateUrl: "./emprestadas.component.html",
  styleUrls: ["./emprestadas.component.scss"],
})
export class EmprestadasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private erros = new ErrosForm(MENSAGENS_OBRIGATORIO);

  readonly modelo = new ModeloTabela<ChaveViewModel, ColunaEmprestada>(
    criarColunasEmprestadas(this.datePipe),
    of(COLUNAS_EMPRESTADAS),
    this.service.emprestadas$,
  );

  carregando$ = this.service.estaCarregandoDados$; // Loader GET
  salvando$ = this.service.estaSalvando$; // Loader PUT/POST
  opcoesEdicao$ = this.service.opcoesEdicao$;

  // MODAL ATUALIZAR / DEVOLVER
  atualizarModalIsOpen = false;
  atualizarForm!: FormGroup;

  secoes = SECOES_MODAL;
  secaoAtiva: SecaoModal = "EDICAO";

  // Chave do empréstimo aberto no modal. Os dados de contexto (edifício,
  // código, sala, desde) são só leitura e vêm daqui
  chaveEmEdicao: ChaveViewModel | null = null;

  constructor(
    private service: EmprestimosService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.service.carregarEmprestadas();

    this.atualizarForm = this.fb.group({
      idChave: [null, [Validators.required]],
      idFuncionarioEmprestimo: [null, [Validators.required]],
      idDevolvidaPor: [null, [Validators.required]],
    });
  }

  // A tabela usa isto no trackBy para não recriar as linhas todas
  idDaChave(chave: ChaveViewModel): number {
    return chave.id;
  }

  // =========================================
  // ========== MODAL ATUALIZAR ==============

  abrirModalAtualizar(chave: ChaveViewModel): void {
    this.chaveEmEdicao = chave;
    this.secaoAtiva = "DEVOLUCAO";

    // Por padrão assume-se que devolve quem levou
    this.atualizarForm.reset({
      idChave: chave.id,
      idFuncionarioEmprestimo: chave.idRH,
      idDevolvidaPor: chave.idRH,
    });
    this.erros.limpar(this.atualizarForm);

    this.service.carregarOpcoesEdicao(chave);
    this.atualizarModalIsOpen = true;
  }

  fecharModalAtualizar(): void {
    this.atualizarModalIsOpen = false;
    this.chaveEmEdicao = null;
  }

  onSecaoChange(secao: SecaoModal): void {
    this.secaoAtiva = secao;
  }

  onGuardarAlteracoes(): void {
    const idEmprestimo = this.idEmprestimoEmEdicao();
    if (idEmprestimo === null) return;

    if (
      !this.erros.validar(this.atualizarForm, [
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
        idRH: idFuncionarioEmprestimo,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalAtualizar();
      });
  }

  // Regista a devolução em nome de quem está no campo `idDevolvidaPor`.
  onDevolver(): void {
    const idEmprestimo = this.idEmprestimoEmEdicao();
    if (idEmprestimo === null) return;

    if (!this.erros.validar(this.atualizarForm, ["idDevolvidaPor"])) return;

    this.service
      .devolverChave(idEmprestimo, {
        idRH: this.atualizarForm.value.idDevolvidaPor,
        idChave: this.atualizarForm.value.idChave,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalAtualizar();
      });
  }

  // Devolve em nome de quem levou, sem abrir o modal
  devolverRapido(chave: ChaveViewModel): void {
    if (chave.idEmprestimo === null || !chave.nomeFuncionario) return;

    this.service
      .devolverRapidoChave(chave.idEmprestimo)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  erroDoCampo(form: FormGroup, nome: string): string | null {
    return this.erros.erro(form, nome);
  }

  private idEmprestimoEmEdicao(): number | null {
    if (!this.chaveEmEdicao) return null;
    return this.chaveEmEdicao.idEmprestimo;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
