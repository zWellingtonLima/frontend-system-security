import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

export type TipoInputPesquisa = "texto" | "numero" | "data" | "select" | null;

export interface SearchFieldConfig<T = any> {
  campo?: keyof T | null;
  label: string;
  placeholder?: string;
  tipo?: TipoInputPesquisa; // default: 'texto'
  opcoes?: { valor: string; label: string }[]; // usado só quando tipo === 'select'
}
@Component({
  selector: "app-table-search",
  templateUrl: "./table-search.component.html",
  styleUrls: ["./table-search.component.scss"],
})
export class TableSearchComponent<T = any>
  implements OnInit, OnChanges, OnDestroy
{
  @Input() campos: SearchFieldConfig<T>[] = [];
  @Input() dados: T[] = []; // <── NOVO
  @Input() debounceMs = 300;
  @Input() limparPedido: Subject<void> = new Subject<void>();

  @Output() resultado = new EventEmitter<T[]>(); // <── NOVO (dados filtrados)
  @Output() filtrosChange = new EventEmitter<{ [K in keyof T]?: string }>();

  form: FormGroup = new FormGroup({});
  private destroy$ = new Subject<void>();
  private formSubscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.limparPedido.subscribe(() => {
      this.limpar();
    });
    this.montarForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.limparExterno && changes.limparExterno.currentValue === true) {
      this.limpar();
    }
    if (changes.campos && !changes.campos.firstChange) {
      this.montarForm();
    }

    if (changes.dados && !changes.dados.firstChange) {
      this.aplicarFiltro(); // <── Refiltra quando dados mudam
    }
  }

  private montarForm(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }

    const group: { [key: string]: any } = {};

    this.campos
      .filter((c) => c.campo !== undefined)
      .forEach((c) => {
        group[c.campo as string] = [""];
      });

    this.form = this.fb.group(group);

    this.formSubscription = this.form.valueChanges
      .pipe(
        debounceTime(this.debounceMs),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.destroy$),
      )
      .subscribe((valores) => {
        const filtrosLimpos = Object.keys(valores)
          .filter((k) => valores[k] !== null && valores[k] !== "")
          .reduce((acc, k) => ({ ...acc, [k]: String(valores[k]).trim() }), {});

        this.filtrosChange.emit(filtrosLimpos);
        this.aplicarFiltro(filtrosLimpos); // <── Filtra automaticamente
      });
  }

  private aplicarFiltro(filtros?: { [campo: string]: string }): void {
    const filtrosUsar = filtros ? filtros : this.form.value;

    const filtrosLimpos: Record<string, string> = Object.keys(filtrosUsar)
      .filter((k) => filtrosUsar[k] !== null && filtrosUsar[k] !== "")
      .reduce(
        (acc, k) => {
          acc[k] = String(filtrosUsar[k]).trim();
          return acc;
        },
        {} as Record<string, string>,
      );

    if (!Object.keys(filtrosLimpos).length) {
      this.resultado.emit(this.dados);
      return;
    }

    const filtrados = this.dados.filter((item: T) =>
      Object.keys(filtrosLimpos).every((campo) =>
        this.normalizar(String(item[campo as keyof T] || ""))
          .toLowerCase()
          .includes(this.normalizar(filtrosLimpos[campo])),
      ),
    );

    this.resultado.emit(filtrados);
  }

  limpar(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.controls[key].setValue("");
    });

    this.resultado.emit(this.dados);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize("NFD") // separa acentos
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/ç/g, "c") // remove cedilha
      .replace(/\s+/g, ""); // remove espaços
  }
}
