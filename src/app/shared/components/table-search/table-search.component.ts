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

export type TipoInputPesquisa = "texto" | "numero" | "data" | "select";

export interface SearchFieldConfig<T = any> {
  campo?: keyof T;
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
  @Input() debounceMs = 300;
  @Output() filtrosChange = new EventEmitter<{ [K in keyof T]?: string }>();

  form: FormGroup = new FormGroup({});
  private destroy$ = new Subject<void>();
  private formSubscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.montarForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.campos && !changes.campos.firstChange) {
      this.montarForm(); // reconstrói o form E a assinatura junto
    }
  }

  private montarForm(): void {
    // cancela a assinatura antiga antes de criar um form novo
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
      });
  }

  limpar(): void {
    this.form.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
