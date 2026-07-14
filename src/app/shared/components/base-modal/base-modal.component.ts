import { animate, style, transition, trigger } from "@angular/animations";
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
        animate("200ms ease", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("200ms ease", style({ opacity: 0 }))]),
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

  // ViewChild so consegue fazer algo depois do ngAfterViewInit
  @ViewChild("contentRef") contentRef!: ElementRef<HTMLElement>;

  private focusableSelectors = [
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
  ].join(", ");

  ngOnChanges(changes: SimpleChanges) {
    if (changes["modalEstaAberto"]) {
      document.body.style.overflow = changes["modalEstaAberto"].currentValue
        ? "hidden"
        : "";

      if (this.modalEstaAberto) {
        // Empurra a funcao para o final da callstack para permitir que as refs estejam inicializads antes de tentar acessa-las
        setTimeout(() => {
          const content = this.contentRef && this.contentRef.nativeElement;
          if (!content) return;

          const primeiroElemento = content.querySelector<HTMLElement>(
            this.focusableSelectors,
          );
          if (primeiroElemento) primeiroElemento.focus();
        }, 0);
      }
    }
  }

  // Remove o estilo sempre que o componente é destruído
  ngOnDestroy(): void {
    document.body.style.overflow = "";
  }

  @HostListener("document:keydown.escape")
  onEscape() {
    this.fechar.emit();
  }

  onOverlayClick() {
    this.fechar.emit();
  }
}
