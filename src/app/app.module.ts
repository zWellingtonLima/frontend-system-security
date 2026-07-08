import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
// import { AuthModule } from "./core/auth.module";
import { HttpClientModule } from "@angular/common/http";
import { PortariaModule } from "./dashboard/portaria/portaria.module";

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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
