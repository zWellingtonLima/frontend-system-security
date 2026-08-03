import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ErrosForm } from "src/app/shared/utils/erros-form";
import { GrupoChaves } from "../../models/api";
import { EmprestimosService } from "../../services/api/chaves/emprestimos.service";

const MENSAGENS_OBRIGATORIO = {
  idChave: "Selecione a chave do empréstimo.",
  idFuncionario: "Selecione na lista quem está a levar a chave.",
};

// Navegação da página. A ordem aqui é a ordem das tabs no ecrã
const TABS: { label: string; rota: string }[] = [
  { label: "Emprestadas", rota: "emprestadas" },
  { label: "Inventário", rota: "inventario" },
  { label: "Histórico de Empréstimos", rota: "historico" },
];

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private erros = new ErrosForm(MENSAGENS_OBRIGATORIO);

  tabs = TABS;
  totalEmprestadas$ = this.service.totalEmprestadas$;

  salvando$ = this.service.estaSalvando$;
  chavesDisponiveis$ = this.service.chavesDisponiveis$;

  emprestarModalIsOpen = false;
  emprestarForm!: FormGroup;

  constructor(
    private service: EmprestimosService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.emprestarForm = this.fb.group({
      idChave: [null, [Validators.required]],
      idFuncionario: [null, [Validators.required]],
    });
  }

  // =========================================
  // ========== MODAL EMPRESTAR ==============

  abrirModalEmprestar(): void {
    this.emprestarForm.reset({ idChave: null, idFuncionario: null });
    this.erros.limpar(this.emprestarForm);
    this.service.carregarDisponiveis();
    this.emprestarModalIsOpen = true;
  }

  fecharModalEmprestar(): void {
    this.emprestarModalIsOpen = false;
  }

  // Há um <select> por edifício mas só um empréstimo: todos escrevem no
  // mesmo controle `idChave`
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
    if (!this.erros.validar(this.emprestarForm, ["idChave", "idFuncionario"]))
      return;

    const { idChave, idFuncionario } = this.emprestarForm.value;

    this.service
      .emprestarChave({ idChave, idRH: idFuncionario })
      .pipe(takeUntil(this.destroy$))
      .subscribe((sucesso) => {
        if (sucesso) this.fecharModalEmprestar();
      });
  }

  erroDoCampo(form: FormGroup, nome: string): string | null {
    return this.erros.erro(form, nome);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
