import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoginResponse, TokenResponse } from "src/app/dashboard/portaria/models/api";
import { UserInfo } from "src/app/shared/models/api";
import { environment } from "src/environments/environment.dev";

const TOKEN_KEY = "accessToken";
const USER_KEY = "seguranca";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private http: HttpClient) {}

  // TODO: Verificar o que acontece caso ocorra algum erro aqui.
  login(numeroSeguranca: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.loginApiUrl}`, {
        numeroSeguranca,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(
            USER_KEY,
            JSON.stringify({
              id: res.userId,
              nome: res.userName,
            }),
          );
        }),
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  refreshToken(): Observable<TokenResponse> {
    return this.http.get<TokenResponse>(`${environment.refreshApiUrl}`, {
      withCredentials: true,
    });
  }

  getLoggedInUser(): UserInfo | null {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  }
}
