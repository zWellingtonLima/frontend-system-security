import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
// import { AuthModule } from "./core/auth.module";
import { HttpClientModule } from "@angular/common/http";
import { PortariaModule } from "./dashboard/portaria/portaria.module";

import { LOCALE_ID } from "@angular/core";
import { DatePipe, registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt-PT";

registerLocaleData(localePt);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),
    SharedModule,
    HttpClientModule,
    PortariaModule,
    // AuthModule,
  ],
  // O DatePipe não é `providedIn: "root"`. Fica aqui porque quem o injeta
  // (ChaveService) é `providedIn: "root"` e não veria os providers de um
  // módulo de funcionalidade.
  providers: [{ provide: LOCALE_ID, useValue: "pt-PT" }, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
