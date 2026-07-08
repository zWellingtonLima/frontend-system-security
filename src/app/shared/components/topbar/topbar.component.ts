import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";

interface User {
  userId: number;
  userName: string;
}

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  constructor(private authService: AuthService) {}

  user: User | null = null;

  ngOnInit() {
    // this.user = this.authService.getLoggedInUser();
  }

  getInitials(name: string): string {
    if (!name) return "WL"
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase())
    return initials.join("")
  }
}
