import { API_BASE_URL } from "./api/api_url.js";

export async function sessionIsValid() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/index.html";
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/sessao`, {
      headers: { "X-Sessao-Id": token },
    });

    if (!res.ok) {
      sessionStorage.clear();
      window.location.replace("/index.html");
      return false;
    }

    return true;
  } catch {
    sessionStorage.clear();
    window.location.replace("/index.html");
    return false;
  }
}
