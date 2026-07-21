import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChaveService } from "../../services/api/chave.service";
import { ChavesTabConfig } from "../../models/enums";

@Component({
  selector: "app-chaves",
  templateUrl: "./chaves.component.html",
  styleUrls: ["./chaves.component.scss"],
})
export class ChavesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // MODAL
  modalIsOpen: boolean = false;
  emprestarForm!: FormGroup;

  // FILTROS E TABS
  tabs = this.service.tabs;
  tabAtiva$ = this.service.tabAtiva$;

  chaves$ = this.service.chavesList$;
  carregando$ = this.service.estaCarregandoDados$; // Loader GET

  // MODAL EMPRESTAR
  chavesDisponiveis$ = this.service.chavesDisponiveisList$;
  carregandoDisponiveis$ = this.service.estaCarregandoDisponiveis$;

  constructor(private service: ChaveService) {}

  ngOnInit() {
    this.service.inicializar();

    this.emprestarForm = new FormGroup({
      chaveEdificioA: new FormControl(""),
      chaveEdificioB: new FormControl(""),
      pessoa: new FormControl(""),
    });

    // Só uma chave por empréstimo: ao escolher num edifício, limpa o outro.
    // emitEvent: false evita que o reset dispare o valueChanges em cadeia.
    this.aoSelecionarLimparOutro("chaveEdificioA", "chaveEdificioB");
    this.aoSelecionarLimparOutro("chaveEdificioB", "chaveEdificioA");
  }

  onTabChange(tab: ChavesTabConfig): void {
    this.service.setTab(tab);
  }

  // Modal
  abrirModalEmprestar(): void {
    this.emprestarForm.reset({
      chaveEdificioA: "",
      chaveEdificioB: "",
      pessoa: "",
    });
    this.service.carregarDisponiveis();
    this.modalIsOpen = true;
  }

  fecharModal(): void {
    this.modalIsOpen = false;
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
