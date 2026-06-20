import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment.dev";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {}

  onSubmit(formData: any) {
    console.log(formData);
    
    this.http
      .post<any>(`${environment.loginApiUrl}`, {
        email: formData.email,
        password: formData.password,
      })
      .subscribe((res) => console.log(res));
  }
}
