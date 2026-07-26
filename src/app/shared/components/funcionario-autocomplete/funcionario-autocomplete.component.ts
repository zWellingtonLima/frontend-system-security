import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Funcionario } from "../../models/funcionario";
import { FuncionarioService } from "../../services/funcionario.service";

const MAX_RESULTADOS = 8;

// Tem de bater certo com o max-height do .autocomplete__lista no SCSS: é o
// valor usado para decidir se a lista ainda cabe por baixo do campo.
const ALTURA_MAX_LISTA = 240;

@Component({
  selector: "app-funcionario-autocomplete",
  templateUrl: "./funcionario-autocomplete.component.html",
  styleUrls: ["./funcionario-autocomplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FuncionarioAutocompleteComponent),
      multi: true,
    },
  ],
})
export class FuncionarioAutocompleteComponent
  implements ControlValueAccessor, OnDestroy
{
  @Input() id: string = "";
  @Input() placeholder: string = "Escreva o nome do funcionário...";

  // O formulário continua dono da validação do campo
  @Input() temErro: boolean = false;

  @ViewChild("campo") private campo!: ElementRef<HTMLInputElement>;

  estiloLista: { [propriedade: string]: string } = {};

  private destroy$ = new Subject<void>();

  texto: string = "";
  aberto: boolean = false;
  desativado: boolean = false;
  carregando: boolean = false;
  erroAoCarregar: boolean = false;

  resultados: Funcionario[] = [];
  indiceAtivo: number = -1;

  private funcionarios: Funcionario[] = [];
  private selecionado: Funcionario | null = null;

  private idPendente: number | null = null;

  private onChange: (valor: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly aoRolar = (): void => {
    if (this.aberto) this.posicionarLista();
  };

  constructor(private service: FuncionarioService) {}

  ngOnDestroy(): void {
    this.fechar();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===============================================
  // ========ControlValueAccessor ===============

  writeValue(valor: number | null): void {
    if (valor == null) {
      this.selecionado = null;
      this.idPendente = null;
      this.texto = "";
      return;
    }

    const achado = this.acharPorIdRH(valor);

    if (achado) {
      this.definirSelecionado(achado);
      return;
    }

    this.idPendente = valor;
    this.texto = "";
    this.carregarLista();
  }

  registerOnChange(fn: (valor: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desativado: boolean): void {
    this.desativado = desativado;
  }

  // ===============================================
  // =========== INTERAÇÃO ======================

  onFocus(): void {
    this.abrir();
  }

  @HostListener("window:resize")
  onRedimensionar(): void {
    if (this.aberto) this.posicionarLista();
  }

  onInput(evento: Event): void {
    this.texto = (evento.target as HTMLInputElement).value;

    // Escrever invalida a escolha anterior: enquanto não houver alguém
    // selecionado da lista, o formulário fica a null e o `required` acusa.
    if (this.selecionado) {
      this.selecionado = null;
      this.onChange(null);
    }

    this.abrir();
  }

  onBlur(): void {
    this.onTouched();
    this.fechar();

    // Texto solto não vale: ou volta ao nome de quem está selecionado, ou
    // limpa. Senão ficaria um nome escrito sem idRH nenhum por trás.
    this.texto = this.selecionado ? this.nomeDe(this.selecionado) : "";
  }

  onKeydown(evento: KeyboardEvent): void {
    if (evento.key === "Escape") {
      this.fechar();
      return;
    }

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      if (!this.aberto) this.abrir();
      this.mover(evento.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (evento.key === "Enter") {
      if (this.aberto && this.indiceAtivo >= 0) {
        evento.preventDefault();
        this.selecionar(this.resultados[this.indiceAtivo]);
      }
    }
  }

  selecionar(funcionario: Funcionario): void {
    this.definirSelecionado(funcionario);
    this.onChange(funcionario.idRH);
    this.fechar();
    this.indiceAtivo = -1;
  }

  tentarNovamente(): void {
    this.erroAoCarregar = false;
    this.carregarLista();
  }

  nomeDe(funcionario: Funcionario): string {
    return funcionario.nomeFuncionario || `(sem nome) · ${funcionario.idRH}`;
  }

  // ===============================================
  // ============= UTILITARIOS ===================

  private abrir(): void {
    if (!this.aberto) {
      this.aberto = true;
      document.addEventListener("scroll", this.aoRolar, true);
    }

    this.carregarLista();
    this.filtrar();
    this.posicionarLista();
  }

  private fechar(): void {
    if (!this.aberto) return;

    this.aberto = false;
    document.removeEventListener("scroll", this.aoRolar, true);
  }

  private posicionarLista(): void {
    if (!this.campo) return;

    const campo = this.campo.nativeElement.getBoundingClientRect();
    const espacoAbaixo = window.innerHeight - campo.bottom;
    const abrirParaCima =
      espacoAbaixo < ALTURA_MAX_LISTA && campo.top > espacoAbaixo;

    this.estiloLista = {
      left: `${campo.left}px`,
      width: `${campo.width}px`,
      ...(abrirParaCima
        ? { bottom: `${window.innerHeight - campo.top + 2}px` }
        : { top: `${campo.bottom + 2}px` }),
    };
  }

  private carregarLista(): void {
    if (this.funcionarios.length || this.carregando || this.erroAoCarregar)
      return;

    this.carregando = true;

    this.service
      .listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lista) => {
          this.funcionarios = lista;
          this.carregando = false;
          this.resolverPendente();
          this.filtrar();
        },
        error: () => {
          this.carregando = false;
          this.erroAoCarregar = true;
        },
      });
  }

  private resolverPendente(): void {
    if (this.idPendente == null) return;

    const achado = this.acharPorIdRH(this.idPendente);
    if (achado) this.definirSelecionado(achado);

    this.idPendente = null;
  }

  private definirSelecionado(funcionario: Funcionario): void {
    this.selecionado = funcionario;
    this.texto = this.nomeDe(funcionario);
    this.idPendente = null;
  }

  private acharPorIdRH(idRH: number): Funcionario | null {
    return this.funcionarios.find((f) => f.idRH === idRH) || null;
  }

  private filtrar(): void {
    const termo = this.normalizar(this.texto);

    const correspondencias = termo
      ? this.funcionarios.filter(
          (f) => this.normalizar(this.nomeDe(f)).indexOf(termo) !== -1,
        )
      : this.funcionarios;

    this.resultados = correspondencias.slice(0, MAX_RESULTADOS);
    this.indiceAtivo = this.resultados.length ? 0 : -1;
  }

  private mover(passo: number): void {
    if (!this.resultados.length) return;

    const total = this.resultados.length;
    this.indiceAtivo = (this.indiceAtivo + passo + total) % total;
  }

  // Sem acentos e em minúsculas, para "goncalves" encontrar "Gonçalves".
  private normalizar(texto: string): string {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
