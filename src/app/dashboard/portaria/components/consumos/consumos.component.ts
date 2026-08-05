import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  ConsumoLeitura,
  EdificiosResponse,
  TipoConsumoEnum,
  TipoConsumoType,
  UltimaLeitura,
} from "../../models/consumo.model";
import {
  ConsumosService,
  FILTROS_VAZIOS_CONSUMOS,
} from "../../services/api/consumos.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastComponent } from "src/app/shared/components/toast/toast.component";

@Component({
  selector: "app-consumos",
  templateUrl: "./consumos.component.html",
  styleUrls: ["./consumos.component.scss"],
})
export class ConsumosComponent implements OnInit, OnDestroy {
  constructor(
    private consumoService: ConsumosService,
    private fb: FormBuilder,
  ) {}

  private destroy$ = new Subject<void>();

  filtrosForm!: FormGroup;
  paginador = this.consumoService.paginador;

  // ── Cards "leituras actuais" ──
  ultimaAgua: UltimaLeitura | null = null;
  ultimaEletricidade: UltimaLeitura | null = null;
  ultimaGas: UltimaLeitura | null = null;

  // ── Tabela / paginação ──
  leituras: ConsumoLeitura[] = [];
  carregando = this.consumoService.estaCarregandoDados$;

  ngOnInit() {
    this.consumoService.inicializar();
    this.filtrosForm = this.fb.group(FILTROS_VAZIOS_CONSUMOS);
    this.iniciarFormulario();
    this.chamarEdificios();
    this.carregarConsumos();
    this.carregarUltimas();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  aplicarFiltros(): void {
    this.consumoService.aplicarFiltros(this.filtrosForm.value);
  }

  limparFiltros(): void {
    this.filtrosForm.reset(FILTROS_VAZIOS_CONSUMOS);
    this.consumoService.limparFiltros(this.abaAtiva);
  }

  carregarAposAlteracao() {
    this.consumoService.listar();
    this.carregarUltimas();
  }

  // ─────────────────────────────────────────────
  // CARREGA OS DADOS PARA A TABELAS
  // ─────────────────────────────────────────────
  carregarConsumos(): void {
    this.consumoService.listaConsumos$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.leituras = res;
        },
        error: () => {
          this.mostrarToast("Erro ao carregar as leituras.");
        },
      });
  }

  // ─────────────────────────────────────────────
  // CARREGA AS ULTIMAS LEITURAS PARA POR NOS CARDS onInit
  // ─────────────────────────────────────────────
  carregarUltimas(): void {
    this.consumoService
      .ultimas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          res.forEach((item) => {
            switch (item.tipoConsumo) {
              case this.tipoConsumo.AGUA:
                this.leiturasAgua = item.lista;
                break;
              case this.tipoConsumo.ELETRICIDADE:
                this.leiturasEletricidade = item.lista;
                break;
              case this.tipoConsumo.GAS:
                this.leiturasGas = item.lista;
                break;
            }
          });
        },
        error: () => {
          this.mostrarToast("Erro ao carregar as leituras.");
        },
      });
  }

  // ─────────────────────────────────────────────
  // AGUA - ELETRICIDADE - GAS | MUDANÇA NO STYLE E CHAMADA DOS DADOS
  // ─────────────────────────────────────────────
  abaAtiva: TipoConsumoType = "AGUA";
  readonly tipoConsumo = TipoConsumoEnum;

  selecionarAba(abaStyle: TipoConsumoType): void {
    if (this.abaAtiva === abaStyle) {
      return;
    }
    this.abaAtiva = abaStyle;
    this.limparFiltros();
    this.paginador.primeiraPagina();
    this.filtrosForm.patchValue({ tipo: abaStyle });
    this.aplicarFiltros();
  }

  // ─────────────────────────────────────────────
  // FORMULARIO DE REGISTAR LEITURA MODAL
  // ─────────────────────────────────────────────
  registarLeituraForm!: FormGroup;

  unidadeAtual = null;
  consumoCalculadoPreview: number | null = 0;
  ultimaLieituraForm: UltimaLeitura | null = null;
  edificios: EdificiosResponse[] = [];
  consumoElevado: number = 800;

  modalExcluirOpen: boolean = false;
  modalIsOpen: boolean = false;
  modoEdicao: boolean = false;
  modoEliminar: boolean = false;
  botaoEnvio: string = "Registar";

  iniciarFormulario() {
    this.registarLeituraForm = this.fb.group({
      id: [null],
      tipoConsumo: ["", Validators.required],
      edificioId: ["", Validators.required],
      leituraAtual: [0, [Validators.required, Validators.min(0)]],
      observacao: ["", [Validators.maxLength(255)]],
    });
  }

  registarLeitura() {
    if (this.registarLeituraForm.valid) {
      this.consumoService
        .criar({
          valorLeitura: this.registarLeituraForm.value.leituraAtual,
          notas: this.registarLeituraForm.value.observacao,
          edificioId: this.registarLeituraForm.value.edificioId,
          tipoConsumo: this.registarLeituraForm.value.tipoConsumo,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.mostrarToast("Leitura registada com sucesso!");
            this.carregarAposAlteracao();
            this.alternarVisibilidadeModal();
          },
          error: () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao registar a leitura.");
          },
        });
    }
  }

  registarAtualizar() {
    if (this.registarLeituraForm.valid) {
      this.consumoService
        .atualizar(this.registarLeituraForm.value.id, {
          valorLeitura: this.registarLeituraForm.value.leituraAtual,
          notas: this.registarLeituraForm.value.observacao,
          edificioId: this.registarLeituraForm.value.edificioId,
          tipoConsumo: this.registarLeituraForm.value.tipoConsumo,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.carregarAposAlteracao();
            this.mostrarToast("Leitura atualizada com sucesso!");
            this.alternarVisibilidadeModal();
          },
          error: () => {
            this.alternarVisibilidadeModal();
            this.mostrarToast("Erro ao atualizar a leitura.");
          },
        });
    }
  }

  submeterEliminar() {
    this.consumoService
      .eliminar(this.leituraIdParaExcluir)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.modalExcluirOpen = false;
          this.leituraIdParaExcluir = undefined;
          this.carregarAposAlteracao();
          this.mostrarToast("Leitura excluída com sucesso!");
        },
        error: () => {
          this.modalExcluirOpen = false;
          this.mostrarToast("Erro ao excluir leitura.");
        },
      });
  }

  chamarEdificios() {
    this.consumoService
      .preencherEdificio()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.edificios = res;
        },
        error: () => {
          this.mostrarToast("Erro ao carregar os dados");
        },
      });
  }

  selecionarTipoConsumo(tipo: string): void {
    this.registarLeituraForm.patchValue({ tipoConsumo: tipo });
    this.pegarUltimaLeituraForm();
  }

  onLeituraAtualChange(): void {
    const leituraAtualControl = this.registarLeituraForm.get("leituraAtual");
    const valorAtual = leituraAtualControl ? leituraAtualControl.value : null;

    const ultima = this.ultimaLieituraForm
      ? this.ultimaLieituraForm.leituraAtual
      : null;

    if (valorAtual == null || ultima == null) {
      this.consumoCalculadoPreview = null;
      return;
    }

    this.consumoCalculadoPreview = valorAtual - ultima;
  }

  pegarUltimaLeituraForm() {
    const tipoControl = this.registarLeituraForm.get("tipoConsumo");
    const edificioControl = this.registarLeituraForm.get("edificioId");

    const tipo = tipoControl ? tipoControl.value : null;
    const edificio = edificioControl ? edificioControl.value : null;

    if (!tipo || !edificio) {
      return;
    }

    this.consumoService
      .ultimaLeituraForm(tipo, edificio)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.ultimaLieituraForm = res;
      });
  }

  // ─────────────────────────────────────────────
  // FUNÇÕES DOS BOTOES DAS TABELAS PARA EDITAR/ EXLUIR
  // ─────────────────────────────────────────────
  leituraIdParaExcluir?: number;

  abrirExcluir(item: ConsumoLeitura) {
    this.modalExcluirOpen = true;
    this.leituraIdParaExcluir = item.id;
  }

  abrirEditar(item: ConsumoLeitura) {
    this.registarLeituraForm.reset();
    this.modoEdicao = true;
    this.modalIsOpen = true;
    this.botaoEnvio = "Atualizar";
    this.registarLeituraForm.patchValue(item);
  }

  alternarVisibilidadeModal() {
    this.modalIsOpen = !this.modalIsOpen;

    if (this.modalIsOpen) {
      this.modoEdicao = false;
      this.botaoEnvio = "Registar";
    }

    this.registarLeituraForm.reset();
    this.ultimaLieituraForm = null;
    this.consumoCalculadoPreview = null;
  }

  Unidades = {
    ELETRICIDADE: "kWh",
    AGUA: "m³",
    GAS: "m³",
  };

  leiturasAgua?: UltimaLeitura[];
  leiturasEletricidade?: UltimaLeitura[];
  leiturasGas?: UltimaLeitura[];

  // ── Toast ──
  @ViewChild(ToastComponent) toast!: ToastComponent;
  mostrarToast(msg: string): void {
    this.toast.mostrar(msg);
  }
}
