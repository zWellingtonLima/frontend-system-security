import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-toast",
  templateUrl: "./toast.component.html",
  styleUrls: ["./toast.component.scss"],
})
export class ToastComponent {
  @Input() mensagem: string = "";
  @Input() erro: boolean = false;
  visivel: boolean = false;

  private timeoutRef: any;

  mostrar(mensagem: string): void {
    this.mensagem = mensagem;
    this.visivel = true;

    clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      this.visivel = false;
    }, 3400);
  }
}
