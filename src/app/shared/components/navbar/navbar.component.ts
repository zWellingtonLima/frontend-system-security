import { Component, EventEmitter, Output } from "@angular/core";

interface NavItem {
  title: string;
  icon: string;
  path: string;
}

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  isCollapsed = false;
  @Output() navToggled = new EventEmitter<boolean>();

  navItems: NavItem[] = [
    { title: "Dashboard", icon: "ft-home", path: "/dashboard" },
    { title: "Movimentações", icon: "ft-repeat", path: "/movimentacoes" },
    { title: "Chaves", icon: "icon-key", path: "/chaves" },
    { title: "Ocorrências", icon: "icon-book-open", path: "/ocorrencias" },
    { title: "Consumos", icon: "icon-note", path: "/consumos" },
  ];

  onToggle() {
    this.isCollapsed = !this.isCollapsed;
    this.navToggled.emit(this.isCollapsed);
  }
}
