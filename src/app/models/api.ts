// ------------ AUTH ---------------
export interface TokenResponse {
  accessToken: string;
}

export interface LoginResponse extends TokenResponse {
  userId: number;
  userName: string;
}
