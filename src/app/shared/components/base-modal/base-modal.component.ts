import {
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-base-modal",
  templateUrl: "./base-modal.component.html",
  styleUrls: ["./base-modal.component.scss"],
  animations: [
    trigger("overlay", [
      transition(":enter", [
        style({ opacity: 0 }),
        group([
          query("@modal", animateChild(), { optional: true }),
          animate("200ms ease", style({ opacity: 1 })),
        ]),
      ]),
      transition(":leave", [
        group([
          query("@modal", animateChild(), { optional: true }),
          animate("200ms ease", style({ opacity: 0 })),
        ]),
      ]),
    ]),
    trigger("modal", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(12px)" }),
        animate(
          "200ms ease",
          style({ opacity: 1, transform: "translateY(0)" }),
        ),
      ]),
      transition(":leave", [
        animate(
          "200ms ease",
          style({ opacity: 0, transform: "translateY(12px)" }),
        ),
      ]),
    ]),
  ],
})
export class BaseModalComponent implements OnChanges, OnDestroy {
  @Input() titulo!: string;
  @Input() subtitulo?: string;
  @Input() modalEstaAberto: boolean = false;
  @Output() fechar = new EventEmitter<void>();

  @ViewChild("dialogo") private dialogo!: ElementRef<HTMLElement>;

  private focoAnterior: HTMLElement | null = null;

  private premidoNoFundo = false;
  private soltoNoFundo = false;

  private focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  ngOnChanges(changes: SimpleChanges) {
    const mudanca = changes["modalEstaAberto"];
    if (!mudanca) return;

    document.body.style.overflow = mudanca.currentValue ? "hidden" : "";

    if (mudanca.currentValue) {
      this.focoAnterior = document.activeElement as HTMLElement | null;
    } else {
      this.devolverFoco();
    }
  }

  aoTerminarAbertura(): void {
    if (!this.modalEstaAberto || !this.dialogo) return;
    this.dialogo.nativeElement.focus();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "";
    this.devolverFoco();
  }

  @HostListener("document:keydown.escape")
  onEscape() {
    if (this.modalEstaAberto) this.fechar.emit();
  }

  aoPremirNoFundo(evento: MouseEvent): void {
    this.premidoNoFundo = this.noFundo(evento);
  }

  aoSoltarNoFundo(evento: MouseEvent): void {
    this.soltoNoFundo = this.noFundo(evento);
  }

  aoClicarNoFundo(): void {
    const foiNoFundo = this.premidoNoFundo && this.soltoNoFundo;

    this.premidoNoFundo = false;
    this.soltoNoFundo = false;

    if (foiNoFundo) this.fechar.emit();
  }

  private noFundo(evento: MouseEvent): boolean {
    return evento.target === evento.currentTarget;
  }

  @HostListener("document:keydown", ["$event"])
  onKeydown(evento: KeyboardEvent): void {
    if (!this.modalEstaAberto || evento.key !== "Tab") return;
    this.prenderFoco(evento);
  }

  private prenderFoco(evento: KeyboardEvent): void {
    if (!this.dialogo) return;

    const contentor = this.dialogo.nativeElement;
    const focaveis = this.focaveis(contentor);

    if (!focaveis.length) {
      evento.preventDefault();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativo = document.activeElement as HTMLElement | null;

    if (ativo === contentor) {
      if (!evento.shiftKey) return;

      evento.preventDefault();
      ultimo.focus();
      return;
    }

    if (!ativo || !contentor.contains(ativo)) {
      evento.preventDefault();
      (evento.shiftKey ? ultimo : primeiro).focus();
      return;
    }

    if (!evento.shiftKey && ativo === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    } else if (evento.shiftKey && ativo === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    }
  }

  private focaveis(contentor: HTMLElement): HTMLElement[] {
    const encontrados = contentor.querySelectorAll<HTMLElement>(
      this.focusableSelectors,
    );

    const alcancaveis: HTMLElement[] = [];
    for (let i = 0; i < encontrados.length; i++) {
      const elemento = encontrados[i];

      if (elemento.tabIndex >= 0 && elemento.getClientRects().length > 0) {
        alcancaveis.push(elemento);
      }
    }

    return alcancaveis;
  }

  private devolverFoco(): void {
    const anterior = this.focoAnterior;
    this.focoAnterior = null;

    if (anterior && document.body.contains(anterior)) anterior.focus();
  }
}
