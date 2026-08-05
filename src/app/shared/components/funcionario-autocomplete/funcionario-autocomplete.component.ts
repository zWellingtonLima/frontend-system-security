import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Funcionario } from "../../models/funcionario";
import { FuncionarioService } from "../../services/funcionario.service";

const MAX_RESULTADOS = 8;
// Folga entre o campo e a lista, e entre a lista e o limite do ecrã.
const MARGEM = 2;
const ALTURA_MINIMA_UTIL = 120;

@Component({
  selector: "app-funcionario-autocomplete",
  templateUrl: "./funcionario-autocomplete.component.html",
  styleUrls: ["./funcionario-autocomplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FuncionarioAutocompleteComponent,
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

  /**
   * Um setter e não campo simples porque a chave pode mudar com a lista já aberta
   */
  @Input() set sugeridos(idsRH: number[]) {
    this.idsSugeridos = idsRH || [];
    this.filtrar();
  }

  @ViewChild("campo") private campo!: ElementRef<HTMLInputElement>;

  estiloLista: { [propriedade: string]: string } = {};

  texto: string = "";
  aberto: boolean = false;
  desativado: boolean = false;
  carregando: boolean = false;
  erroAoCarregar: boolean = false;

  resultados: Funcionario[] = [];
  indiceAtivo: number = -1;

  private funcionarios: Funcionario[] = [];
  private idsSugeridos: number[] = [];

  private valor: number | null = null;

  private onChange: (valor: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly aoRolar = (): void => {
    if (this.aberto) this.posicionarLista();
  };

  constructor(private service: FuncionarioService) {}

  ngOnDestroy(): void {
    this.fechar();
  }

  // ===============================================
  // ======== ControlValueAccessor ===============

  writeValue(valor: number | null): void {
    this.valor = valor;
    this.sincronizarTexto();

    if (valor != null) this.carregarLista();
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
    if (this.valor != null) {
      this.valor = null;
      this.onChange(null);
    }

    this.abrir();
  }

  onBlur(): void {
    this.onTouched();
    this.fechar();

    // Texto solto não vale: ou volta ao nome de quem está selecionado, ou
    // limpa. Senão ficaria um nome escrito sem idRH nenhum por trás.
    this.sincronizarTexto();
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
  setorFuncionario: string | null = "";
  selecionar(funcionario: Funcionario): void {
    this.setorFuncionario = funcionario.uEstorg;
    this.valor = funcionario.idRH;
    this.texto = this.nomeDe(funcionario);
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

  isSugerido(funcionario: Funcionario): boolean {
    return this.idsSugeridos.indexOf(funcionario.idRH) !== -1;
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

    const espacoAbaixo = window.innerHeight - campo.bottom - MARGEM * 2;
    const espacoAcima = campo.top - MARGEM * 2;
    const abrirParaCima =
      espacoAbaixo < ALTURA_MINIMA_UTIL && espacoAcima > espacoAbaixo;

    this.estiloLista = {
      left: `${campo.left}px`,
      width: `${campo.width}px`,
      maxHeight: `${abrirParaCima ? espacoAcima : espacoAbaixo}px`,
      ...(abrirParaCima
        ? { bottom: `${window.innerHeight - campo.top + MARGEM}px` }
        : { top: `${campo.bottom + MARGEM}px` }),
    };
  }

  private carregarLista(): void {
    if (this.funcionarios.length || this.carregando || this.erroAoCarregar)
      return;

    this.carregando = true;

    this.service.listar().subscribe({
      next: (lista) => {
        this.funcionarios = lista;
        this.carregando = false;

        // Só resolve o nome se já houver um idRH à espera. Sem isso, apagava o
        // que o utilizador tivesse escrito enquanto a lista não chegava.
        if (this.valor != null) this.sincronizarTexto();

        this.filtrar();
      },
      error: () => {
        this.carregando = false;
        this.erroAoCarregar = true;
      },
    });
  }

  // Põe o campo a mostrar o nome de quem está escolhido. Com o campo a vazio,
  // ou com um idRH que a lista ainda não trouxe, fica em branco.
  private sincronizarTexto(): void {
    const escolhido = this.valor == null ? null : this.acharPorIdRH(this.valor);
    this.texto = escolhido ? this.nomeDe(escolhido) : "";
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

    // Ordenar antes de cortar: senão um sugerido em 40.º nunca chegava ao topo.
    this.resultados = this.ordenar(correspondencias).slice(0, MAX_RESULTADOS);
    this.indiceAtivo = this.resultados.length ? 0 : -1;
  }

  private ordenar(lista: Funcionario[]): Funcionario[] {
    if (!this.idsSugeridos.length) return lista;

    const sugeridos = this.idsSugeridos
      .map((idRH) => lista.find((f) => f.idRH === idRH))
      .filter((f): f is Funcionario => !!f);

    if (!sugeridos.length) return lista;

    return [...sugeridos, ...lista.filter((f) => !this.isSugerido(f))];
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
