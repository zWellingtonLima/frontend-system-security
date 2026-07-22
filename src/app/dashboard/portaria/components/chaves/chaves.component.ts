import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder, FormGroup,
  Validators
} from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChaveService } from "../../services/api/chave.service";
import { ChavesTabConfig } from "../../models/enums";
import { ChaveViewModel } from "../../models/api";

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // MODAL
  emprestarModalIsOpen: boolean = false;
  atualizarModalIsOpen: boolean = true;
  emprestarForm!: FormGroup;
  atualizarForm!: FormGroup;

  // FILTROS E TABS
  tabs = this.service.tabs;
  tabAtiva$ = this.service.tabAtiva$;

  chaves$ = this.service.chavesList$;
  carregando$ = this.service.estaCarregandoDados$; // Loader GET

  // MODAL EMPRESTAR
  chavesDisponiveis$ = this.service.chavesDisponiveisList$;
  carregandoDisponiveis$ = this.service.estaCarregandoDisponiveis$;

  constructor(
    private service: ChaveService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.service.inicializar();

    this.emprestarForm = this.fb.group({
      chaveEdificioA: [""],
      chaveEdificioB: [""],
      pessoa: [""],
    });

    this.atualizarForm = this.fb.group({
      chaveInfo: this.fb.group({
        edificio: [""],
        codigoChave: [""],
        sala: [""],
        horaEmprestimo: [""],
      }),
      emprestimo: this.fb.group({
        funcionario: ["", [Validators.required]],
        chaveEscolhida: [""],
      }),
      devolucao: this.fb.group({
        devolvidaPor: [""],
      }),
    });

    // Só uma chave por empréstimo: ao escolher num edifício, limpa o outro.
    // emitEvent: false evita que o reset dispare o valueChanges em cadeia.
    this.aoSelecionarLimparOutro("chaveEdificioA", "chaveEdificioB");
    this.aoSelecionarLimparOutro("chaveEdificioB", "chaveEdificioA");
  }

  onTabChange(tab: ChavesTabConfig): void {
    this.service.setTab(tab);
  }

  // MODAL EMPRESTAR
  abrirModalEmprestar(): void {
    this.emprestarForm.reset({
      chaveEdificioA: "",
      chaveEdificioB: "",
      pessoa: "",
    });
    this.service.carregarDisponiveis();
    this.emprestarModalIsOpen = true;
  }

  fecharModalEmprestar(): void {
    this.emprestarModalIsOpen = false;
  }

  // MODAL ATUALIZAR
  abrirModalAtualizar(emprestimo: ChaveViewModel): void {
    console.log(emprestimo);

    this.atualizarForm.reset({
      chaveInfo: {
        edificio: emprestimo.edificioLabel,
        codigoChave: emprestimo.codigo,
        sala: `${emprestimo.sala} · ${emprestimo.pisoLabel}`,
        horaEmprestimo: emprestimo.desde,
      },
    });
    this.atualizarForm.patchValue({
      devolucao: {
        devolvidaPor: emprestimo.pessoa,
      },
      emprestimo: {
        funcionario: emprestimo.pessoa,
        chaveEscolhida: emprestimo.id
      }
    });

    this.atualizarModalIsOpen = true;
  }

  fecharModalAtualizar(): void {
    this.atualizarModalIsOpen = false;
  }

  trackById(_: number, chave: { id: number }) {
    return chave.id;
  }

  private aoSelecionarLimparOutro(origem: string, alvo: string): void {
    this.emprestarForm
      .get(origem)!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((valor) => {
        if (valor)
          this.emprestarForm.get(alvo)!.reset("", { emitEvent: false });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
