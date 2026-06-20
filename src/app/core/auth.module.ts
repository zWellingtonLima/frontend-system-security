import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthGuard } from "./guards/auth.guard";
import { AuthInterceptor } from "./interceptor/auth.interceptor";
import { AuthService } from "./services/auth.service";

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class AuthModule {}
