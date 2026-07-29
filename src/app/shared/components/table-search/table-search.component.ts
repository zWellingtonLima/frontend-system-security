import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
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
export class TableSearchComponent<T = any> implements OnInit, OnDestroy {
  @Input() campos: SearchFieldConfig[] = [];
  @Input() debounceMs = 300;

  // emite o objeto completo de filtros já "limpo"
  @Output() filtrosChange = new EventEmitter<{ [campo: string]: string }>();
  form: FormGroup = new FormGroup({});
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const group: { [key: string]: any } = {};

    this.campos
      .filter((c) => c.campo !== undefined)
      .forEach((c) => {
        group[c.campo as string] = [""];
      });

    this.form = this.fb.group(group);

    this.form.valueChanges
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

  private valorInicial(config: SearchFieldConfig<T>): string {
    // todos começam vazios, mas dá pra já preparar espaço pra defaults diferentes no futuro
    return "";
  }
  limpar(): void {
    this.form.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
