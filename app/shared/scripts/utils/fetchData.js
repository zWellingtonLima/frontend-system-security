import { API_BASE_URL } from "../api/api_url.js";

export async function fetchData(endpoint, opcoes = {}) {
  const token = sessionStorage.getItem("token");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { "X-Sessao-Id": token }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...opcoes,
      headers: {
        ...defaultHeaders,
        ...opcoes.headers,
      },
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.clear();
      window.location.href = "/index.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    // No caso de DELETE ou outros casos que a gente nao retorna body
    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json") ? response.json() : null;
  } catch (err) {
    console.log(`Falha ao tentar carregar dados de ${endpoint}: ${err}`);
  }
}
