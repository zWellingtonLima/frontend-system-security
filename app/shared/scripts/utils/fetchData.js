import { API_BASE_URL } from "../api/api_url.js";

// Erro customizado que carrega o body da resposta
export class ApiError extends Error {
  constructor(status, body) {
    // Extrai a primeira mensagem útil para o .message padrão
    const mensagem = body?.mensagens?.[0] ?? body?.erro ?? `Erro ${status}`;
    super(mensagem);
    this.status = status;
    this.body = body; // body completo disponível para quem precisar
  }
}

export async function fetchData(endpoint, opcoes = {}) {
  const token = sessionStorage.getItem("token");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { "X-Sessao-Id": token }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: opcoes.method || "GET",
      headers: {
        ...defaultHeaders,
        ...opcoes.headers,
      },
      body:
        opcoes.method === "POST" || "PUT" || "PATCH"
          ? JSON.stringify(opcoes.body)
          : undefined,
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.clear();
      window.location.href = "/index.html";
      return;
    }

    // Tenta sempre extrair o body, mesmo em erro, para enriquecer a exceção
    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error(`Falha ao tentar carregar dados de ${endpoint}: ${err}`);
  }
}
